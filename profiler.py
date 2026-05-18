import pandas as pd
from scipy import stats

# ──────────────────────────────────────────────
# STEP 1: Load your data
# ──────────────────────────────────────────────

def load_data(filepath):
    """Load CSV into a pandas DataFrame."""
    df = pd.read_csv(filepath)
    print(f"✅ Loaded {len(df)} rows, {len(df.columns)} columns")
    print(f"   Columns: {list(df.columns)}\n")
    return df


# ──────────────────────────────────────────────
# STEP 2: Build a baseline from historical data
# (everything except the last row)
# ──────────────────────────────────────────────

def build_baseline(df, column):
    """
    Compute 'normal' statistics for a column.
    We use all rows EXCEPT the last one as history.
    In a real system, you'd define a time window (e.g. last 30 days).
    """
    history = df[column][:-1]  # all rows except today

    baseline = {
        "column":   column,
        "count":    len(history),
        "mean":     round(history.mean(), 2),
        "std":      round(history.std(), 2),
        "min":      round(history.min(), 2),
        "max":      round(history.max(), 2),
        "median":   round(history.median(), 2),
        "null_pct": round(history.isnull().mean() * 100, 2),
    }

    print(f"📊 Baseline for '{column}':")
    for key, val in baseline.items():
        print(f"   {key}: {val}")
    print()

    return baseline


# ──────────────────────────────────────────────
# STEP 3: Check today's value against baseline
# ──────────────────────────────────────────────

def detect_drift(df, column, baseline):
    """
    Compare the latest value to the baseline.
    Uses Z-score: how many standard deviations away is today's value?

    Z-score interpretation:
      |Z| < 2  → normal (green)
      |Z| 2–3  → warning (yellow)
      |Z| > 3  → critical anomaly (red)
    """
    today_value = df[column].iloc[-1]  # last row = today

    z_score = (today_value - baseline["mean"]) / baseline["std"]
    z_score = round(z_score, 2)

    # Convert Z-score to a 0–100 severity score
    # Z=0 → severity 0, Z=±3 → severity ~75, Z=±9 → severity ~97
    severity = round(min(abs(z_score) / 10 * 100, 100), 1)

    # Determine status
    if abs(z_score) < 2:
        status = "🟢 NORMAL"
    elif abs(z_score) < 3:
        status = "🟡 WARNING"
    else:
        status = "🔴 CRITICAL"

    result = {
        "column":      column,
        "today_value": today_value,
        "baseline_mean": baseline["mean"],
        "baseline_std":  baseline["std"],
        "z_score":     z_score,
        "severity":    severity,
        "status":      status,
    }

    print(f"🔍 Drift check for '{column}':")
    print(f"   Today's value : {today_value}")
    print(f"   Baseline mean : {baseline['mean']} ± {baseline['std']}")
    print(f"   Z-score       : {z_score}")
    print(f"   Severity      : {severity}/100")
    print(f"   Status        : {status}")
    print()

    return result


# ──────────────────────────────────────────────
# STEP 4: Build explanation prompt for Gemini
# (We won't call the API yet — just print the prompt)
# ──────────────────────────────────────────────

def build_explanation_prompt(result):
    """
    Constructs the prompt we'll send to Gemini API later.
    For now, just prints it so you can see what it looks like.
    """
    prompt = f"""
You are a data quality analyst. A monitoring system has detected an anomaly.

Column: {result['column']}
Today's value: {result['today_value']}
Normal baseline: mean = {result['baseline_mean']}, std = {result['baseline_std']}
Z-score: {result['z_score']} (anything above 3 is a critical anomaly)
Severity score: {result['severity']} / 100

In 2-3 sentences, explain:
1. What the anomaly means in plain English
2. What could have caused it (give 2-3 possible reasons)
3. What action should be taken

Keep it short, clear, and non-technical.
    """.strip()

    print("📝 Gemini prompt (will be sent to API in next step):")
    print("-" * 50)
    print(prompt)
    print("-" * 50)

    return prompt


# ──────────────────────────────────────────────
# RUN EVERYTHING
# ──────────────────────────────────────────────

if __name__ == "__main__":
    # 1. Load data
    df = load_data("data/attendance.csv")

    # 2. Build baseline for the teachers_present column
    baseline = build_baseline(df, "teachers_present")

    # 3. Detect drift in today's value
    result = detect_drift(df, "teachers_present", baseline)

    # 4. See the prompt that will go to Gemini
    if result["severity"] > 30:  # only explain if significant
        build_explanation_prompt(result)
    else:
        print("✅ No significant drift. No explanation needed.")