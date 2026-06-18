# 🌊 DriftWatch — AI-Powered Data Quality Monitor

> **Automatically watch your data. Detect anomalies. Understand why — before it becomes a problem.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-driftwatch--lovat.vercel.app-6366f1?style=for-the-badge&logo=vercel)](https://driftwatch-lovat.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Render-22c55e?style=for-the-badge&logo=render)](https://driftwatch-backend.onrender.com/)
[![GitHub](https://img.shields.io/badge/GitHub-user1--prajwal-1e293b?style=for-the-badge&logo=github)](https://github.com/user1-prajwal)

---

## The Problem

Data breaks silently. A payment column fills with nulls. Daily sales crash from ₹46,000 to ₹8,000. API failures spike from 10% to 80%. Nobody notices for hours — until revenue drops or customers complain.

Existing tools like Datadog or Monte Carlo are expensive enterprise products. Nothing simple, visual, and self-explaining exists for small and mid-size teams.

**DriftWatch fixes this.**

---

## What It Does

Connect your Google Sheet once. DriftWatch watches it automatically on your schedule — every hour, every day, whenever you want. When something looks wrong, it sends you a plain-English email explaining **what happened, why, and what to do** — powered by Google Gemini AI.

---

## Live Demo

**→ [https://driftwatch-lovat.vercel.app/](https://driftwatch-lovat.vercel.app/)**

> Backend hosted on Render free tier — first request may take ~30 seconds to wake up.

### Try it instantly (no login needed):
1. Click **"One-time Scan"**
2. Upload the sample CSV below
3. Select columns to monitor
4. Click **"Check for anomalies"**
5. See AI-powered results instantly

**Sample CSV to test with:** Save as `test_data.csv`
```
date,daily_sales,orders,returns
2024-01-01,45000,120,5
2024-01-02,47000,125,4
2024-01-03,44000,118,6
2024-01-04,46000,122,5
2024-01-05,48000,128,4
2024-01-06,45500,121,5
2024-01-07,47500,126,4
2024-01-08,46000,123,5
2024-01-09,45000,119,6
2024-01-10,47000,124,4
2024-01-11,46500,122,5
2024-01-12,8000,12,45
```
> Last row is the anomaly day — sales crashed, orders crashed, returns spiked.

---

## How It Works

```
Your Google Sheet (live data)
         ↓
DriftWatch fetches it automatically on schedule
         ↓
3 ML models analyse every selected column
         ↓
Google Gemini AI explains WHY in plain English
         ↓
Simple email alert → "2 issues found → View Dashboard"
         ↓
User clicks → sees full history, graphs, AI explanation
```

---

## Three ML Detectors — Working Together

Most monitoring tools use one detection method. DriftWatch uses three, combined into a single severity score.

### 1. Z-Score Detector (Numeric Drift)
Detects when a numeric column's latest value is statistically far from its historical average.
```
daily_sales: normally ~₹46,000
Today's value: ₹8,000
Z-score: -12.8 → CRITICAL (>3σ from mean)
```

### 2. Chi-Square Detector (Categorical Drift)
Detects when the distribution of a category column changes significantly.
```
API status — normal: success 80%, failed 10%
Today:              success 10%, failed 80%
P-value: 0.0004 → CRITICAL (statistically significant shift)
```

### 3. Isolation Forest (Row-Level Anomaly)
Detects rows that look suspicious across **multiple columns simultaneously** — anomalies that Z-score alone would miss.
```
teachers_present: 16 (looks normal individually)
classes_held: 1, students_present: 12
→ Row-level anomaly detected across all columns together
```

### Combined Severity Score
All three scores are combined into a single **0–100 severity metric** per column. Users never see Z-scores or p-values — just plain English.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                    │
│  Landing Page → One-time Scan → Auto Monitors Dashboard │
│         Vercel · supabase-js · axios                    │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API (JWT Auth)
┌──────────────────────▼──────────────────────────────────┐
│                   BACKEND (FastAPI)                     │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐   │
│  │  /scan      │  │  /monitors   │  │  /history     │   │
│  │  (public)   │  │  (auth req)  │  │  (auth req)   │   │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘   │
│         │                │                   │          │
│  ┌──────▼────────────────▼───────────────────▼───────┐  │
│  │              ML Engine (detector.py)              │  │
│  │   Z-Score · Chi-Square · Isolation Forest         │  │
│  │   + clean_numeric() for text-number handling      │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │                               │
│  ┌──────────────────────▼────────────────────────────┐  │
│  │           Google Gemini AI (explanation)          │  │
│  │   Structured prompt → plain English response      │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │                               │
│  ┌──────────────────────▼────────────────────────────┐  │
│  │              APScheduler (background)             │  │
│  │   Per-user intervals · Google Sheets fetch        │  │
│  │   Auto email alert · Save to scan_history         │  │
│  └───────────────────────────────────────────────────┘  │
│                    Render (Python)                      │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    SUPABASE                             │
│                                                         │
│  PostgreSQL Database                                    │
│  ├── monitors table (user_id FK, RLS enabled)           │
│  └── scan_history table (monitor_id FK, RLS enabled)    │
│                                                         │
│  Auth (email + Google OAuth)                            │
│  Row Level Security → DB-level data isolation           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Architecture

**Multi-user data isolation** enforced at two levels:

1. **Application level** — JWT token verified on every protected route. `user_id` extracted from token, never from request body.

2. **Database level (Row Level Security)** — PostgreSQL RLS policy:
   ```sql
   create policy "Users see own monitors"
     on monitors for all
     using (auth.uid() = user_id);
   ```
   Even if there's a bug in the API code, the database physically cannot return another user's data.

---

## Key Design Decisions

| Decision | Why |
|----------|-----|
| Stateless one-time scans | No DB writes → scales infinitely, no login friction |
| Auth only for auto monitors | Users can try the product instantly without signup |
| Google Sheets only for monitors | Local CSV paths don't exist on deployed servers |
| Plain English results | Z-scores and p-values mean nothing to non-technical users |
| No email on NORMAL status | Silence = good news. Only alert when action is needed |
| Sensitivity levels (Low/Medium/High) | Different data has different tolerance levels |
| `clean_numeric()` preprocessing | Google Sheets stores "45,000" as text — this fixes it |

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Axios |
| Backend | Python, FastAPI, Uvicorn |
| ML | scikit-learn (Isolation Forest), scipy (chi-square, Z-score), pandas |
| AI | Google Gemini 1.5 Flash API |
| Auth | Supabase Auth (email + Google OAuth2) |
| Database | Supabase PostgreSQL + Row Level Security |
| Scheduler | APScheduler (BackgroundScheduler) |
| Email | Gmail SMTP (smtplib) |
| Data Source | Google Sheets (CSV export URL) |
| Deploy | Vercel (frontend) + Render (backend) |

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/health` | ❌ | Server health check |
| POST | `/scan` | ❌ | One-time stateless scan |
| POST | `/columns` | ❌ | Get CSV column names |
| POST | `/monitors` | ✅ | Create auto monitor |
| GET | `/monitors` | ✅ | List user's monitors |
| POST | `/monitors/{id}/run` | ✅ | Trigger manual scan |
| POST | `/monitors/{id}/pause` | ✅ | Pause a monitor |
| POST | `/monitors/{id}/resume` | ✅ | Resume a monitor |
| DELETE | `/monitors/{id}` | ✅ | Delete a monitor |
| GET | `/monitors/{id}/history` | ✅ | Get scan history |

---

## Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase account (free)
- Google Gemini API key (free)
- Gmail account with App Password

### Backend Setup

```bash
# Clone repo
git clone https://github.com/user1-prajwal/driftwatch.git
cd driftwatch/backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Fill in your keys (see Environment Variables below)

# Run backend
python -m uvicorn main:app --reload
# API running at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend Setup

```bash
cd driftwatch/frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_SUPABASE_URL=your_url" > .env
echo "REACT_APP_SUPABASE_ANON_KEY=your_key" >> .env

# Run frontend
npm start
# App running at http://localhost:3000
```

### Environment Variables

**Backend `.env`:**
```
GEMINI_API_KEY=your_gemini_api_key
EMAIL_SENDER=your_gmail@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

**Frontend `.env`:**
```
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

### Database Setup (Supabase)

Run this SQL in your Supabase SQL Editor:

```sql
-- Monitors table
create table monitors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  source_type text not null,
  source_value text not null,
  date_column text not null,
  context text not null,
  sensitivity text default 'medium',
  alert_email text not null,
  interval_hours integer not null,
  monitor_columns text default '',
  status text default 'active',
  created_at timestamptz default now(),
  last_run timestamptz,
  last_status text,
  total_runs integer default 0,
  total_alerts integer default 0
);

alter table monitors enable row level security;
create policy "Users see own monitors"
  on monitors for all using (auth.uid() = user_id);

-- Scan history table
create table scan_history (
  id uuid default gen_random_uuid() primary key,
  monitor_id uuid references monitors(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  scanned_at timestamptz default now(),
  overall_status text not null,
  total_columns integer default 0,
  critical_count integer default 0,
  warning_count integer default 0,
  normal_count integer default 0,
  column_results jsonb,
  alert_sent boolean default false
);

alter table scan_history enable row level security;
create policy "Users see own history"
  on scan_history for all using (auth.uid() = user_id);

create index scan_history_monitor_id_idx on scan_history(monitor_id);
create index scan_history_scanned_at_idx on scan_history(scanned_at desc);
```

---

## 📁 Project Structure

```
driftwatch/
├── backend/
│   ├── main.py              # FastAPI app + all routes
│   ├── detector.py          # ML engine (Z-score, Chi-square, IF)
│   ├── scheduler.py         # APScheduler + Google Sheets fetcher
│   ├── monitors.py          # Supabase monitor CRUD
│   ├── alerts.py            # Gmail SMTP email alerts
│   ├── auth.py              # JWT verification middleware
│   ├── supabase_client.py   # Supabase client setup
│   ├── requirements.txt
│   └── data/                # Temp files (auto-cleaned)
│
└── frontend/
    ├── src/
    │   ├── App.js            # Landing page + routing
    │   ├── ScanPage.js       # One-time scan flow
    │   ├── MonitorsPage.js   # Auto monitors dashboard
    │   ├── AuthModal.js      # Login/signup popup
    │   └── supabaseClient.js # Supabase JS client
    └── package.json
```

---

##  Author

**Prajwal** — 3rd year CSE student at East West Institute of Technology, Bengaluru

[![LinkedIn](https://img.shields.io/badge/LinkedIn-prajwal--poojari451-0077b5?style=flat&logo=linkedin)](https://linkedin.com/in/user1-prajwal451)
[![GitHub](https://img.shields.io/badge/GitHub-user1--prajwal-1e293b?style=flat&logo=github)](https://github.com/user1-prajwal)

---

*Built with the goal of making data quality monitoring accessible to everyone — not just enterprises with Datadog budgets.*
