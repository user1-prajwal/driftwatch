# Backend tests

    cd backend
    pip install -r requirements-dev.txt
    pytest                          # 79 tests, ~3 seconds, no secrets or network needed
    pytest --cov=. --cov-report=term-missing

Supabase, Gemini and Brevo are mocked in `conftest.py`, so tests never touch real services.

| File | What it covers |
|---|---|
| test_detector.py | Z-Score, Chi-Square, Isolation Forest, `clean_numeric`, Gemini gating and failure handling |
| test_api.py | public routes, input validation, JWT enforcement, per-user isolation |
| test_alerts_scheduler.py | email-only-on-anomaly policy, Brevo failures, scheduler run/pause/error paths, rebuilding jobs from the database on startup |
| test_abuse_protection.py | rate limits, upload size cap, safe temp filenames |

## Benchmarks (not part of CI)

    python benchmarks/benchmark_detectors.py --trials 300   # detection rate and false-alarm rate
    python benchmarks/benchmark_scale.py --rows 1000000 --profile
