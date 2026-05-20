import pandas as pd
from scipy.stats import chi2_contingency
from google import genai
from dotenv import load_dotenv
import os

# Load Gemini API key

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
GEMINI_MODEL = "gemini-1.5-flash-latest"  # change if needed


# SECTION 1 — DATA LOADING

def load_data(filepath):
    df = pd.read_csv(filepath)
    print(f"✅ Loaded {len(df)} rows, {len(df.columns)} columns")
    print(f"   Columns: {list(df.columns)}\n")
    return df


# SECTION 2 — NUMERIC DRIFT (Z-SCORE)

def check_numeric_column(df, column):
    """
    For number columns.
    Learns normal average from all rows except last.
    Checks if last row is suspicious using Z-score.
    """
    history     = df[column][:-1]
    today_value = df[column].iloc[-1]

    mean    = round(history.mean(), 2)
    std     = round(history.std(), 2)

    if std == 0:
        print(f"⚠️  '{column}' has no variation in history. Skipping.\n")
        return None

    z_score  = round((today_value - mean) / std, 2)
    severity = round(min(abs(z_score) / 10 * 100, 100), 1)

    if abs(z_score) < 2:
        status = "🟢 NORMAL"
    elif abs(z_score) < 3:
        status = "🟡 WARNING"
    else:
        status = "🔴 CRITICAL"

    print(f"🔢 Numeric check → '{column}'")
    print(f"   Latest value  : {today_value}")
    print(f"   Normal average: {mean} +/- {std}")
    print(f"   Z-score       : {z_score}")
    print(f"   Severity      : {severity} / 100  {status}\n")

    return {
    "type":          "numeric",
    "column":        column,
    "today_value":   float(today_value),
    "baseline_mean": float(mean),
    "baseline_std":  float(std),
    "z_score":       float(z_score),
    "severity":      float(severity),
    "status":        status,
}


# SECTION 3 — CATEGORICAL DRIFT (CHI-SQUARE)

def check_category_column(df, date_column, category_column):
    """
    For category columns (text values like success/failed/pending).
    Compares today's distribution against historical distribution.
    Uses chi-square test to detect significant changes.
    """
    dates      = sorted(df[date_column].unique())
    past_dates = dates[:-1]
    today_date = dates[-1]

    history_df = df[df[date_column].isin(past_dates)]
    today_df   = df[df[date_column] == today_date]

    all_cats       = df[category_column].unique().tolist()
    history_counts = history_df[category_column].value_counts().reindex(all_cats, fill_value=0)
    today_counts   = today_df[category_column].value_counts().reindex(all_cats, fill_value=0)

    baseline_pct = (history_counts / history_counts.sum() * 100).round(2)
    today_pct    = (today_counts / today_counts.sum() * 100).round(2)

    contingency      = pd.DataFrame({"history": history_counts, "today": today_counts}).T
    chi2, p_value, dof, expected = chi2_contingency(contingency)

    if p_value > 0.05:
        severity = round((1 - p_value) * 50, 1)
        status   = "🟢 NORMAL"
    elif p_value > 0.01:
        severity = round(50 + (0.05 - p_value) / 0.05 * 25, 1)
        status   = "🟡 WARNING"
    else:
        severity = round(min(75 + (0.01 - p_value) / 0.01 * 25, 100), 1)
        status   = "🔴 CRITICAL"

    print(f"🔤 Category check → '{category_column}'")
    for cat in all_cats:
        b = baseline_pct.get(cat, 0)
        t = today_pct.get(cat, 0)
        arrow = "⬆️" if t - b > 5 else "⬇️" if b - t > 5 else "➡️"
        print(f"   {cat}: today {t}%  (normal {b}%)  {arrow}")
    print(f"   P-value  : {round(p_value, 6)}")
    print(f"   Severity : {severity} / 100  {status}\n")

    return {
    "type":         "categorical",
    "column":       category_column,
    "chi2":         float(round(chi2, 2)),
    "p_value":      float(round(p_value, 6)),
    "severity":     float(severity),
    "status":       status,
    "baseline_pct": {k: float(v) for k, v in baseline_pct.to_dict().items()},
    "today_pct":    {k: float(v) for k, v in today_pct.to_dict().items()},
}


