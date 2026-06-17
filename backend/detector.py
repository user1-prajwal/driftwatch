import pandas as pd
import numpy as np
from scipy.stats import chi2_contingency
from sklearn.ensemble import IsolationForest
from google import genai
from dotenv import load_dotenv
import os

load_dotenv()
client       = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
GEMINI_MODEL = "gemini-2.5-flash"

SENSITIVITY_MAP = {
    "low":    {"warning": 3.0, "critical": 5.0, "if_contamination": 0.05},
    "medium": {"warning": 2.0, "critical": 3.0, "if_contamination": 0.10},
    "high":   {"warning": 1.0, "critical": 2.0, "if_contamination": 0.15},
}

def get_thresholds(sensitivity):
    sensitivity = sensitivity.lower().strip()
    if sensitivity not in SENSITIVITY_MAP:
        sensitivity = "medium"
    return SENSITIVITY_MAP[sensitivity]

def load_data(filepath):
    df = pd.read_csv(filepath)
    print(f"✅ Loaded {len(df)} rows, {len(df.columns)} columns")
    return df

def clean_numeric(df, date_column):
    """
    Converts text numbers to real numbers.
    Handles: "45,000" → 45000, "₹1,000" → 1000
    This fixes the issue where Google Sheets
    stores numbers with commas as text.
    """
    for col in df.columns:
        if col == date_column:
            continue
        # Try to convert to numeric after cleaning
        cleaned = (
            df[col].astype(str)
            .str.replace(",", "", regex=False)
            .str.replace("₹", "", regex=False)
            .str.replace("$", "", regex=False)
            .str.replace("%", "", regex=False)
            .str.strip()
        )
        converted = pd.to_numeric(cleaned, errors="coerce")
        # Only replace if more than 50% converted successfully
        if converted.notna().mean() > 0.5:
            df[col] = converted
    return df

def human_readable_change(today, baseline_mean, column):
    """
    Converts numbers into plain English comparison.
    No Z-score. No std dev. Just simple language.
    """
    if baseline_mean == 0:
        return f"went from 0 to {today}"

    pct_change = ((today - baseline_mean) / abs(baseline_mean)) * 100

    if pct_change < 0:
        direction = "lower"
        emoji     = "📉"
    else:
        direction = "higher"
        emoji     = "📈"

    abs_pct = abs(round(pct_change, 1))
    diff    = abs(round(today - baseline_mean, 2))

    return f"{emoji} {abs_pct}% {direction} than usual (by {diff})"

def get_status_label(z_score, thresholds):
    if abs(z_score) < thresholds["warning"]:
        return "🟢 NORMAL", "normal"
    elif abs(z_score) < thresholds["critical"]:
        return "🟡 WARNING", "slightly unusual"
    else:
        return "🔴 CRITICAL", "very unusual"

def check_numeric_column(df, column, thresholds):
    history     = df[column][:-1].dropna()
    today_value = df[column].iloc[-1]

    mean = round(float(history.mean()), 2)
    std  = round(float(history.std()), 2)

    if std == 0:
        return None

    z_score  = round((today_value - mean) / std, 2)
    severity = round(min(abs(z_score) / 10 * 100, 100), 1)
    status, plain_status = get_status_label(z_score, thresholds)
    change_text = human_readable_change(today_value, mean, column)

    print(f"🔢 {column}: {today_value} vs normal {mean} → {status}")

    return {
        "type":           "numeric",
        "column":         column,
        "today_value":    float(today_value),
        "baseline_mean":  float(mean),
        "baseline_std":   float(std),
        "z_score":        float(z_score),
        "severity":       float(severity),
        "status":         status,
        "plain_status":   plain_status,      # ← plain English
        "change_text":    change_text,        # ← "📉 90% lower than usual"
    }

def check_category_column(df, date_column, category_column, thresholds):
    pvalue_map = {
        (1.0, 2.0): {"warning": 0.10, "critical": 0.05},
        (2.0, 3.0): {"warning": 0.05, "critical": 0.01},
        (3.0, 5.0): {"warning": 0.01, "critical": 0.001},
    }
    p_thresholds = {"warning": 0.05, "critical": 0.01}
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

    if p_value > p_thresholds["warning"]:
        severity = round((1 - p_value) * 50, 1)
        status   = "🟢 NORMAL"
        plain_status = "normal"
    elif p_value > p_thresholds["critical"]:
        severity = round(50 + (p_thresholds["warning"] - p_value) / p_thresholds["warning"] * 25, 1)
        status   = "🟡 WARNING"
        plain_status = "slightly unusual"
    else:
        severity = round(min(75 + (p_thresholds["critical"] - p_value) / p_thresholds["critical"] * 25, 100), 1)
        status   = "🔴 CRITICAL"
        plain_status = "very unusual"

    # Find the biggest shift for plain English summary
    biggest_shift = ""
    max_shift = 0
    for cat in all_cats:
        shift = abs(float(today_pct.get(cat, 0)) - float(baseline_pct.get(cat, 0)))
        if shift > max_shift:
            max_shift = shift
            b = float(baseline_pct.get(cat, 0))
            t = float(today_pct.get(cat, 0))
            direction = "increased" if t > b else "decreased"
            biggest_shift = f'"{cat}" {direction} from {b}% to {t}%'

    print(f"🔤 {category_column}: {status}")

    return {
        "type":          "categorical",
        "column":        category_column,
        "chi2":          float(round(chi2, 2)),
        "p_value":       float(round(p_value, 6)),
        "severity":      float(severity),
        "status":        status,
        "plain_status":  plain_status,
        "change_text":   biggest_shift,
        "baseline_pct":  {k: float(v) for k, v in baseline_pct.to_dict().items()},
        "today_pct":     {k: float(v) for k, v in today_pct.to_dict().items()},
    }

