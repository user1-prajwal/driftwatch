"""Unit tests for the detection engine (detector.py). No network, no database."""
import numpy as np
import pandas as pd
import pytest

import detector
from detector import (
    check_category_column,
    check_isolation_forest,
    check_numeric_column,
    clean_numeric,
    get_thresholds,
    human_readable_change,
    run_driftwatch,
)

MEDIUM = get_thresholds("medium")


def daily_numeric(history, today, col="value"):
    n = len(history) + 1
    return pd.DataFrame(
        {"date": pd.date_range("2026-01-01", periods=n).astype(str),
         col: list(history) + [today]}
    )


# ---------------------------------------------------------------- thresholds
def test_sensitivity_levels_are_ordered():
    low, med, high = (get_thresholds(s) for s in ("low", "medium", "high"))
    assert low["critical"] > med["critical"] > high["critical"]


def test_unknown_sensitivity_falls_back_to_medium():
    assert get_thresholds("banana") == get_thresholds("medium")
    assert get_thresholds("  HIGH ") == get_thresholds("high")


# --------------------------------------------------------------- clean_numeric
def test_clean_numeric_strips_commas_currency_and_percent():
    df = pd.DataFrame({"date": ["d1", "d2"], "sales": ["45,000", "₹1,000"], "rate": ["10%", "$5"]})
    out = clean_numeric(df, "date")
    assert out["sales"].tolist() == [45000, 1000]
    assert out["rate"].tolist() == [10, 5]


def test_clean_numeric_leaves_categorical_and_date_columns_alone():
    df = pd.DataFrame({"date": ["2026-01-01"] * 3, "status": ["ok", "failed", "ok"]})
    out = clean_numeric(df, "date")
    assert out["status"].tolist() == ["ok", "failed", "ok"]
    assert out["date"].tolist() == ["2026-01-01"] * 3


def test_clean_numeric_converts_mostly_numeric_column_with_a_few_bad_cells():
    df = pd.DataFrame({"date": list("abcd"), "x": ["1", "2", "3", "N/A"]})
    out = clean_numeric(df, "date")
    assert out["x"].isna().sum() == 1
    assert out["x"].dropna().tolist() == [1, 2, 3]


# ------------------------------------------------------------- numeric (Z-score)
def test_numeric_normal_day_is_normal():
    r = check_numeric_column(daily_numeric([100, 102, 98, 101, 99, 103], 100), "value", MEDIUM)
    assert "NORMAL" in r["status"]


def test_numeric_spike_is_critical():
    r = check_numeric_column(daily_numeric([100, 102, 98, 101, 99, 103], 500), "value", MEDIUM)
    assert "CRITICAL" in r["status"]
    assert r["z_score"] > 0
    assert r["severity"] == 100.0  # capped


def test_numeric_crash_has_negative_z_and_says_lower():
    r = check_numeric_column(daily_numeric([100, 102, 98, 101, 99, 103], 10), "value", MEDIUM)
    assert r["z_score"] < 0
    assert "lower" in r["change_text"]


def test_numeric_constant_history_returns_none():
    assert check_numeric_column(daily_numeric([5, 5, 5, 5], 9), "value", MEDIUM) is None


def test_numeric_severity_is_capped_at_100_and_scales_linearly():
    r = check_numeric_column(daily_numeric([100, 102, 98, 101, 99, 103], 108), "value", MEDIUM)
    assert 0 < r["severity"] < 100
    assert r["severity"] == pytest.approx(min(abs(r["z_score"]) / 10 * 100, 100), abs=0.1)


def test_numeric_single_history_row_does_not_produce_nan():
    """With one history row std() is NaN. The check must skip, not emit NaN."""
    r = check_numeric_column(daily_numeric([100], 500), "value", MEDIUM)
    assert r is None or not np.isnan(r["z_score"])


def test_numeric_missing_today_value_does_not_produce_nan():
    r = check_numeric_column(daily_numeric([100, 102, 98, 101], np.nan), "value", MEDIUM)
    assert r is None or not np.isnan(r["z_score"])


def test_higher_sensitivity_flags_a_smaller_deviation():
    df = daily_numeric([100, 102, 98, 101, 99, 103, 100, 97], 104)
    low = check_numeric_column(df, "value", get_thresholds("low"))
    high = check_numeric_column(df, "value", get_thresholds("high"))
    assert "NORMAL" in low["status"]
    assert "NORMAL" not in high["status"]


