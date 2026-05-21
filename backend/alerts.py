import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

SENDER_EMAIL    = os.getenv("EMAIL_SENDER")
SENDER_PASSWORD = os.getenv("EMAIL_PASSWORD")


# Build plain text version of the alert
# (fallback for email clients that don't show HTML)

def build_plain_text(scan_result):
    lines = []
    lines.append("🌊 DRIFTWATCH ALERT")
    lines.append("=" * 50)
    lines.append(f"File      : {scan_result['filename']}")
    lines.append(f"Status    : {scan_result['summary']['overall_status']}")
    lines.append(f"Scanned   : {scan_result['scanned_at']}")
    lines.append(f"Sensitivity: {scan_result['sensitivity'].upper()}")
    lines.append("")
    lines.append(f"Critical columns : {scan_result['summary']['critical']}")
    lines.append(f"Warning columns  : {scan_result['summary']['warnings']}")
    lines.append(f"Normal columns   : {scan_result['summary']['normal']}")
    lines.append("")

    for col in scan_result["columns"]:
        if "NORMAL" in col["status"]:
            continue  # only include problem columns in email

        lines.append("─" * 50)
        lines.append(f"COLUMN: {col['column'].upper()}")
        lines.append(f"Status   : {col['status']}")
        lines.append(f"Severity : {col['severity']} / 100")

        if col["type"] == "numeric":
            lines.append(f"Latest   : {col['today_value']}")
            lines.append(f"Normal   : {col['baseline_mean']} ± {col['baseline_std']}")
            lines.append(f"Z-score  : {col['z_score']}")
        else:
            lines.append("Distribution shift detected:")
            for cat, pct in col.get("today_pct", {}).items():
                baseline = col.get("baseline_pct", {}).get(cat, 0)
                lines.append(f"  {cat}: today {pct}%  (normal {baseline}%)")

        if col.get("gemini_explanation"):
            lines.append("")
            lines.append("💡 AI EXPLANATION:")
            lines.append(col["gemini_explanation"])

        lines.append("")

    lines.append("─" * 50)
    lines.append("Sent by DriftWatch — AI-powered data quality monitor")
    return "\n".join(lines)


# Build HTML version of the alert
# (looks professional in Gmail, Outlook, etc.)

