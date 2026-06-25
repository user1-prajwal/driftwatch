import os
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY      = os.getenv("BREVO_API_KEY")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL")
BREVO_SENDER_NAME  = os.getenv("BREVO_SENDER_NAME", "DriftWatch")

UNSUBSCRIBE_URL = "https://driftwatchai.vercel.app/unsubscribe"
APP_URL         = "https://driftwatchai.vercel.app/"


def send_email_alert(recipient_email, scan_result):
    overall = scan_result["summary"]["overall_status"]

    if overall == "NORMAL":
        print("Everything normal — no email sent.")
        return {"sent": False, "reason": "No anomalies detected"}

    critical_count = scan_result["summary"]["critical"]
    warning_count  = scan_result["summary"]["warnings"]
    filename       = scan_result.get("filename", "your data")

    try:
        scanned_at = datetime.fromisoformat(
            scan_result["scanned_at"]
        ).strftime("%B %d, %Y at %I:%M %p")
    except Exception:
        scanned_at = scan_result["scanned_at"]

    # Subject: descriptive but NO filename (avoids showing the Google Sheet URL twice)
    if critical_count > 0:
        subject = f"DriftWatch: {critical_count} critical issue(s) found in your data"
    else:
        subject = f"DriftWatch: {warning_count} warning(s) found in your data"

    # Detect if filename is a URL (e.g. Google Sheets link)
    is_url = filename.startswith("http://") or filename.startswith("https://")

    # Show as clickable link if URL, plain text otherwise — appears ONCE in body only
    if is_url:
        source_html  = '<a href="{}" style="color:#6366f1;font-weight:600;">Open source sheet</a>'.format(filename)
        source_plain = filename
    else:
        source_html  = '<strong style="color:#1e293b;">{}</strong>'.format(filename)
        source_plain = filename

    # Problem columns only
    problem_cols = [
        r for r in scan_result["columns"]
        if "NORMAL" not in r["status"]
    ]

    col_lines_html = ""
    col_lines_text = ""
    for col in problem_cols:
        color  = "#ef4444" if "CRITICAL" in col["status"] else "#f59e0b"
        status = "CRITICAL" if "CRITICAL" in col["status"] else "WARNING"
        change = col.get("change_text", "")
        col_lines_html += """
        <div style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-weight:600;color:#1e293b;font-size:14px;">{col}</span>
            <span style="color:{color};font-weight:700;font-size:13px;">{status}</span>
          </div>
          {change_div}
        </div>
        """.format(
            col=col["column"], color=color, status=status,
            change_div='<div style="font-size:13px;color:#64748b;">{}</div>'.format(change) if change else ""
        )
        col_lines_text += "  - {}: {}".format(col["column"], status)
        if change:
            col_lines_text += " - {}".format(change)
        col_lines_text += "\n"

    plain = """DriftWatch Data Quality Report
========================================

Status : {overall}
Source : {source}
Time   : {scanned_at}

Issues found:
{cols}

View full details and AI explanation:
{app_url}

---
You received this because you signed up for DriftWatch notifications.
To unsubscribe: {unsub}?email={email}""".format(
        overall=overall, source=source_plain, scanned_at=scanned_at,
        cols=col_lines_text, app_url=APP_URL,
        unsub=UNSUBSCRIBE_URL, email=recipient_email
    )

    top_color    = "#ef4444" if critical_count > 0 else "#f59e0b"
    status_label = "Critical Issues Found" if critical_count > 0 else "Warnings Found"

    html = """<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <div style="background:{top_color};padding:24px 28px;">
      <div style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;margin-bottom:6px;">DriftWatch</div>
      <div style="color:#fff;font-size:22px;font-weight:800;line-height:1.2;">{status_label}</div>
    </div>

    <div style="padding:28px;">
      <p style="font-size:15px;color:#475569;margin:0 0 20px;line-height:1.7;">
        An issue was found in {source_html} on {scanned_at}.
      </p>

      <div style="background:#f8fafc;border-radius:12px;padding:16px 18px;margin-bottom:24px;border:1px solid #e2e8f0;">
        <div style="font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.06em;margin-bottom:10px;">AFFECTED COLUMNS</div>
        {col_lines_html}
      </div>

      <div style="text-align:center;margin-bottom:8px;">
        <a href="{app_url}" style="display:inline-block;padding:14px 36px;background:#6366f1;color:#fff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.01em;">
          View Full Report
        </a>
      </div>
      <p style="text-align:center;font-size:12px;color:#94a3b8;margin:10px 0 0;">
        Click to see the AI explanation and recommended actions.
      </p>
    </div>

    <div style="background:#f8fafc;padding:16px 28px;border-top:1px solid #e2e8f0;text-align:center;">
      <div style="font-size:12px;color:#94a3b8;">
        Sent by <strong style="color:#6366f1;">DriftWatch</strong> — AI-powered data quality monitor
      </div>
      <div style="font-size:11px;color:#cbd5e1;margin-top:6px;">
        You received this because you signed up for DriftWatch notifications.<br>
        <a href="{unsub}?email={email}" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a>
      </div>
    </div>

  </div>
</body>
</html>""".format(
        top_color=top_color, status_label=status_label,
        source_html=source_html, scanned_at=scanned_at,
        col_lines_html=col_lines_html, app_url=APP_URL,
        unsub=UNSUBSCRIBE_URL, email=recipient_email
    )

    payload = {
        "sender": {"name": BREVO_SENDER_NAME, "email": BREVO_SENDER_EMAIL},
        "to": [{"email": recipient_email}],
        "subject": subject,
        "htmlContent": html,
        "textContent": plain,
        "headers": {
            "List-Unsubscribe": "<{}?email={}>, <mailto:{}?subject=Unsubscribe>".format(
                UNSUBSCRIBE_URL, recipient_email, BREVO_SENDER_EMAIL
            ),
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
    }

    headers = {
        "accept":       "application/json",
        "content-type": "application/json",
        "api-key":      BREVO_API_KEY,
    }

    try:
        print("Sending notification to {} via Brevo...".format(recipient_email))
        response = requests.post(
            "https://api.brevo.com/v3/smtp/email",
            json=payload, headers=headers, timeout=15,
        )

        if response.status_code in [200, 201]:
            print("Email sent to {}".format(recipient_email))
            return {"sent": True, "recipient": recipient_email, "subject": subject}
        else:
            error_msg = response.json().get("message", response.text)
            print("Brevo error: {}".format(error_msg))
            return {"sent": False, "reason": error_msg}

    except Exception as e:
        print("Email error: {}".format(e))
        return {"sent": False, "reason": str(e)}