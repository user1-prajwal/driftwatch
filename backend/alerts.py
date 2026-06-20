import os
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY      = os.getenv("BREVO_API_KEY")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL")
BREVO_SENDER_NAME  = os.getenv("BREVO_SENDER_NAME", "DriftWatch")


# Send email via Brevo API
# Works for ANY recipient — no domain needed

def send_email_alert(recipient_email, scan_result):
    """
    Sends a simple alert email via Brevo.
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

    try:
        scanned_at = datetime.fromisoformat(
            scan_result["scanned_at"]
        ).strftime("%B %d, %Y at %I:%M %p")
    except:
        scanned_at = scan_result["scanned_at"]

    # Subject line
    if critical_count > 0:
        subject = f"🔴 DriftWatch Alert — {critical_count} critical issue(s) detected"
    else:
        subject = f"🟡 DriftWatch Warning — {warning_count} warning(s) detected"

    # Problem columns only
    problem_cols = [
        r for r in scan_result["columns"]
        if "NORMAL" not in r["status"]
    ]

    # Build column rows for email
    col_lines_html = ""
    col_lines_text = ""
    for col in problem_cols:
        color  = "#ef4444" if "CRITICAL" in col["status"] else "#f59e0b"
        status = "CRITICAL" if "CRITICAL" in col["status"] else "WARNING"
        change = col.get("change_text", "")
        col_lines_html += f"""
        <div style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-weight:600;color:#1e293b;font-size:14px;">{col['column']}</span>
            <span style="color:{color};font-weight:700;font-size:13px;">{status}</span>
          </div>
          {f'<div style="font-size:13px;color:#64748b;">{change}</div>' if change else ''}
        </div>
        """
        col_lines_text += f"  • {col['column']}: {status}"
        if change:
            col_lines_text += f" — {change}"
        col_lines_text += "\n"

    # Plain text version
    plain = f"""
DriftWatch Alert
{'='*40}

Status   : {overall}
Source   : {filename}
Detected : {scanned_at}

Issues found:
{col_lines_text}

Open DriftWatch to see full details and AI explanation:
https://driftwatch-lovat.vercel.app/

— DriftWatch
    """.strip()

    # HTML version
    top_color = "#ef4444" if critical_count > 0 else "#f59e0b"
    html = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Top bar -->
    <div style="background:{top_color};padding:24px 28px;">
      <div style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;margin-bottom:6px;">
        🌊 DriftWatch
      </div>
      <div style="color:#fff;font-size:22px;font-weight:800;line-height:1.2;">
        {'🔴 Critical Alert' if critical_count > 0 else '🟡 Warning Alert'}
      </div>
    </div>

    <!-- Body -->
    <div style="padding:28px;">

      <p style="font-size:15px;color:#475569;margin:0 0 20px;line-height:1.7;">
        An anomaly was detected in
        <strong style="color:#1e293b;">{filename}</strong>
        on {scanned_at}.
      </p>

      <!-- Affected columns -->
      <div style="background:#f8fafc;border-radius:12px;padding:16px 18px;margin-bottom:24px;border:1px solid #e2e8f0;">
        <div style="font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.06em;margin-bottom:10px;">
          WHAT WAS AFFECTED
        </div>
        {col_lines_html}
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:8px;">
        <a href="https://driftwatch-lovat.vercel.app/"
           style="display:inline-block;padding:14px 36px;background:#6366f1;color:#fff;
                  text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;
                  letter-spacing:0.01em;">
          View Full Details →
        </a>
      </div>
      <p style="text-align:center;font-size:12px;color:#94a3b8;margin:10px 0 0;">
        Click to see AI explanation and recommended actions.
      </p>

    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:16px 28px;border-top:1px solid #e2e8f0;text-align:center;">
      <div style="font-size:12px;color:#94a3b8;">
        Sent by <strong style="color:#6366f1;">DriftWatch</strong>
        — AI-powered data quality monitor
      </div>
    </div>

  </div>
</body>
</html>
    """

    # Send via Brevo API
    payload = {
        "sender": {
            "name":  BREVO_SENDER_NAME,
            "email": BREVO_SENDER_EMAIL,
        },
        "to": [{"email": recipient_email}],
        "subject": subject,
        "htmlContent": html,
        "textContent": plain,
    }

    headers = {
        "accept":       "application/json",
        "content-type": "application/json",
        "api-key":      BREVO_API_KEY,
    }

    try:
        print(f"📧 Sending alert to {recipient_email} via Brevo...")
        response = requests.post(
            "https://api.brevo.com/v3/smtp/email",
            json    = payload,
            headers = headers,
            timeout = 15,
        )

        if response.status_code in [200, 201]:
            print(f"✅ Email sent to {recipient_email}")
            return {"sent": True, "recipient": recipient_email, "subject": subject}
        else:
            error_msg = response.json().get("message", response.text)
            print(f"❌ Brevo error: {error_msg}")
            return {"sent": False, "reason": error_msg}

    except Exception as e:
        print(f"❌ Email error: {e}")
        return {"sent": False, "reason": str(e)}