def build_html(scan_result):
    overall   = scan_result["summary"]["overall_status"]
    color_map = {"CRITICAL": "#ef4444", "WARNING": "#f59e0b", "NORMAL": "#22c55e"}
    top_color = color_map.get(overall, "#6366f1")

    # Build column sections — only show problem columns
    column_html = ""
    for col in scan_result["columns"]:
        if "NORMAL" in col["status"]:
            continue

        col_color = "#ef4444" if "CRITICAL" in col["status"] else "#f59e0b"

        # Numeric detail
        if col["type"] == "numeric":
            detail_html = f"""
            <table style="width:100%; border-collapse:collapse; margin-top:10px;">
              <tr>
                <td style="background:#f9fafb; padding:8px 12px; border-radius:6px; text-align:center; width:33%">
                  <div style="font-size:11px; color:#9ca3af">Latest value</div>
                  <div style="font-size:20px; font-weight:700; color:{col_color}">{col['today_value']}</div>
                </td>
                <td style="width:2%"></td>
                <td style="background:#f9fafb; padding:8px 12px; border-radius:6px; text-align:center; width:33%">
                  <div style="font-size:11px; color:#9ca3af">Normal average</div>
                  <div style="font-size:20px; font-weight:700; color:#111827">{col['baseline_mean']}</div>
                </td>
                <td style="width:2%"></td>
                <td style="background:#f9fafb; padding:8px 12px; border-radius:6px; text-align:center; width:33%">
                  <div style="font-size:11px; color:#9ca3af">Z-score</div>
                  <div style="font-size:20px; font-weight:700; color:#111827">{col['z_score']}</div>
                </td>
              </tr>
            </table>
            """
        else:
            rows = ""
            for cat, pct in col.get("today_pct", {}).items():
                baseline = col.get("baseline_pct", {}).get(cat, 0)
                rows += f"""
                <tr>
                  <td style="padding:6px 0; font-size:13px; color:#374151; font-weight:500">{cat}</td>
                  <td style="padding:6px 0; font-size:13px; color:#9ca3af; text-align:right">normal {baseline}%</td>
                  <td style="padding:6px 0; font-size:13px; color:{col_color}; font-weight:700; text-align:right">today {pct}%</td>
                </tr>
                """
            detail_html = f"""
            <table style="width:100%; margin-top:10px; border-collapse:collapse">{rows}</table>
            """

        # Severity bar
        sev_color = "#ef4444" if col["severity"] >= 75 else "#f59e0b" if col["severity"] >= 40 else "#22c55e"
        severity_bar = f"""
        <div style="margin-top:12px">
          <div style="display:flex; justify-content:space-between; font-size:12px; color:#6b7280; margin-bottom:4px">
            <span>Severity</span>
            <span style="font-weight:600; color:{sev_color}">{col['severity']} / 100</span>
          </div>
          <div style="background:#e5e7eb; border-radius:999px; height:6px">
            <div style="width:{col['severity']}%; background:{sev_color}; border-radius:999px; height:6px"></div>
          </div>
        </div>
        """

        # Gemini explanation
        explanation_html = ""
        if col.get("gemini_explanation"):
            exp = col["gemini_explanation"]

            # Parse sections
            import re
            what   = re.search(r"WHAT HAPPENED:\n(.*?)(?=\nPOSSIBLE CAUSES:)", exp, re.DOTALL)
            causes = re.search(r"POSSIBLE CAUSES:\n(.*?)(?=\nRECOMMENDED ACTION:)", exp, re.DOTALL)
            action = re.search(r"RECOMMENDED ACTION:\n(.*?)$", exp, re.DOTALL)

            what_text   = what.group(1).strip()   if what   else ""
            causes_text = causes.group(1).strip() if causes else ""
            action_text = action.group(1).strip() if action else ""

            causes_items = "".join([
                f'<li style="margin-bottom:4px; font-size:13px; color:#374151">{c.strip()}</li>'
                for c in causes_text.split("\n") if c.strip()
            ])

            explanation_html = f"""
            <div style="margin-top:14px; background:#fafafa; border:1px solid #e5e7eb; border-radius:8px; padding:14px">
              <div style="font-size:11px; font-weight:700; color:#6366f1; letter-spacing:0.05em; margin-bottom:8px">
                💡 AI EXPLANATION
              </div>
              <p style="font-size:13px; color:#374151; margin:0 0 10px; line-height:1.6">{what_text}</p>
              <div style="font-size:11px; color:#9ca3af; margin-bottom:6px">POSSIBLE CAUSES</div>
              <ul style="margin:0; padding-left:18px">{causes_items}</ul>
              <div style="margin-top:10px; background:#eef2ff; border-radius:6px; padding:8px 12px;
                          font-size:13px; color:#4f46e5">
                <strong>Action:</strong> {action_text}
              </div>
            </div>
            """

        column_html += f"""
        <div style="border:1.5px solid {col_color}30; border-radius:10px;
                    background:#fff; margin-bottom:14px; overflow:hidden">
          <div style="padding:14px 18px; border-left:4px solid {col_color}">
            <div style="display:flex; justify-content:space-between; align-items:center">
              <div style="font-weight:700; font-size:15px; color:#111827">{col['column']}</div>
              <span style="background:{col_color}15; color:{col_color}; border:1px solid {col_color};
                           border-radius:999px; padding:2px 12px; font-size:12px; font-weight:600">
                {'CRITICAL' if 'CRITICAL' in col['status'] else 'WARNING'}
              </span>
            </div>
            {severity_bar}
            {detail_html}
            {explanation_html}
          </div>
        </div>
        """

    # If no problem columns
    if not column_html:
        column_html = """
        <div style="text-align:center; padding:20px; color:#22c55e; font-size:15px">
          ✅ All columns are within normal range.
        </div>
        """

    scanned_time = datetime.fromisoformat(scan_result["scanned_at"]).strftime("%B %d, %Y at %I:%M %p")

    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background:#f8fafc;
                 font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">

      <div style="max-width:600px; margin:30px auto; background:#fff;
                  border-radius:14px; overflow:hidden;
                  box-shadow:0 4px 20px rgba(0,0,0,0.08)">

        <!-- Header -->
        <div style="background:{top_color}; padding:24px 28px">
          <div style="font-size:22px; font-weight:700; color:#fff">🌊 DriftWatch</div>
          <div style="font-size:13px; color:rgba(255,255,255,0.8); margin-top:4px">
            AI-powered data quality monitor
          </div>
        </div>

        <!-- Summary -->
        <div style="padding:24px 28px; border-bottom:1px solid #f3f4f6">
          <div style="font-size:18px; font-weight:700; color:#111827; margin-bottom:14px">
            Anomaly detected in your data
          </div>
          <table style="width:100%; border-collapse:collapse">
            <tr>
              <td style="padding:4px 0; font-size:13px; color:#6b7280; width:140px">File scanned</td>
              <td style="padding:4px 0; font-size:13px; color:#111827; font-weight:500">{scan_result['filename']}</td>
            </tr>
            <tr>
              <td style="padding:4px 0; font-size:13px; color:#6b7280">Scanned at</td>
              <td style="padding:4px 0; font-size:13px; color:#111827; font-weight:500">{scanned_time}</td>
            </tr>
            <tr>
              <td style="padding:4px 0; font-size:13px; color:#6b7280">Sensitivity</td>
              <td style="padding:4px 0; font-size:13px; color:#111827; font-weight:500">{scan_result['sensitivity'].title()}</td>
            </tr>
            <tr>
              <td style="padding:4px 0; font-size:13px; color:#6b7280">Context</td>
              <td style="padding:4px 0; font-size:13px; color:#111827; font-weight:500">{scan_result['context']}</td>
            </tr>
          </table>

          <!-- Status pills -->
          <div style="margin-top:16px; display:flex; gap:8px; flex-wrap:wrap">
            <span style="background:#fef2f2; color:#ef4444; border:1px solid #fca5a5;
                         border-radius:999px; padding:4px 12px; font-size:12px; font-weight:600">
              🔴 Critical: {scan_result['summary']['critical']}
            </span>
            <span style="background:#fffbeb; color:#f59e0b; border:1px solid #fcd34d;
                         border-radius:999px; padding:4px 12px; font-size:12px; font-weight:600">
              🟡 Warning: {scan_result['summary']['warnings']}
            </span>
            <span style="background:#f0fdf4; color:#22c55e; border:1px solid #86efac;
                         border-radius:999px; padding:4px 12px; font-size:12px; font-weight:600">
              🟢 Normal: {scan_result['summary']['normal']}
            </span>
          </div>
        </div>

        <!-- Column details -->
        <div style="padding:24px 28px">
          <div style="font-size:14px; font-weight:700; color:#111827; margin-bottom:14px">
            Column Details
          </div>
          {column_html}
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc; padding:16px 28px; text-align:center;
                    border-top:1px solid #e5e7eb">
          <div style="font-size:12px; color:#9ca3af">
            Sent by <strong style="color:#6366f1">DriftWatch</strong> —
            AI-powered data quality monitor
          </div>
        </div>

      </div>
    </body>
    </html>
    """
    return html


# Send the email

def send_email_alert(recipient_email, scan_result):
    """
    Sends a professional HTML email alert to the recipient.

    recipient_email → comes from the UI (user types their email)
    scan_result     → the full scan response from /scan endpoint
    """

    overall = scan_result["summary"]["overall_status"]

    # Only send email if there's something to alert about
    if overall == "NORMAL":
        print("✅ Everything normal — no email sent.")
        return {"sent": False, "reason": "No anomalies detected"}

    # Build subject line
    critical_count = scan_result["summary"]["critical"]
    warning_count  = scan_result["summary"]["warnings"]

    if critical_count > 0:
        subject = f"🔴 DriftWatch Critical Alert — {critical_count} critical column(s) in {scan_result['filename']}"
    else:
        subject = f"🟡 DriftWatch Warning — {warning_count} warning column(s) in {scan_result['filename']}"

    # Build email
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"DriftWatch <{SENDER_EMAIL}>"
    msg["To"]      = recipient_email

    # Attach both plain text and HTML versions
    # Email client picks the best one it supports
    plain = build_plain_text(scan_result)
    html  = build_html(scan_result)

    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html,  "html"))

    # Send via Gmail SMTP
    try:
        print(f"📧 Sending alert email to {recipient_email}...")
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())

        print(f"✅ Email sent successfully to {recipient_email}")
        return {
            "sent":      True,
            "recipient": recipient_email,
            "subject":   subject
        }

    except smtplib.SMTPAuthenticationError:
        print("❌ Email auth failed — check EMAIL_SENDER and EMAIL_PASSWORD in .env")
        return {"sent": False, "reason": "Authentication failed"}

    except Exception as e:
        print(f"❌ Email error: {e}")
        return {"sent": False, "reason": str(e)}