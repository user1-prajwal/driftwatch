"""
Shared test setup.

Why the stubs? detector.py, supabase_client.py and alerts.py create API clients
at import time. Tests must never touch the real Supabase project, Gemini or
Brevo, so we provide dummy env vars and a fake supabase_client module BEFORE
any application module is imported.
"""
import os
import sys
import types
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ.setdefault("GEMINI_API_KEY", "test-gemini-key")
os.environ.setdefault("BREVO_API_KEY", "test-brevo-key")
os.environ.setdefault("BREVO_SENDER_EMAIL", "alerts@example.com")
# small limits so the abuse-protection tests stay fast
os.environ["RATE_LIMIT_SCAN"] = "5/minute"
os.environ["RATE_LIMIT_COLUMNS"] = "5/minute"
os.environ["MAX_UPLOAD_MB"] = "1"

_fake_supabase = types.ModuleType("supabase_client")


def _no_login_configured(token):
    raise RuntimeError("tests must configure get_user explicitly")


# A plain object, not a MagicMock: monkeypatching attributes of a MagicMock
# can leave it in a broken state, which made tests depend on their order.
_fake_supabase.supabase_anon = SimpleNamespace(auth=SimpleNamespace(get_user=_no_login_configured))
_fake_supabase.supabase_admin = MagicMock(name="supabase_admin")
sys.modules["supabase_client"] = _fake_supabase


@pytest.fixture
def workdir(tmp_path, monkeypatch):
    """main.py and scheduler.py write temp files to a relative 'data/' folder."""
    (tmp_path / "data").mkdir()
    monkeypatch.chdir(tmp_path)
    return tmp_path


@pytest.fixture
def no_gemini(monkeypatch):
    """Replace the Gemini call with a stub and record how often it is called."""
    import detector

    calls = []

    def fake_explain(result, context):
        calls.append(result["column"])
        return "WHAT HAPPENED:\nstub"

    monkeypatch.setattr(detector, "explain_with_gemini", fake_explain)
    return calls


@pytest.fixture
def user_a():
    return SimpleNamespace(id="user-a-id", email="a@example.com")


@pytest.fixture
def client(user_a, workdir):
    """FastAPI test client, logged in as user A. Startup hooks are NOT run
    (no `with` block), so the real scheduler never starts during tests."""
    from fastapi.testclient import TestClient
    import main
    from auth import get_current_user

    main.app.dependency_overrides[get_current_user] = lambda: user_a
    yield TestClient(main.app)
    main.app.dependency_overrides.clear()


@pytest.fixture
def anon_client(workdir):
    """FastAPI test client with NO login override (real auth dependency)."""
    from fastapi.testclient import TestClient
    import main

    main.app.dependency_overrides.clear()
    return TestClient(main.app)


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Rate-limit counters live in memory; start every test with a clean slate."""
    limiter = getattr(sys.modules.get("main"), "limiter", None)
    if limiter is not None:          # older versions of main.py have no limiter
        limiter.reset()
    yield
