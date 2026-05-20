import pandas as pd
from scipy.stats import chi2_contingency
from google import genai
from dotenv import load_dotenv
import os

# Load Gemini API key

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
GEMINI_MODEL = "gemini-1.5-flash-latest"  # change if needed


# Sensitivity map — user picks plain English,
# we convert to Z-score thresholds internally

SENSITIVITY_MAP = {
    "low":    {"warning": 3.0, "critical": 5.0},
    "medium": {"warning": 2.0, "critical": 3.0},
    "high":   {"warning": 1.0, "critical": 2.0},
}


def get_thresholds(sensitivity: str):
    """
    Convert plain English sensitivity to Z-score thresholds.
    Defaults to 'medium' if invalid value given.
    """
    sensitivity = sensitivity.lower().strip()
    if sensitivity not in SENSITIVITY_MAP:
        print(f"⚠️  Unknown sensitivity '{sensitivity}'. Using 'medium'.")
        sensitivity = "medium"
    return SENSITIVITY_MAP[sensitivity]


# SECTION 1 — DATA LOADING

def load_data(filepath):
    df = pd.read_csv(filepath)
    print(f"✅ Loaded {len(df)} rows, {len(df.columns)} columns")
    print(f"   Columns: {list(df.columns)}\n")
    return df


# SECTION 2 — NUMERIC DRIFT (Z-SCORE)

def check_numeric_column(df, column, thresholds):
    """
    For number columns.
    Uses user-defined sensitivity thresholds instead of hardcoded values.
    """
    history     = df[column][:-1]
    today_value = df[column].iloc[-1]

    mean = round(history.mean(), 2)
    std  = round(history.std(), 2)

    if std == 0:
        print(f"⚠️  '{column}' has no variation in history. Skipping.\n")
        return None

    z_score  = round((today_value - mean) / std, 2)
    severity = round(min(abs(z_score) / 10 * 100, 100), 1)

    # Use user's sensitivity thresholds — not hardcoded numbers
    if abs(z_score) < thresholds["warning"]:
        status = "🟢 NORMAL"
    elif abs(z_score) < thresholds["critical"]:
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

def check_category_column(df, date_column, category_column, thresholds):
    """
    For category columns.
    Uses user-defined sensitivity thresholds for p-value cutoffs.
    """

    # Convert sensitivity thresholds to p-value cutoffs
    # High sensitivity   → catches even small distribution changes
    # Medium sensitivity → catches moderate changes
    # Low sensitivity    → only catches extreme changes
    pvalue_map = {
        (1.0, 2.0): {"warning": 0.10, "critical": 0.05},  # high
        (2.0, 3.0): {"warning": 0.05, "critical": 0.01},  # medium
        (3.0, 5.0): {"warning": 0.01, "critical": 0.001}, # low
    }

    # Match thresholds to p-value cutoffs
    p_thresholds = {"warning": 0.05, "critical": 0.01}  # default medium
    for key, val in pvalue_map.items():
        if thresholds["warning"] == key[0]:
            p_thresholds = val
            break

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

    contingency          = pd.DataFrame({"history": history_counts, "today": today_counts}).T
    chi2, p_value, dof, expected = chi2_contingency(contingency)

    # Use sensitivity-aware p-value thresholds
    if p_value > p_thresholds["warning"]:
        severity = round((1 - p_value) * 50, 1)
        status   = "🟢 NORMAL"
    elif p_value > p_thresholds["critical"]:
        severity = round(50 + (p_thresholds["warning"] - p_value) / p_thresholds["warning"] * 25, 1)
        status   = "🟡 WARNING"
    else:
        severity = round(min(75 + (p_thresholds["critical"] - p_value) / p_thresholds["critical"] * 25, 100), 1)
        status   = "🔴 CRITICAL"

    print(f"🔤 Category check → '{category_column}'")
    for cat in all_cats:
        b     = baseline_pct.get(cat, 0)
        t     = today_pct.get(cat, 0)
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
            model=GEMINI_MODEL,
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

def run_driftwatch(filepath, date_column, context,
                   sensitivity="medium", skip_columns=None):
    """
    Main function.

    sensitivity → "low", "medium", or "high"
                  user picks this in plain English
                  we convert to Z-score thresholds internally
    """

    if skip_columns is None:
        skip_columns = []

    # Convert plain English sensitivity to thresholds
    thresholds = get_thresholds(sensitivity)

    df      = load_data(filepath)
    results = []

    print(f"🚀 DriftWatch scanning: {filepath}")
    print(f"   Context     : {context}")
    print(f"   Date column : {date_column}")
    print(f"   Sensitivity : {sensitivity.upper()} "
          f"(warning at {thresholds['warning']}σ, "
          f"critical at {thresholds['critical']}σ)\n")
    print("─" * 55 + "\n")

    for column in df.columns:
        if column == date_column or column in skip_columns:
            continue

        if pd.api.types.is_numeric_dtype(df[column]):
            result = check_numeric_column(df, column, thresholds)
        else:
            result = check_category_column(df, date_column, column, thresholds)

        if result is None:
            continue

        results.append(result)

        if result["severity"] > 30:
            explain_with_gemini(result, context)

    # Summary
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
    run_driftwatch(
        filepath    = "data/attendance.csv",
        date_column = "date",
        context     = "daily count of something",
        sensitivity = "medium",   # "low", "medium", or "high"
    )