# SIH26139 — Egreen Quanta

> A retinal-image **screening and clinical decision-support** application for diabetic retinopathy and cataract risk. Built for Smart India Hackathon 2026.

**Live deployment:** [sih-psi-nine.vercel.app](https://sih-psi-nine.vercel.app/)

**Important:** this project is a prototype screening aid. It is not a medical device, does not provide a diagnosis, and must not replace evaluation by a qualified clinician.

## What it does

SIH26139 helps an eye-care workflow process retinal fundus photographs and organize follow-up care. It provides:

- Single-image and batch (camp-mode) image uploads
- Retinopathy/cataract probability, risk band, uncertainty, and heatmap responses
- Patient records, scan history, and risk trends
- Role-based accounts for camp staff, doctors, and administrators
- Doctor review and risk-level override APIs
- Referral creation, referral suggestions, facility lookup, and PDF letters
- Scan reports, audit logging, notifications, and operational metrics

The frontend implements the public site, authentication, screening, scan history/detail, patients, and administrative pages. The `/referrals` frontend page is currently marked **coming soon**; its supporting backend endpoints are available.

## Current ML status

The application has a defined inference integration point and persists model metadata with each scan. The current implementation uses a deterministic placeholder model (`stub-v0`); trained hybrid quantum/ML weights are not included in this repository. Consequently, predictions, explanations, and heatmaps are suitable for development and demonstration only—not clinical use.

## Architecture

```text
Fundus image
    │
    ▼
React + TypeScript frontend
    │  HTTP / JWT
    ▼
FastAPI backend ──► inference adapter ──► prediction + risk level + heatmap
    │
    ├──► SQLite (local development) / PostgreSQL (deployment)
    ├──► patients, scans, reviews, referrals, notifications, audit logs
    └──► PDF scan reports and referral letters
```

## Technology

| Area | Tools |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query |
| API | FastAPI, Uvicorn, Pydantic |
| Persistence | SQLAlchemy 2, SQLite for local development, PostgreSQL for deployment |
| Security | JWT authentication, bcrypt password hashing, role checks, rate limiting, CORS |
| Files and reports | Pillow, ReportLab |
| Local orchestration | Docker Compose |

## Repository layout

```text
.
├── backend/                  # FastAPI application, persistence, reports, and tests
│   ├── app/api/              # API route modules
│   ├── app/db/               # SQLAlchemy models and CRUD helpers
│   ├── app/ml/               # Inference adapter, model loading, and explanations
│   └── tests/                # Backend test suite
├── frontend/                 # React/Vite application
│   └── src/pages/            # Marketing, auth, screening, scans, patients, admin
├── docker-compose.yml        # Local PostgreSQL + backend + frontend stack
├── smoke_test.sh             # End-to-end API smoke test script
└── vercel.json               # Combined frontend/API deployment routing
```

## Prerequisites

- Python 3.11+ (the current Docker image uses Python 3.11)
- Node.js 20+ and npm
- Optional: Docker Desktop for the containerized stack

## Run locally

### 1. Start the API

The backend defaults to a local SQLite database and the stub model, so it can run with no environment variables.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Once running, open <http://localhost:8000/docs> for the interactive API reference. The health endpoint is <http://localhost:8000/api/v1/health>.

### 2. Start the frontend

In another terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The Vite application runs at <http://localhost:3000>. `frontend/.env.example` points it to `http://localhost:8000`; change `VITE_API_BASE_URL` only when the API is hosted elsewhere.

### 3. Run the test suite

```bash
cd backend
pytest -q
```

For a browser/API integration check, start the API first and then run `./smoke_test.sh` from the repository root. The script creates demo accounts and records in the active development database.

## Run with Docker Compose

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

This starts PostgreSQL on `5432`, the FastAPI API on `8000`, and the Vite preview server on `5173`. Compose supplies the backend's database URL, so the placeholder `DATABASE_URL` in `backend/.env` is overridden.

Stop services with `docker compose down`. Add `-v` only if you intentionally want to remove the local PostgreSQL volume and its data.

## Configuration

Copy `backend/.env.example` to `backend/.env` to override defaults. Never commit credentials or a real secret key.

| Variable | Purpose | Local default |
| --- | --- | --- |
| `DATABASE_URL` | SQLAlchemy database connection | `sqlite:///./local_dev.db` |
| `MODEL_PATH` | Path for future trained model weights | `./models/model_weights.pt` |
| `MODEL_VERSION` | Version stored in scan responses | `stub-v0` |
| `RISK_THRESHOLD_MEDIUM` / `RISK_THRESHOLD_HIGH` | Risk-band thresholds | `0.4` / `0.7` |
| `ALLOWED_ORIGINS` | Comma-separated browser origins | `http://localhost:3000,http://localhost:5173` |
| `SECRET_KEY` | JWT signing key | Development-only value; change for any deployment |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT lifetime | `60` |
| `UPLOAD_RATE_LIMIT` | Upload throttle | `25/minute` |
| `VITE_API_BASE_URL` | Frontend API origin | `http://localhost:8000` |

## API overview

All API routes use the `/api/v1` prefix unless noted otherwise. FastAPI's generated OpenAPI documentation is the authoritative request/response reference.

| Area | Key endpoints |
| --- | --- |
| Health and metrics | `GET /health`, `GET /metrics` |
| Authentication | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Screening | `POST /scans`, `GET /scans`, `GET /scans/{id}`, `POST /batch` |
| Scan output | `GET /scans/{id}/heatmap`, `/report`, `/explain` |
| Patients | `POST /patients`, `GET /patients`, `GET /patients/{id}/scans`, `/trend` |
| Reviews | `POST /scans/{id}/review` (doctor/admin), `GET /scans/{id}/reviews` |
| Referrals | `GET /facilities`, `POST /scans/{id}/referral`, `GET/PATCH /referrals/{id}` |
| Administration | `GET /admin/stats` (admin), `GET /audit/logs`, `GET /notifications` |

`POST /auth/login` accepts OAuth2 form fields (`username` and `password`) and returns a bearer token. Protected requests use `Authorization: Bearer <token>`. The roles are `camp_staff`, `doctor`, and `admin`.

## Deployment notes

`vercel.json` routes the React application from `/` and mounts FastAPI under `/api`. For a production deployment, provide at minimum:

```text
DATABASE_URL=postgresql+psycopg2://<user>:<password>@<host>/<database>?sslmode=require
SECRET_KEY=<a-random-secret-at-least-32-bytes-long>
```

Use managed PostgreSQL in production. The local SQLite fallback and local image/heatmap storage are intended for development only; serverless filesystems are ephemeral. Move uploaded images and generated outputs to durable object storage before relying on historical data. A production ML deployment should also replace the stub adapter with validated, calibrated model weights and follow the applicable clinical, privacy, security, and regulatory review process.

## Security and privacy considerations

- Treat retinal images and patient records as sensitive health data.
- Restrict the open demo registration flow before deploying to real users.
- Use HTTPS, a strong unique `SECRET_KEY`, protected audit/referral endpoints, and least-privilege database credentials.
- Do not use the demo predictions to make clinical decisions.

## Contributing

1. Create a focused branch.
2. Keep API request/response changes synchronized with `frontend/src/types/api.ts`.
3. Run `pytest -q` in `backend/` and `npm run build` in `frontend/` before opening a pull request.
4. Document any database, environment, or API contract changes in the same pull request.

## Team

- Ankit — backend and database
- Sheya and Shravani — frontend and UI
- Arushi and Pramati — ML and quantum modelling

Built for Smart India Hackathon 2026, sponsored by Egreen Quanta.
