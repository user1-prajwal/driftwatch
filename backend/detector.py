import pandas as pd
import numpy as np
from scipy.stats import chi2_contingency
from sklearn.ensemble import IsolationForest
from google import genai
from dotenv import load_dotenv
import os

# Load Gemini API key

load_dotenv()
client       = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
GEMINI_MODEL = "gemini-2.5-flash"


# Sensitivity map
# User picks plain English → we convert to thresholds

SENSITIVITY_MAP = {
    "low":    {"warning": 3.0, "critical": 5.0, "if_contamination": 0.05},
    "medium": {"warning": 2.0, "critical": 3.0, "if_contamination": 0.10},
    "high":   {"warning": 1.0, "critical": 2.0, "if_contamination": 0.15},
}


def get_thresholds(sensitivity: str):
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
# Catches: single numeric column acting weird

def check_numeric_column(df, column, thresholds):
    history     = df[column][:-1]
    today_value = df[column].iloc[-1]

    mean = round(history.mean(), 2)
    std  = round(history.std(), 2)

    if std == 0:
        print(f"⚠️  '{column}' has no variation in history. Skipping.\n")
        return None

    z_score  = round((today_value - mean) / std, 2)
    severity = round(min(abs(z_score) / 10 * 100, 100), 1)

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
# Catches: category distribution shifting

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


# SECTION 4 — ROW-LEVEL ANOMALY (ISOLATION FOREST)
# Catches: rows that look suspicious across
#          MULTIPLE columns simultaneously
#
# How it works:
#   Isolation Forest randomly splits data into
#   partitions. Anomalous rows are isolated
#   faster (need fewer splits) than normal rows.
#   Score close to -1 = anomaly, close to 1 = normal

def check_isolation_forest(df, date_column, thresholds):
    """
    Runs Isolation Forest on ALL numeric columns together.
    Finds rows that are suspicious across multiple dimensions.
    Returns result only if the LATEST row is anomalous.
    """

    # Get only numeric columns (excluding date)
    numeric_cols = [
        c for c in df.columns
        if c != date_column and pd.api.types.is_numeric_dtype(df[c])
    ]

    if len(numeric_cols) < 2:
        print("⏭️  Isolation Forest skipped — need at least 2 numeric columns.\n")
        return None

    print(f"🌲 Isolation Forest → checking rows across: {numeric_cols}")

    # Use history rows to train the model
    history_df = df[:-1][numeric_cols].dropna()
    today_row  = df[numeric_cols].iloc[[-1]].fillna(0)

    if len(history_df) < 10:
        print("⏭️  Not enough history rows for Isolation Forest (need 10+). Skipping.\n")
        return None

    # Train Isolation Forest on historical data
    # contamination = expected % of anomalies (from sensitivity setting)
    clf = IsolationForest(
        contamination = thresholds["if_contamination"],
        random_state  = 42,
        n_estimators  = 100
    )
    clf.fit(history_df)

    # Score the latest row
    # score_samples returns negative values — more negative = more anomalous
    score = clf.score_samples(today_row)[0]

    # predict returns -1 for anomaly, 1 for normal
    prediction = clf.predict(today_row)[0]

    # Convert score to severity 0-100
    # score ranges roughly from -0.8 (anomaly) to 0.1 (normal)
    # we map this to 0-100
    normalized = max(0, min(1, (-score - 0.1) / 0.7))
    severity   = round(normalized * 100, 1)

    if prediction == 1:
        status   = "🟢 NORMAL"
        severity = min(severity, 25)   # cap normal at 25
    elif severity < 50:
        status = "🟡 WARNING"
    else:
        status = "🔴 CRITICAL"

    # Find which columns contributed most to the anomaly
    # by checking which values deviate most from column means
    history_means = history_df.mean()
    history_stds  = history_df.std().replace(0, 1)
    deviations    = {}
    for col in numeric_cols:
        val       = float(today_row[col].iloc[0])
        z         = abs((val - history_means[col]) / history_stds[col])
        deviations[col] = round(float(z), 2)

    # Sort by most deviant
    top_deviants = dict(sorted(deviations.items(), key=lambda x: x[1], reverse=True)[:3])

    print(f"   IF Score      : {round(float(score), 4)}")
    print(f"   Prediction    : {'Anomaly' if prediction == -1 else 'Normal'}")
    print(f"   Severity      : {severity} / 100  {status}")
    print(f"   Top deviating columns: {top_deviants}\n")

    return {
        "type":           "isolation_forest",
        "column":         "row_anomaly",
        "if_score":       round(float(score), 4),
        "severity":       float(severity),
        "status":         status,
        "columns_checked": numeric_cols,
        "top_deviants":   top_deviants,
        "today_values":   {c: float(today_row[c].iloc[0]) for c in numeric_cols},
    }


# SECTION 5 — GEMINI EXPLANATION
# Works for all 3 detector types

def explain_with_gemini(result, context):
    if result["type"] == "numeric":
        details = f"""
- Column         : {result['column']}
- Latest value   : {result['today_value']}
- Normal average : {result['baseline_mean']} (+/- {result['baseline_std']})
- Z-score        : {result['z_score']}
- Severity       : {result['severity']} / 100
        """.strip()

    elif result["type"] == "categorical":
        baseline_str = ", ".join([f"{k}: {v}%" for k, v in result["baseline_pct"].items()])
        today_str    = ", ".join([f"{k}: {v}%" for k, v in result["today_pct"].items()])
        details = f"""
- Column         : {result['column']}
- Normal pattern : {baseline_str}
- Today's pattern: {today_str}
- P-value        : {result['p_value']}
- Severity       : {result['severity']} / 100
        """.strip()

    else:  # isolation_forest
        deviants_str = ", ".join([f"{k} (z={v})" for k, v in result["top_deviants"].items()])
        values_str   = ", ".join([f"{k}={v}" for k, v in result["today_values"].items()])
        details = f"""
- Detection type : Row-level multivariate anomaly
- Columns checked: {result['columns_checked']}
- Today's values : {values_str}
- Most suspicious columns: {deviants_str}
- Isolation score: {result['if_score']} (more negative = more anomalous)
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
            model    = GEMINI_MODEL,
            contents = prompt
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


# SECTION 6 — MAIN RUNNER
# Runs all 3 detectors automatically

def run_driftwatch(filepath, date_column, context,
                   sensitivity="medium", skip_columns=None):
    if skip_columns is None:
        skip_columns = []

    thresholds = get_thresholds(sensitivity)
    df         = load_data(filepath)
    results    = []

    print(f"🚀 DriftWatch scanning: {filepath}")
    print(f"   Context     : {context}")
    print(f"   Date column : {date_column}")
    print(f"   Sensitivity : {sensitivity.upper()} "
          f"(warning at {thresholds['warning']}σ, "
          f"critical at {thresholds['critical']}σ)\n")
    print("─" * 55 + "\n")

    # ── Detector 1 & 2: per-column checks ──
    for column in df.columns:
        if column == date_column or column in skip_columns:
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

    # ── Detector 3: Isolation Forest (row-level) ──
    if_result = check_isolation_forest(df, date_column, thresholds)
    if if_result:
        if if_result["severity"] > 30:
            explanation = explain_with_gemini(if_result, context)
            if_result["gemini_explanation"] = explanation
        else:
            if_result["gemini_explanation"] = None
        results.append(if_result)

    # ── Summary ──
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
        print(f"\n   Critical: {[r['column'] for r in critical]}")
    if warnings:
        print(f"   Warning : {[r['column'] for r in warnings]}")

    print("─" * 55)
    return results