def test_human_readable_change_handles_zero_baseline():
    assert human_readable_change(5, 0, "x") == "went from 0 to 5"


# ---------------------------------------------------------- categorical (Chi-square)
def categorical_df(history_mix, today_mix, days=10, per_day=50):
    rng = np.random.default_rng(0)
    rows = []
    for d in range(days):
        for v in rng.choice(list(history_mix), size=per_day, p=list(history_mix.values())):
            rows.append((f"2026-01-{d + 1:02d}", v))
    for v in rng.choice(list(today_mix), size=per_day, p=list(today_mix.values())):
        rows.append((f"2026-01-{days + 1:02d}", v))
    return pd.DataFrame(rows, columns=["date", "status"])


def test_categorical_stable_mix_is_normal():
    mix = {"ok": 0.9, "failed": 0.1}
    r = check_category_column(categorical_df(mix, mix), "date", "status", MEDIUM)
    assert "NORMAL" in r["status"]


def test_categorical_big_shift_is_critical_and_names_the_category():
    r = check_category_column(
        categorical_df({"ok": 0.9, "failed": 0.1}, {"ok": 0.2, "failed": 0.8}),
        "date", "status", MEDIUM,
    )
    assert "CRITICAL" in r["status"]
    assert r["p_value"] < 0.01
    # the largest swing is reported; "ok" falling and "failed" rising are the same shift
    assert ('"failed" increased' in r["change_text"]) or ('"ok" decreased' in r["change_text"])


def test_categorical_new_value_appearing_today_is_flagged():
    df = categorical_df({"ok": 1.0}, {"ok": 0.5, "refunded": 0.5})
    r = check_category_column(df, "date", "status", MEDIUM)
    assert "NORMAL" not in r["status"]


def test_categorical_single_date_does_not_crash():
    """Only one date in the file means there is no history to compare to."""
    df = pd.DataFrame({"date": ["2026-01-01"] * 4, "status": ["a", "b", "a", "b"]})
    try:
        r = check_category_column(df, "date", "status", MEDIUM)
    except Exception as exc:  # noqa: BLE001
        pytest.fail(f"crashed on a single-date file: {exc!r}")
    assert r is None or "NORMAL" in r["status"]


def test_categorical_constant_column_does_not_crash():
    df = pd.DataFrame({"date": [f"2026-01-{d:02d}" for d in range(1, 8)] * 2,
                       "status": ["ok"] * 14})
    try:
        r = check_category_column(df, "date", "status", MEDIUM)
    except Exception as exc:  # noqa: BLE001
        pytest.fail(f"crashed on a constant category column: {exc!r}")
    assert r is None or "NORMAL" in r["status"]


# ---------------------------------------------------------------- Isolation Forest
def multi_df(rows=60, seed=1):
    rng = np.random.default_rng(seed)
    teachers = rng.normal(16, 1, rows)
    classes = teachers * 3 + rng.normal(0, 1, rows)       # classes track teachers
    students = classes * 40 + rng.normal(0, 30, rows)     # students track classes
    return pd.DataFrame({"date": pd.date_range("2026-01-01", periods=rows).astype(str),
                         "teachers": teachers, "classes": classes, "students": students})


def test_isolation_forest_needs_two_numeric_columns():
    df = multi_df()[["date", "teachers"]]
    assert check_isolation_forest(df, "date", MEDIUM) is None


def test_isolation_forest_needs_ten_history_rows():
    assert check_isolation_forest(multi_df(rows=8), "date", MEDIUM) is None


def test_isolation_forest_flags_impossible_combination_of_normal_looking_values():
    """16 teachers is normal, 1 class is rare, 12 students is rare: the combination is the anomaly."""
    df = multi_df()
    df.loc[df.index[-1], ["teachers", "classes", "students"]] = [16, 1, 12]
    r = check_isolation_forest(df, "date", MEDIUM)
    assert r is not None
    assert "NORMAL" not in r["status"]
    assert r["type"] == "isolation_forest"
    assert set(r["top_deviants"]) <= {"teachers", "classes", "students"}


def test_isolation_forest_normal_row_is_normal():
    r = check_isolation_forest(multi_df(), "date", MEDIUM)
    assert "NORMAL" in r["status"]
    assert r["severity"] <= 25


def test_isolation_forest_is_deterministic():
    df = multi_df()
    assert check_isolation_forest(df, "date", MEDIUM)["if_score"] == \
           check_isolation_forest(df, "date", MEDIUM)["if_score"]


