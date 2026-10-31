"""
Detection-quality benchmark for DriftWatch.

How it works
------------
DriftWatch judges the LATEST row/date against the history before it. So each
trial builds a synthetic history of normal data, appends one final "today":

  * a normal day            -> should NOT be flagged   (measures false alarms)
  * an anomalous day of a known size -> should be flagged (measures detection)

and asks the real detector functions from detector.py what they think.
Everything is seeded, so the numbers are reproducible.

Run:  python benchmarks/benchmark_detectors.py            (from backend/)
      python benchmarks/benchmark_detectors.py --trials 500
"""
import argparse
import contextlib
import io
import os
import sys

import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("GEMINI_API_KEY", "benchmark-not-used")

from detector import (  # noqa: E402
    check_category_column, check_isolation_forest, check_numeric_column, get_thresholds,
)

HISTORY_DAYS = 60
PER_DAY_ROWS = 50


def flagged(result):
    return result is not None and "NORMAL" not in result["status"]


def numeric_trial(rng, sigma_shift, th):
    hist = rng.normal(100, 10, HISTORY_DAYS)
    today = rng.normal(100, 10) + sigma_shift * 10
    df = pd.DataFrame({"date": range(HISTORY_DAYS + 1), "v": list(hist) + [today]})
    return flagged(check_numeric_column(df, "v", th))


def categorical_trial(rng, failure_rate_today, th):
    rows = []
    for d in range(HISTORY_DAYS):
        for v in rng.choice(["ok", "failed"], size=PER_DAY_ROWS, p=[0.9, 0.1]):
            rows.append((d, v))
    for v in rng.choice(["ok", "failed"], size=PER_DAY_ROWS,
                        p=[1 - failure_rate_today, failure_rate_today]):
        rows.append((HISTORY_DAYS, v))
    df = pd.DataFrame(rows, columns=["date", "status"])
    return flagged(check_category_column(df, "date", "status", th))


def isolation_trial(rng, anomalous, th):
    n = HISTORY_DAYS + 1
    teachers = rng.normal(16, 1, n)
    classes = teachers * 3 + rng.normal(0, 1, n)
    students = classes * 40 + rng.normal(0, 30, n)
    df = pd.DataFrame({"date": range(n), "teachers": teachers, "classes": classes, "students": students})
    if anomalous:   # each value individually plausible; the combination is not
        df.loc[n - 1, ["teachers", "classes", "students"]] = [16, 12, 12 * 40 * 0.1]
    return flagged(check_isolation_forest(df, "date", th))


def rate(fn, trials, seed, *args):
    rng = np.random.default_rng(seed)
    with contextlib.redirect_stdout(io.StringIO()):   # detectors print one line per call
        hits = sum(fn(rng, *args) for _ in range(trials))
    return 100 * hits / trials


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--trials", type=int, default=300)
    t = ap.parse_args().trials

    print(f"DriftWatch detector benchmark: {t} trials per cell, "
          f"{HISTORY_DAYS} days of history, seeded.\n")

    for sens in ("low", "medium", "high"):
        th = get_thresholds(sens)
        print(f"=== sensitivity: {sens.upper()} ===")

        fa = rate(numeric_trial, t, 1, 0.0, th)
        print(f"Z-Score    false alarm rate on normal days : {fa:5.1f}%")
        for k in (2, 3, 4, 6):
            print(f"Z-Score    detection of a {k}-sigma shift      : {rate(numeric_trial, t, 2, k, th):5.1f}%")

        fa = rate(categorical_trial, t, 3, 0.10, th)
        print(f"Chi-Square false alarm rate on normal days : {fa:5.1f}%")
        for fr in (0.20, 0.30, 0.50):
            print(f"Chi-Square detection of failure rate 10% -> {int(fr*100)}% : "
                  f"{rate(categorical_trial, t, 4, fr, th):5.1f}%")

        fa = rate(isolation_trial, t, 5, False, th)
        det = rate(isolation_trial, t, 6, True, th)
        print(f"IsoForest  false alarm rate on normal rows : {fa:5.1f}%")
        print(f"IsoForest  detection of impossible combo   : {det:5.1f}%\n")


if __name__ == "__main__":
    main()
