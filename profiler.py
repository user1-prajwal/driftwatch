import pandas as pd
from google import genai
from dotenv import load_dotenv
import os

# Load Gemini API key from .env file

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# 1. Load any CSV file

def load_data(filepath):
    df = pd.read_csv(filepath)
    print(f"✅ Loaded {len(df)} rows, {len(df.columns)} columns")
    print(f"   Columns found: {list(df.columns)}\n")
    return df


# 2. Learn what NORMAL looks like for any column

def build_baseline(df, column):
    history = df[column][:-1]  # everything except last row

    baseline = {
        "column":   column,
        "mean":     round(history.mean(), 2),
        "std":      round(history.std(), 2),
        "min":      round(history.min(), 2),
        "max":      round(history.max(), 2),
        "median":   round(history.median(), 2),
        "null_pct": round(history.isnull().mean() * 100, 2),
    }

    print(f"📊 Normal range for '{column}':")
    print(f"   Average : {baseline['mean']}")
    print(f"   Std Dev : {baseline['std']}")
    print(f"   Min-Max : {baseline['min']} to {baseline['max']}\n")

    return baseline


# 3. Check if latest value is suspicious


def detect_drift(df, column, baseline):
    today_value = df[column].iloc[-1]  # last row = latest data

    z_score  = round((today_value - baseline["mean"]) / baseline["std"], 2)
    severity = round(min(abs(z_score) / 10 * 100, 100), 1)

    if abs(z_score) < 2:
        status = "🟢 NORMAL"
    elif abs(z_score) < 3:
        status = "🟡 WARNING"
    else:
        status = "🔴 CRITICAL"

    result = {
        "column":        column,
        "today_value":   today_value,
        "baseline_mean": baseline["mean"],
        "baseline_std":  baseline["std"],
        "z_score":       z_score,
        "severity":      severity,
        "status":        status,
    }

    print(f"🔍 Drift check for '{column}':")
    print(f"   Latest value  : {today_value}")
    print(f"   Normal average: {baseline['mean']} +/- {baseline['std']}")
    print(f"   Z-score       : {z_score}")
    print(f"   Severity      : {severity} / 100")
    print(f"   Status        : {status}\n")

    return result



# 4. Ask Gemini WHY this anomaly happened


def explain_with_gemini(result, context):
    prompt = f"""
You are a data quality analyst reviewing an anomaly alert.

The data being monitored: {context}

Anomaly details:
- Column name   : {result['column']}
- Latest value  : {result['today_value']}
- Normal average: {result['baseline_mean']} (+/- {result['baseline_std']})
- Z-score       : {result['z_score']}
- Severity      : {result['severity']} / 100
- Status        : {result['status']}

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
        print("   Double check your GEMINI_API_KEY in the .env file")
        return None


# RUN — only change these 3 lines for any project


if __name__ == "__main__":

    FILE    = "data/attendance.csv"       # your CSV file path
    COLUMN  = "teachers_present"          # column to monitor
    CONTEXT = "daily count of something"  # describe your data here

    df       = load_data(FILE)
    baseline = build_baseline(df, COLUMN)
    result   = detect_drift(df, COLUMN, baseline)

    if result["severity"] > 30:
        explain_with_gemini(result, context=CONTEXT)
    else:
        print("✅ Everything looks normal. No explanation needed.")