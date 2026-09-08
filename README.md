# SIH26139 — Egreen Quanta

Smart India Hackathon 2026 entry: a hybrid quantum-ML platform that screens retinal fundus
photographs for diabetic retinopathy and cataract risk. **This is a screening / decision-support
tool, not a diagnostic replacement** — keep that framing in any UI copy, docs, or API naming.

Sponsor: Egreen Quanta. Team: Ankit (backend & database), Sheya & Shravani (frontend),
Arushi & Pramati (ML/quantum modelling).

## Layout

```
SIH/
├── backend/   FastAPI + SQLAlchemy + PostgreSQL (Neon), imported from SIH_backend
├── frontend/  React 18 + TS + Vite + Tailwind v4 + shadcn/ui, imported from SIH_frontend
├── docker-compose.yml
└── .github/workflows/ci.yml
```

`backend/` and `frontend/` were pulled in with `git subtree ... --squash` — real, committed
source, not a submodule or symlink. To pull in upstream changes later:

```bash
git remote add backend-src https://github.com/ankitghosh1809/SIH_backend.git   # if not already added
git fetch backend-src main
git subtree pull --prefix=backend backend-src main --squash

git remote add frontend-src https://github.com/ankitghosh1809/SIH_frontend.git
git fetch frontend-src main
git subtree pull --prefix=frontend frontend-src main --squash
```

## Status

- **Backend:** complete — all 13 build-round branches plus 2 chore branches merged into
  `SIH_backend`'s `main`, 77 tests passing.
- **Frontend:** 6 of 7 workstreams are real (Foundation, Screening, Scan Results, Patients,
  Admin, Public Site), wired to the real backend, and verified with a live 26-check smoke test
  (`smoke_test.sh`) — CORS, auth for all 3 roles, uploads, batch upload, role gating, referrals,
  audit logs. **Doctor Review & Referrals is a placeholder** — no branch was ever built for it;
  `frontend/src/pages/review/routes.tsx` renders "coming soon" at `/referrals`.
- **Auth & error handling:** real JWT auth (login, role gating, protected routes) from the
  frontend's own foundation branch, plus a shared error-toast handler contributed separately —
  see `RECONCILIATION_agent3-vs-agent4.md` for how the two were merged.
- **Docker Compose:** present and checked against the real env var names, Dockerfile locations,
  and backend module path (see `AGENT5_RUNBOOK.md` for the checklist this closed out). Not yet
  run against a live Docker daemon by anyone on this project — if `docker compose up --build`
  hits something, it'll be the first real run.

## Running locally

### Option A — Docker Compose
```bash
cp backend/.env.example backend/.env
docker compose up --build
```
Backend on `:8000`, frontend on `:5173`, Postgres on `:5432`.

### Option B — each service separately
```bash
# backend
cd backend
python3 -m venv venv && . venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Every config value has a working default (`app/config.py`) — runs against local SQLite with
zero setup; see `backend/.env.example` for the full list (`DATABASE_URL`, `MODEL_PATH`,
`ALLOWED_ORIGINS`, etc.). Health check: `GET /api/v1/health`.

```bash
# frontend, separate terminal
cd frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL, defaults to http://localhost:8000
npm run dev
```
Serves on `http://localhost:3000` (Vite's default), matching the backend's default CORS origin.

## Deploying the complete app to Vercel

The repository root is configured as one Vercel Services project: the React
site is served at `/` and the FastAPI service is mounted at `/api`. No
`VITE_API_BASE_URL` is needed in Vercel — the frontend uses its own origin, so
registration requests go to `/api/v1/auth/register` in the same deployment.

Before the first production deployment, add these Vercel environment variables:

```text
DATABASE_URL=postgresql+psycopg2://<user>:<password>@<host>/<database>?sslmode=require
SECRET_KEY=<a-random-32-byte-or-longer-secret>
```

Use a managed PostgreSQL database (for example Neon). Vercel function storage
is ephemeral, so the local SQLite fallback is only for development and must
not be used in production. Deploy from the repository root with `vercel --prod`
or import the GitHub repository in Vercel with the root directory left as `.`.

Uploaded source images and generated heatmaps currently use local disk storage,
which is also ephemeral in serverless functions. They are suitable for a demo
request but must be moved to object storage before relying on historical scan
images in production.

## Known gaps

- **Doctor Review & Referrals (frontend workstream 5) was never built.** The backend side is
  done and tested (review, referrals, facilities, referral-suggestion, referral-letter PDF
  endpoints) — nothing on the frontend consumes any of it yet. This needs an actual build
  effort, not another wiring/integration pass.
- `docker compose up` has been checked for correctness against the real repos but not actually
  run — no Docker daemon has been available in any agent's sandbox so far.
- Frontend has one perf nit: a >500kB JS chunk with no code-splitting. Cosmetic, not blocking.
- `npm audit` reports 2 moderate-severity advisories in dev dependencies — worth a look before
  any public deployment, not urgent for a hackathon demo.
