# import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

SENDER_EMAIL    = os.getenv("EMAIL_SENDER")
SENDER_PASSWORD = os.getenv("EMAIL_PASSWORD")

# SIMPLE email — just what happened + link

def send_email_alert(recipient_email, scan_result):
    """
    Sends a simple alert email.
    Only sent when anomaly found (WARNING or CRITICAL).
    Normal results → no email sent.
    """

    overall = scan_result["summary"]["overall_status"]

    # No email if everything is normal
    if overall == "NORMAL":
        print("✅ Everything normal — no email sent.")
        return {"sent": False, "reason": "No anomalies detected"}

    critical_count = scan_result["summary"]["critical"]
    warning_count  = scan_result["summary"]["warnings"]
    filename       = scan_result.get("filename", "your data")
    scanned_at     = datetime.fromisoformat(
        scan_result["scanned_at"]
    ).strftime("%B %d, %Y at %I:%M %p")

    # Subject line
    if critical_count > 0:
        subject = f"🔴 DriftWatch Alert — {critical_count} critical issue(s) detected"
    else:
        subject = f"🟡 DriftWatch Warning — {warning_count} warning(s) detected"

    # Which columns had issues
    problem_cols = [
        r for r in scan_result["columns"]
        if "NORMAL" not in r["status"]
    ]

    # Build simple column lines
    col_lines_html = ""
    col_lines_text = ""
    for col in problem_cols:
        color  = "#ef4444" if "CRITICAL" in col["status"] else "#f59e0b"
        status = "CRITICAL" if "CRITICAL" in col["status"] else "WARNING"
        col_lines_html += f"""
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f1f5f9; font-size:14px;">
          <span style="color:#1e293b; font-weight:500;">{col['column']}</span>
          <span style="color:{color}; font-weight:700;">{status}</span>
        </div>
        """
        col_lines_text += f"  • {col['column']}: {status}\n"

    # Plain text version
    plain = f"""
DriftWatch Alert
{'='*40}

Status    : {overall}
Source    : {filename}
Detected  : {scanned_at}

Issues found:
{col_lines_text}

Open DriftWatch to see full details and AI explanation.

— DriftWatch
    """.strip()

    # HTML version — clean and simple
    html = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Top bar -->
    <div style="background:{'#ef4444' if critical_count > 0 else '#f59e0b'};padding:20px 28px;">
      <div style="color:#fff;font-size:13px;font-weight:600;opacity:0.85;margin-bottom:4px;">🌊 DriftWatch</div>
      <div style="color:#fff;font-size:20px;font-weight:800;">
        {'🔴 Critical Alert' if critical_count > 0 else '🟡 Warning Alert'}
      </div>
    </div>

    <!-- Body -->
    <div style="padding:28px;">
      <p style="font-size:15px;color:#475569;margin:0 0 20px;line-height:1.6;">
        An anomaly was detected in <strong style="color:#1e293b;">{filename}</strong> on {scanned_at}.
      </p>

      <!-- Affected columns -->
      <div style="background:#f8fafc;border-radius:10px;padding:16px;margin-bottom:24px;">
        <div style="font-size:12px;font-weight:700;color:#94a3b8;letter-spacing:0.05em;margin-bottom:8px;">AFFECTED COLUMNS</div>
        {col_lines_html}
      </div>

      <!-- CTA button -->
      <div style="text-align:center;">
        <a href="http://localhost:3000"
           style="display:inline-block;padding:13px 32px;background:#6366f1;color:#fff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;">
          View Full Details →
        </a>
        <p style="font-size:12px;color:#94a3b8;margin-top:12px;">
          Open DriftWatch to see AI explanation and recommended actions.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:16px 28px;text-align:center;border-top:1px solid #e2e8f0;">
      <div style="font-size:12px;color:#94a3b8;">
        Sent by <strong style="color:#6366f1;">DriftWatch</strong> — AI-powered data quality monitor
      </div>
    </div>

  </div>
</body>
</html>
    """

    # Build and send email
    msg             = MIMEMultipart("alternative")
    msg["Subject"]  = subject
    msg["From"]     = f"DriftWatch <{SENDER_EMAIL}>"
    msg["To"]       = recipient_email

    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html,  "html"))

    try:
        import resend
        resend.api_key = os.getenv("RESEND_API_KEY")

        print(f"📧 Sending alert to {recipient_email}...")
        
        response = resend.Emails.send({
            "from":    "DriftWatch <onboarding@resend.dev>",
            "to":      [recipient_email],
            "subject": subject,
            "html":    html,
            "text":    plain,
        })

        print(f"✅ Email sent to {recipient_email}")
        return {"sent": True, "recipient": recipient_email, "subject": subject}

    except Exception as e:
        print(f"❌ Email error: {e}")
        return {"sent": False, "reason": str(e)}