def check_isolation_forest(df, date_column, thresholds, monitor_columns=None):
    numeric_cols = [
        c for c in df.columns
        if c != date_column
        and pd.api.types.is_numeric_dtype(df[c])
        and (monitor_columns is None or c in monitor_columns)
    ]

    if len(numeric_cols) < 2:
        return None

    history_df = df[:-1][numeric_cols].dropna()
    today_row  = df[numeric_cols].iloc[[-1]].fillna(0)

    if len(history_df) < 10:
        return None

    clf = IsolationForest(
        contamination = thresholds["if_contamination"],
        random_state  = 42,
        n_estimators  = 100
    )
    clf.fit(history_df)

    score      = clf.score_samples(today_row)[0]
    prediction = clf.predict(today_row)[0]

    normalized = max(0, min(1, (-score - 0.1) / 0.7))
    severity   = round(normalized * 100, 1)

    if prediction == 1:
        status       = "🟢 NORMAL"
        plain_status = "normal"
        severity     = min(severity, 25)
    elif severity < 50:
        status       = "🟡 WARNING"
        plain_status = "slightly unusual"
    else:
        status       = "🔴 CRITICAL"
        plain_status = "very unusual"

    history_means = history_df.mean()
    history_stds  = history_df.std().replace(0, 1)
    deviations    = {}
    for col in numeric_cols:
        val = float(today_row[col].iloc[0])
        z   = abs((val - history_means[col]) / history_stds[col])
        deviations[col] = round(float(z), 2)

    top_deviants = dict(sorted(deviations.items(), key=lambda x: x[1], reverse=True)[:3])

    # Plain English summary
    most_unusual = max(top_deviants, key=top_deviants.get) if top_deviants else ""
    change_text  = f"This row looks unusual — especially the '{most_unusual}' value" if most_unusual else "This row looks unusual across multiple columns"

    return {
        "type":            "isolation_forest",
        "column":          "row_anomaly",
        "if_score":        round(float(score), 4),
        "severity":        float(severity),
        "status":          status,
        "plain_status":    plain_status,
        "change_text":     change_text,
        "columns_checked": numeric_cols,
        "top_deviants":    top_deviants,
        "today_values":    {c: float(today_row[c].iloc[0]) for c in numeric_cols},
    }

def explain_with_gemini(result, context):
    if result["type"] == "numeric":
        details = f"""
- Column       : {result['column']}
- Today's value: {result['today_value']}
- Normal value : ~{result['baseline_mean']} per day
- Change       : {result['change_text']}
        """.strip()

    elif result["type"] == "categorical":
        baseline_str = ", ".join([f"{k}: {v}%" for k, v in result["baseline_pct"].items()])
        today_str    = ", ".join([f"{k}: {v}%" for k, v in result["today_pct"].items()])
        details = f"""
- Column         : {result['column']}
- Normal pattern : {baseline_str}
- Today's pattern: {today_str}
- Biggest change : {result['change_text']}
        """.strip()

    else:
        values_str = ", ".join([f"{k}={v}" for k, v in result["today_values"].items()])
        details = f"""
- Detection : Row-level anomaly
- Values    : {values_str}
- Most unusual column: {max(result['top_deviants'], key=result['top_deviants'].get) if result['top_deviants'] else 'unknown'}
        """.strip()

    prompt = f"""
You are a data quality analyst reviewing an anomaly alert.

The data being monitored: {context}
Status: {result['status']}

{details}

Respond in exactly this format:

WHAT HAPPENED:
(1 sentence, plain English, no jargon, no technical terms)

POSSIBLE CAUSES:
1. (reason one — simple language)
2. (reason two — simple language)
3. (reason three — simple language)

RECOMMENDED ACTION:
(1 sentence — what a non-technical person should do)
    """.strip()

    try:
        response = client.models.generate_content(
            model    = GEMINI_MODEL,
            contents = prompt
        )
        return response.text
    except Exception as e:
        print(f"❌ Gemini error: {e}")
        return None

def run_driftwatch(filepath, date_column, context,
                   sensitivity="medium", skip_columns=None,
                   monitor_columns=None):

    if skip_columns is None:
        skip_columns = []

    thresholds = get_thresholds(sensitivity)
    df         = load_data(filepath)

    # ── Fix: convert text numbers to real numbers ──
    df = clean_numeric(df, date_column)

    results = []

    print(f"\n🚀 Scanning: {filepath}")
    print(f"   Sensitivity: {sensitivity.upper()}\n")

    for column in df.columns:
        if column == date_column or column in skip_columns:
            continue
        if monitor_columns and column not in monitor_columns:
            continue

        if pd.api.types.is_numeric_dtype(df[column]):
            result = check_numeric_column(df, column, thresholds)
        else:
            result = check_category_column(df, date_column, column, thresholds)

        if result is None:
            continue

        if result["severity"] > 30:
            explanation = explain_with_gemini(result, context)
            result["gemini_explanation"] = explanation
        else:
            result["gemini_explanation"] = None

        results.append(result)

    # Isolation Forest
    if_result = check_isolation_forest(df, date_column, thresholds, monitor_columns)
    if if_result:
        if if_result["severity"] > 30:
            explanation = explain_with_gemini(if_result, context)
            if_result["gemini_explanation"] = explanation
        else:
            if_result["gemini_explanation"] = None
        results.append(if_result)

    # Summary
    critical = [r for r in results if "CRITICAL" in r["status"]]
    warnings = [r for r in results if "WARNING"  in r["status"]]
    normal   = [r for r in results if "NORMAL"   in r["status"]]

    print(f"\n📋 SUMMARY: {len(critical)} critical, {len(warnings)} warnings, {len(normal)} normal")
    return results