# SECTION 4 — GEMINI EXPLANATION

def explain_with_gemini(result, context):
    """
    Builds a prompt based on detector type and asks Gemini to explain.
    Works for both numeric and categorical results.
    """

    if result["type"] == "numeric":
        details = f"""
- Column         : {result['column']}
- Latest value   : {result['today_value']}
- Normal average : {result['baseline_mean']} (+/- {result['baseline_std']})
- Z-score        : {result['z_score']}
- Severity       : {result['severity']} / 100
        """.strip()

    else:
        baseline_str = ", ".join([f"{k}: {v}%" for k, v in result["baseline_pct"].items()])
        today_str    = ", ".join([f"{k}: {v}%" for k, v in result["today_pct"].items()])
        details = f"""
- Column         : {result['column']}
- Normal pattern : {baseline_str}
- Today's pattern: {today_str}
- P-value        : {result['p_value']}
- Severity       : {result['severity']} / 100
        """.strip()

    prompt = f"""
You are a data quality analyst reviewing an anomaly alert.

The data being monitored: {context}
Status: {result['status']}

{details}

Respond in exactly this format:

WHAT HAPPENED:
(1 sentence, plain English, no jargon)

POSSIBLE CAUSES:
1. (reason one)
2. (reason two)
3. (reason three)

RECOMMENDED ACTION:
(1 sentence on what to do next)
    """.strip()

    print(f"🤖 Asking Gemini to explain '{result['column']}'...\n")

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        print("=" * 55)
        print(f"💡 GEMINI — {result['column'].upper()}")
        print("=" * 55)
        print(response.text)
        print("=" * 55 + "\n")
        return response.text

    except Exception as e:
        print(f"❌ Gemini error: {e}\n")
        return None


# SECTION 5 — MAIN RUNNER
# Auto-detects column types and runs the right detector

def run_driftwatch(filepath, date_column, context, skip_columns=None):
    """
    Main function. Give it a CSV file and it monitors everything.

    filepath     → path to your CSV file
    date_column  → which column has the date (to split history vs today)
    context      → plain English description of your data
    skip_columns → list of columns to ignore (optional)
    """

    if skip_columns is None:
        skip_columns = []

    df      = load_data(filepath)
    results = []

    print(f"🚀 DriftWatch scanning: {filepath}")
    print(f"   Context: {context}")
    print(f"   Date column: {date_column}\n")
    print("─" * 55 + "\n")

    for column in df.columns:
        # Skip date column and any columns you don't want
        if column == date_column or column in skip_columns:
            continue

        # Auto-detect: is this column numbers or categories?
        if pd.api.types.is_numeric_dtype(df[column]):
            result = check_numeric_column(df, column)
        else:
            result = check_category_column(df, date_column, column)

        if result is None:
            continue

        results.append(result)

        # Only call Gemini for warnings and critical issues
        if result["severity"] > 30:
            explain_with_gemini(result, context)

    # Final summary
    print("─" * 55)
    print("📋 DRIFTWATCH SUMMARY")
    print("─" * 55)
    critical = [r for r in results if "CRITICAL" in r["status"]]
    warnings = [r for r in results if "WARNING"  in r["status"]]
    normal   = [r for r in results if "NORMAL"   in r["status"]]

    print(f"   🔴 Critical : {len(critical)} column(s)")
    print(f"   🟡 Warning  : {len(warnings)} column(s)")
    print(f"   🟢 Normal   : {len(normal)} column(s)")

    if critical:
        print(f"\n   Critical columns: {[r['column'] for r in critical]}")
    if warnings:
        print(f"   Warning columns : {[r['column'] for r in warnings]}")

    print("─" * 55)
    return results


# RUN — only change these lines

if __name__ == "__main__":

    # run_driftwatch(
    #     filepath     = "data/api_logs.csv",
    #     date_column  = "date",
    #     context      = "daily API response logs for a web application",
    #     skip_columns = []   # add column names here to ignore them
    # )
    
    run_driftwatch(
    filepath    = "data/attendance.csv",
    date_column = "date",
    context     = "daily count of something",
    skip_columns = []
)