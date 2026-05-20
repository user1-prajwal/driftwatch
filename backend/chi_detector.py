import pandas as pd
from scipy.stats import chi2_contingency
from google import genai
from dotenv import load_dotenv
import os

# Load Gemini API key

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# 1. Load CSV

def load_data(filepath):
    df = pd.read_csv(filepath)
    print(f"✅ Loaded {len(df)} rows, {len(df.columns)} columns")
    print(f"   Columns found: {list(df.columns)}\n")
    return df


# 2. Build baseline distribution for a category column
#    Example: {"success": 0.85, "failed": 0.10, "pending": 0.05}

def build_category_baseline(df, date_column, category_column):
    """
    Takes all dates EXCEPT the last date as historical data.
    Computes what % each category normally appears.
    """
    # Find all unique dates, sorted
    dates      = sorted(df[date_column].unique())
    past_dates = dates[:-1]   # everything except last date = history
    today_date = dates[-1]    # last date = today

    history_df = df[df[date_column].isin(past_dates)]
    today_df   = df[df[date_column] == today_date]

    # Count how many times each category appears in history
    baseline_counts = history_df[category_column].value_counts()
    baseline_pct    = (baseline_counts / baseline_counts.sum() * 100).round(2)

    print(f"📊 Normal distribution for '{category_column}':")
    for cat, pct in baseline_pct.items():
        print(f"   {cat}: {pct}%")
    print()

    return history_df, today_df, category_column, baseline_pct


# 3. Chi-square test — is today's distribution different?
#
# Chi-square compares two distributions and gives a p-value.
# p-value < 0.05 means: "these are significantly different"
# p-value < 0.01 means: "these are VERY significantly different"

def detect_category_drift(history_df, today_df, category_column, baseline_pct):
    """
    Compares today's category distribution against historical baseline.
    Uses chi-square test to get a statistical significance score.
    """
    # Get all possible categories
    all_categories = baseline_pct.index.tolist()

    # Count occurrences in history and today
    history_counts = history_df[category_column].value_counts().reindex(all_categories, fill_value=0)
    today_counts   = today_df[category_column].value_counts().reindex(all_categories, fill_value=0)

    # Today's distribution in percentages
    today_pct = (today_counts / today_counts.sum() * 100).round(2)

    print(f"🔍 Today's distribution for '{category_column}':")
    for cat in all_categories:
        baseline = baseline_pct.get(cat, 0)
        today    = today_pct.get(cat, 0)
        change   = today - baseline
        arrow    = "⬆️" if change > 5 else "⬇️" if change < -5 else "➡️"
        print(f"   {cat}: {today}%  (normal: {baseline}%)  {arrow}")
    print()

    # Build contingency table for chi-square
    # Rows = [history, today], Columns = [each category]
    contingency = pd.DataFrame({
        "history": history_counts,
        "today":   today_counts
    }).T

    # Run chi-square test
    chi2, p_value, dof, expected = chi2_contingency(contingency)

    # Convert p-value to severity score 0-100
    # p=0.05 → moderate, p=0.001 → critical
    if p_value > 0.05:
        severity = round((1 - p_value) * 50, 1)
        status   = "🟢 NORMAL"
    elif p_value > 0.01:
        severity = round(50 + (0.05 - p_value) / 0.05 * 25, 1)
        status   = "🟡 WARNING"
    else:
        severity = round(min(75 + (0.01 - p_value) / 0.01 * 25, 100), 1)
        status   = "🔴 CRITICAL"

    result = {
        "column":       category_column,
        "chi2":         round(chi2, 2),
        "p_value":      round(p_value, 6),
        "severity":     severity,
        "status":       status,
        "baseline_pct": baseline_pct.to_dict(),
        "today_pct":    today_pct.to_dict(),
    }

    print(f"   Chi-square score : {result['chi2']}")
    print(f"   P-value          : {result['p_value']}")
    print(f"   Severity         : {severity} / 100")
    print(f"   Status           : {status}\n")

    return result


# 4. Ask Gemini to explain the category drift

def explain_category_drift(result, context):
    baseline_str = ", ".join([f"{k}: {v}%" for k, v in result["baseline_pct"].items()])
    today_str    = ", ".join([f"{k}: {v}%" for k, v in result["today_pct"].items()])

    prompt = f"""
You are a data quality analyst reviewing a category distribution anomaly.

The data being monitored: {context}

Anomaly details:
- Column         : {result['column']}
- Normal pattern : {baseline_str}
- Today's pattern: {today_str}
- Chi-square     : {result['chi2']} (higher = more different)
- P-value        : {result['p_value']} (below 0.05 = significant change)
- Severity       : {result['severity']} / 100
- Status         : {result['status']}

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

    print("🤖 Asking Gemini to explain...\n")

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        print("=" * 55)
        print("💡 GEMINI EXPLANATION")
        print("=" * 55)
        print(response.text)
        print("=" * 55)
        return response.text

    except Exception as e:
        print(f"❌ Gemini error: {e}")
        return None


# RUN — change these 4 lines for any project

if __name__ == "__main__":

    FILE            = "data/api_logs.csv"      # your CSV file
    DATE_COLUMN     = "date"                   # column with dates
    CATEGORY_COLUMN = "status"                 # column to monitor
    CONTEXT         = "API response statuses"  # describe your data

    df = load_data(FILE)

    history_df, today_df, col, baseline_pct = build_category_baseline(
        df, DATE_COLUMN, CATEGORY_COLUMN
    )

    result = detect_category_drift(
        history_df, today_df, col, baseline_pct
    )

    if result["severity"] > 30:
        explain_category_drift(result, context=CONTEXT)
    else:
        print("✅ Distribution looks normal. No explanation needed.")