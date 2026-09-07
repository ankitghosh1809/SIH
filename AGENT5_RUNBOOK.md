# Agent 5 — Integration Runbook

Written from a Claude.ai chat session with **no network access to GitHub and
no Docker installed** — so nothing below has actually been executed yet.
This is the exact sequence to run somewhere that has both: your own
machine, or Claude Code (real git + Docker + terminal access).

## Why this exists instead of a finished summary

Agent 5's brief needs real merges, a working `docker compose up`, an
end-to-end check, and a push to `main`. All four need either GitHub access
or a running Docker daemon — neither exists in this sandbox. Confirmed
directly, not assumed:

- `git ls-remote` on `SIH.git` → `403`, `host_not_allowed`
- `docker --version` → not installed

## 0. Before you merge anything

Confirm the four branches actually made it to `SIH.git`:

```bash
git clone https://github.com/ankitghosh1809/SIH.git
cd SIH
git branch -r
```

Look for `agent-int-1-scaffold`, `agent-int-2-backend-readiness`,
`agent-int-3-frontend-wiring`, `agent-int-4-auth-security`. If one's
missing, that agent's session didn't push — chase it down before merging,
since building on a missing scaffold just produces more conflicts later.

## 1. Merge, in the order the brief specifies

```bash
git checkout main   # should already be Agent 1's scaffold

git merge origin/agent-int-2-backend-readiness --no-ff \
  -m "Merge: backend readiness (CORS, env config, Dockerfile)"
git merge origin/agent-int-3-frontend-wiring --no-ff \
  -m "Merge: frontend wiring (API client, real endpoints)"
# 2 and 3 touch disjoint folders (backend/ vs frontend/) — should be clean.
# If they're not, something touched files outside its owned scope, which
# is worth flagging on its own.

git merge origin/agent-int-4-auth-security --no-ff \
  -m "Merge: auth, role gating, error handling"
# Touches both sides. Resolve mechanical conflicts by hand. If a conflict
# is a real product decision (e.g. two different auth approaches), don't
# guess — that's a "flag it" case per the brief, not a "pick one" case.
```

## 2. docker-compose.yml

Starting scaffold attached separately (`docker-compose.yml`). Before
`docker compose up --build`:

- [ ] Open `backend/.env.example` (Agent 2's) and match every env var name
      in the compose file to what's actually there
- [ ] Check whether Agent 2 already wrote `backend/Dockerfile` — use theirs
      instead of the reference one below if so
- [ ] Same check for `frontend/Dockerfile` (Agent 3)
- [ ] Confirm the backend's real entrypoint module — the compose file
      assumes `app.main:app`, inferred from the `app/db/…`, `app/api/…`,
      `app/reports/…` layout used in earlier rounds, but not confirmed

If neither agent left a Dockerfile, minimal ones to start from:

```dockerfile
# backend/Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
EXPOSE 4173
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
```

## 3. End-to-end check

Confirmed-safe starting point — only these two routes are verified
anywhere in the project docs:

```bash
curl -F "image=@sample_fundus.jpg" http://localhost:8000/api/v1/scans
```

Then walk the actual UI: upload → screening result → (if reachable) a
referral shows up.

Worth checking rather than assuming: earlier backend rounds also built a
scan retrieve/list/heatmap set, a doctor-review API (`app/api/review.py`),
and a referral workflow (`app/api/referrals.py`, `referral_letter.py`,
`referral_models.py`) on top of the base app. Whether those made it into
whatever got branched for this integration effort is exactly what Agent
2's route inventory should say.

Anything that 500s, write down — don't smooth it over in the final
summary.

## 4. README

Sections the brief wants: architecture overview, repo layout, setup/run
instructions, contributors. Confirmed facts you can drop straight into the
architecture section:

- **Backend:** Python 3.12, FastAPI + uvicorn, SQLAlchemy 2.x, Pydantic
  v2, Postgres (Neon) in prod / SQLite locally — merged to main with 77
  passing tests as of the last backend round
- **Frontend:** React 18 + TypeScript + Vite, Tailwind v4, shadcn/ui,
  TanStack Query, react-hook-form + zod, axios, sonner, date-fns
- **Framing:** screening/decision-support tool, not a diagnostic
  replacement — keep this in the README copy, per the project brief
- **Sponsor:** Egreen Quanta
- **Contributors:** Ankit (backend & database), Sheya & Shravani
  (frontend), Arushi & Pramati (ML/quantum modelling)

## 5. Push

```bash
git push origin main
```

## 6. The real summary — fill this in *after* actually running the above

Don't presume any of these are checked yet:

- [ ] All 4 branches merged (or: which one was missing / had unresolved
      conflicts)
- [ ] `docker compose up` — works, or what broke
- [ ] E2E flow — what was actually tested, what passed, what didn't
- [ ] README — done / what's still missing
- [ ] Pushed to `SIH` main — yes/no
- [ ] Known gaps for the team