# ------------------------------------------------------------------ run_driftwatch
def write_csv(tmp_path, df, name="data.csv"):
    p = tmp_path / name
    df.to_csv(p, index=False)
    return str(p)


def test_run_driftwatch_end_to_end_flags_the_spike(tmp_path, no_gemini):
    df = daily_numeric([100, 102, 98, 101, 99, 103, 100, 101], 900, col="sales")
    results = run_driftwatch(write_csv(tmp_path, df), "date", "daily sales")
    sales = next(r for r in results if r["column"] == "sales")
    assert "CRITICAL" in sales["status"]


def test_gemini_is_only_called_for_severe_results(tmp_path, no_gemini):
    df = daily_numeric([100, 102, 98, 101, 99, 103, 100, 101], 900, col="sales")
    df["calm"] = [50, 51, 49, 50, 52, 48, 50, 51, 50]
    run_driftwatch(write_csv(tmp_path, df), "date", "ctx")
    assert "sales" in no_gemini
    assert "calm" not in no_gemini


def test_gemini_failure_does_not_break_the_scan(tmp_path, monkeypatch):
    class Boom:
        class models:
            @staticmethod
            def generate_content(**_):
                raise RuntimeError("quota exceeded")
    monkeypatch.setattr(detector, "client", Boom)
    df = daily_numeric([100, 102, 98, 101, 99, 103, 100, 101], 900, col="sales")
    results = run_driftwatch(write_csv(tmp_path, df), "date", "ctx")
    sales = next(r for r in results if r["column"] == "sales")
    assert "CRITICAL" in sales["status"]
    assert sales["gemini_explanation"] is None


def test_monitor_columns_and_skip_columns_are_respected(tmp_path, no_gemini):
    df = daily_numeric([100, 102, 98, 101, 99, 103, 100, 101], 900, col="sales")
    df["returns"] = [5, 6, 5, 4, 5, 6, 5, 5, 5]
    path = write_csv(tmp_path, df)
    only_sales = run_driftwatch(path, "date", "ctx", monitor_columns=["sales"])
    assert {r["column"] for r in only_sales if r["type"] != "isolation_forest"} == {"sales"}
    skipped = run_driftwatch(path, "date", "ctx", skip_columns=["sales"])
    assert "sales" not in {r["column"] for r in skipped}


def test_comma_formatted_numbers_are_scanned_as_numbers(tmp_path, no_gemini):
    df = pd.DataFrame({
        "date": pd.date_range("2026-01-01", periods=9).astype(str),
        "sales": ["45,000", "46,000", "44,500", "45,200", "45,800", "44,900", "45,100", "45,300", "9,000"],
    })
    results = run_driftwatch(write_csv(tmp_path, df), "date", "ctx")
    sales = next(r for r in results if r["column"] == "sales")
    assert sales["type"] == "numeric"
    assert "CRITICAL" in sales["status"]


# ------------------------------------------------------- clean_numeric performance guards
def test_clean_numeric_does_not_touch_columns_that_are_already_numeric():
    df = pd.DataFrame({"date": list("abc"), "n": [1, 2, 3], "f": [1.5, 2.5, 3.5]})
    out = clean_numeric(df, "date")
    assert out["n"].dtype.kind == "i" and out["f"].dtype.kind == "f"
    assert out["n"].tolist() == [1, 2, 3]


def test_clean_numeric_still_converts_a_big_formatted_column_but_skips_big_text_column():
    n = 5000
    df = pd.DataFrame({
        "date": ["d"] * n,
        "money": [f"{1000 + i % 50:,}" for i in range(n)],     # "1,023"
        "status": ["ok", "failed", "pending", "ok", "ok"] * (n // 5),
    })
    out = clean_numeric(df, "date")
    assert pd.api.types.is_numeric_dtype(out["money"])
    assert out["status"].dtype == object or str(out["status"].dtype).startswith("str")


def test_isolation_forest_handles_a_large_history_by_sampling(monkeypatch):
    monkeypatch.setattr(detector, "IF_MAX_TRAIN_ROWS", 200)
    df = multi_df(rows=1000)
    df.loc[df.index[-1], ["teachers", "classes", "students"]] = [16, 1, 12]
    r = check_isolation_forest(df, "date", MEDIUM)
    assert r is not None and "NORMAL" not in r["status"]
