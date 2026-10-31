# """
# Scale benchmark: generate a large CSV and time each stage of a scan.
# Gemini is stubbed so the numbers measure DriftWatch itself, not the network.

# Run:  python benchmarks/benchmark_scale.py --rows 1000000
# """
# import argparse
# import cProfile
# import os
# import pstats
# import resource
# import sys
# import tempfile
# import time

# import numpy as np
# import pandas as pd

# sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# os.environ.setdefault("GEMINI_API_KEY", "benchmark-not-used")

# import detector  # noqa: E402

# detector.explain_with_gemini = lambda result, context: None


# def make_csv(path, rows):
#     rng = np.random.default_rng(0)
#     days = 1000
#     df = pd.DataFrame({
#         "date": np.repeat(pd.date_range("2023-01-01", periods=days).astype(str), rows // days + 1)[:rows],
#         "orders": rng.normal(1000, 50, rows).round(0),
#         "revenue": rng.normal(45000, 2000, rows).round(2),
#         "returns": rng.normal(100, 10, rows).round(0),
#         "latency_ms": rng.normal(200, 20, rows).round(1),
#         "status": rng.choice(["success", "failed", "pending"], rows, p=[0.9, 0.07, 0.03]),
#     })
#     df.to_csv(path, index=False)
#     return os.path.getsize(path) / 1e6


# def main():
#     ap = argparse.ArgumentParser()
#     ap.add_argument("--rows", type=int, default=1_000_000)
#     ap.add_argument("--profile", action="store_true", help="print the top slowest functions")
#     a = ap.parse_args()

#     with tempfile.TemporaryDirectory() as d:
#         path = os.path.join(d, "big.csv")
#         mb = make_csv(path, a.rows)
#         print(f"Dataset: {a.rows:,} rows x 6 columns, {mb:.0f} MB CSV\n")

#         t = time.perf_counter()
#         df = pd.read_csv(path)
#         print(f"  read_csv                  {time.perf_counter() - t:6.2f}s")

#         t = time.perf_counter()
#         df = detector.clean_numeric(df, "date")
#         print(f"  clean_numeric             {time.perf_counter() - t:6.2f}s")

#         th = detector.get_thresholds("medium")
#         for col in ("orders", "revenue", "returns", "latency_ms"):
#             t = time.perf_counter()
#             detector.check_numeric_column(df, col, th)
#         print(f"  numeric checks (4 cols)   {time.perf_counter() - t:6.2f}s  (last one shown)")

#         t = time.perf_counter()
#         detector.check_category_column(df, "date", "status", th)
#         print(f"  categorical check         {time.perf_counter() - t:6.2f}s")

#         t = time.perf_counter()
#         detector.check_isolation_forest(df, "date", th)
#         print(f"  isolation forest          {time.perf_counter() - t:6.2f}s")

#         print("\nFull run_driftwatch():")
#         pr = cProfile.Profile()
#         t = time.perf_counter()
#         if a.profile:
#             pr.enable()
#         detector.run_driftwatch(path, "date", "benchmark")
#         if a.profile:
#             pr.disable()
#         print(f"  total                     {time.perf_counter() - t:6.2f}s")
#         print(f"  peak memory (RSS)         {resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024:6.0f} MB")

#         if a.profile:
#             print()
#             pstats.Stats(pr).sort_stats("cumulative").print_stats(12)


# if __name__ == "__main__":
#     main()



"""
Scale benchmark: 1M rows, 1 numeric column.

Run:
    python benchmarks/benchmark_scale.py --rows 1000000
"""

import argparse
import os
import sys
import tempfile
import time

import numpy as np
import pandas as pd

# Cross-platform memory measurement
try:
    import resource

    def get_memory_mb():
        usage = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
        if sys.platform == "darwin":
            return usage / (1024 * 1024)
        return usage / 1024

except ImportError:
    import psutil

    def get_memory_mb():
        process = psutil.Process(os.getpid())
        return process.memory_info().rss / (1024 * 1024)


sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("GEMINI_API_KEY", "benchmark-not-used")

import detector  # noqa: E402

# Prevent real Gemini calls
detector.explain_with_gemini = lambda result, context: None


def make_csv(path, rows):
    rng = np.random.default_rng(0)

    df = pd.DataFrame({
        "date": pd.date_range(
            "2023-01-01",
            periods=rows,
            freq="min",
        ).astype(str),

        "orders": rng.normal(
            1000,
            50,
            rows,
        ).round(0),
    })

    df.to_csv(path, index=False)

    return os.path.getsize(path) / 1e6


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--rows",
        type=int,
        default=1_000_000,
    )

    args = parser.parse_args()

    with tempfile.TemporaryDirectory() as temp_dir:

        path = os.path.join(
            temp_dir,
            "benchmark.csv",
        )

        print(f"Generating {args.rows:,} rows...")

        size_mb = make_csv(
            path,
            args.rows,
        )

        print(
            f"Dataset: {args.rows:,} rows x 2 columns "
            f"({size_mb:.0f} MB)\n"
        )

        # Read CSV
        start = time.perf_counter()

        df = pd.read_csv(path)

        read_time = time.perf_counter() - start

        print(
            f"  read_csv              {read_time:6.2f}s"
        )

        # Clean numeric data
        start = time.perf_counter()

        df = detector.clean_numeric(
            df,
            "date",
        )

        clean_time = time.perf_counter() - start

        print(
            f"  clean_numeric         {clean_time:6.2f}s"
        )

        # Single numeric detector
        thresholds = detector.get_thresholds("medium")

        start = time.perf_counter()

        detector.check_numeric_column(
            df,
            "orders",
            thresholds,
        )

        detector_time = time.perf_counter() - start

        print(
            f"  z-score detector      {detector_time:6.2f}s"
        )

        # Full DriftWatch run
        print("\nFull run_driftwatch():")

        start = time.perf_counter()

        detector.run_driftwatch(
            path,
            "date",
            "benchmark",
        )

        total_time = time.perf_counter() - start

        print(
            f"  total                 {total_time:6.2f}s"
        )

        print(
            f"  memory                "
            f"{get_memory_mb():6.0f} MB"
        )


if __name__ == "__main__":
    main()