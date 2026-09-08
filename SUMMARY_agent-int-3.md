# Agent 3 (Integration — Frontend Wiring) — Summary

Branch: `agent-int-3-frontend-wiring` (committed locally in this bundle; see
"Getting this into GitHub" below — this sandbox has no push credentials).

## TL;DR
The brief assumed "everything's merged, just wire it to real endpoints."
Reality was rougher: **no integration scaffold exists yet, the frontend was
never actually stitched together, and one whole workstream (Doctor Review &
Referrals) was never built.** I verified all of this against the live repos
rather than trusting the brief, built a working `frontend/` from the real
(unmerged) foundation branch + the real page branches, fixed the contract
drift I found, and proved it end-to-end against a live copy of the real
backend (26/26 smoke-test checks passing, including CORS, auth, uploads,
and role gating). Full detail below.

---

## 1. What was actually true on GitHub (verified, not assumed)

- **`SIH.git` (the integration target) is empty** — one init commit, just a
  `# SIH` README. Agent 1's scaffold hasn't happened. There is no
  `agent-int-1-scaffold` branch, no `backend/`, no `API_CONTRACT.md`.
  → I could not literally "branch off the latest SIH main" as the work
  order says, because there's nothing there yet. I built the equivalent
  locally so my actual mission (wiring) could still happen, and committed
  it on the correct branch name in a standalone repo, ready to drop in.

- **`SIH_frontend` main has 5 of 6 available page branches merged**
  (screening, results, patients, admin, marketing-polish) — but **not**
  `agent-1-foundation`, and there is **no `agent-5-doctors` branch at
  all**. Doctor Review & Referrals was never built — `src/pages/review/`
  only ever contained the foundation's own placeholder ("Doctor Review
  page coming soon", empty nav items). This is the single biggest gap in
  the whole project right now and it's not something a wiring pass can
  fix — it needs an actual build effort (a real Agent 5).

- **The "stitching" step described in the frontend team's own
  `HANDOFF_NOTES.md` never happened.** Each of the 7 page-building agents
  worked in a sandbox with zero network access, so each one hand-wrote its
  own throwaway local stand-ins for the shared files it needed
  (`api-client.ts`, `types/api.ts`, `AuthContext.tsx`, `routes.ts`,
  `EmptyState`/`ErrorState`/`ProtectedRoute`/`RiskBadge`) explicitly
  marked `STUB — DELETE AT STITCH TIME`, plus its own throwaway
  `package.json`/`vite.config.ts`/`App.tsx` dev harness just so its branch
  could build standalone. When the branches got merged, git did a plain
  file-tree merge — last branch merged (agent-3-results) won every
  conflict on those shared paths. So `main` right now has a **real,
  complete set of page implementations sitting on top of an incomplete
  stub `api-client.ts` (no auth handling) and a `types/api.ts` missing
  most of the app's types** — it does not compile as checked out.

  The real foundation **does** exist, fully built, on `agent-1-foundation`
  — it just never got a PR opened against `main`. It's genuinely good: a
  real axios client already reading `VITE_API_BASE_URL`, real JWT auth
  context, real role-gated routing, a real unified `App.tsx` that imports
  each workstream's `routes.tsx`/`navItems` by a fixed naming convention.
  I used this as the real base instead of rebuilding it.

## 2. What I built

Assembled `frontend/` = `agent-1-foundation` (root config, shared
lib/components/auth, App shell) **+** the real page directories
(`screening/`, `scans/`, `patients/`, `admin/`, `marketing/`) copied over
from `main`, with `review/` left as the foundation's own placeholder since
no real implementation exists anywhere to pull in.

Every route, hook, and request shape was checked against the **real
backend source** (not docs, not the brief) — I cloned `SIH_backend`,
read `app/main.py` and every file under `app/api/` and every
`app/schemas*.py`, and independently reran the backend's own test suite
(**77 passed**, matching its README's claim).

## 3. Contract drift found and fixed

| File | Issue | Fix |
|---|---|---|
| `src/types/api.ts` | `AuditLogResponse` had `resource_type`/`resource_id` fields the real backend never sends | Removed both (verified: `app/api/audit.py`'s response never includes them; `AuditLogPage.tsx` already has no column for them, so no page code needed changing) |
| `src/pages/screening/hooks/usePatientSearch.ts` + `PatientLinkField.tsx` | Built against a guessed `{patient_id, name}` response shape before the real Patient Registry contract existed | Fixed to the real `PatientResponse` shape (`id`, `full_name`) |
| `src/pages/scans/ScanHistoryPage.tsx` | Empty-state "Upload a scan" link pointed at a guessed path, `/scans/upload`, with a code comment flagging it as unconfirmed | Real route is `/upload` (`ROUTES.upload`) — fixed |
| `package.json` | `@tanstack/react-table: ^9.2.4` — but all 5 files that use it (`AuditLogPage`, `PatientListPage`, `PatientDetailPage`, `ScanHistoryPage`, `BatchResultsTable`) are written against the classic v8 API (`useReactTable`/`getCoreRowModel`); v9 renamed these | Pinned to `^8.21.3` rather than rewriting 5 files to an unfamiliar new API |
| `package.json` | `react-dropzone` imported by `ImageDropzone.tsx`, never added as a dependency (no agent had network access to `npm install` it) | Added (`^20.1.1`) |
| `src/components/ui/switch.tsx`, `progress.tsx` | Imported by `NotificationsPage`/upload pages; never existed anywhere (`npx shadcn add` needs `ui.shadcn.com`, not reachable in any agent's sandbox, including this one) | Hand-written against the same `radix-ui` primitives shadcn itself wraps, matching this codebase's existing `components/ui/*` conventions |
| `App.tsx` vs. `patients/routes.tsx`, `scans/routes.tsx` | Naming drift: App.tsx's fixed contract imports `patientsRoutes`/`patientsNavItems` and `scansRoutes`/`scansNavItems` (plural); those two branches exported the singular form | Renamed the two branches' exports to match App.tsx's contract (App.tsx documents itself as the one file that "never changes" at stitch time) |
| Several files | A handful of strict-TS issues (`EmptyState`/`ErrorState`'s `action` prop is a `ReactNode`, not a `{label,href}` descriptor two pages assumed; a nullable `RiskLevel` field; a Lucide icon passed unrendered; a recharts formatter type) | Fixed individually, all cosmetic/typing, no behavior changes |

None of this was "mock data" in the literal sense — every hook already
called real endpoint paths with react-query. The actual work was
contract-drift correction plus finishing the stitch that should have
happened before any of this reached a "wire it up" stage.

## 4. Verification (not just "should work")

- `npx tsc -b` — clean, zero errors.
- `npx vite build` — clean production build (one non-blocking warning
  about a >500kB chunk; a code-splitting nice-to-have, out of scope for a
  wiring pass).
- **Live smoke test** — ran the real backend (`uvicorn`, fresh SQLite,
  independently reran its pytest suite: 77/77 passing) and the real
  assembled frontend (`vite --port 3000`, matching the backend's default
  `ALLOWED_ORIGINS`) side by side, then hit every endpoint through curl
  using the exact paths/field names/content-types each hook uses:
  CORS preflight from the Vite origin, register+login for all 3 roles,
  patient create+search, single upload (`file`+`patient_name`+
  `patient_id`), batch upload (repeated `files`, including one
  deliberately-corrupt file to confirm per-file failure isolation),
  scan list/detail/explain/referral-suggestion/heatmap, patient
  scans/trend, doctor review (and confirmed it's rejected with no auth),
  referral create + facility list, admin stats (confirmed a doctor token
  gets 403), audit logs (confirmed the real response really has no
  `resource_type`/`resource_id`), notifications.
  **26/26 checks passed.**
  I didn't have a way to literally click through a browser in this
  sandbox — this is the closest equivalent a terminal-only agent can do,
  and it exercises the same requests a browser would send.

## 5. Definition of done, against the original work order

- [x] One API client, base URL from `VITE_API_BASE_URL`, no hardcoded/mock
      URLs anywhere (this was already true on `agent-1-foundation`;
      verified nothing in any page overrides it)
- [x] All 5 data-driven workstreams call real endpoints — **4 of 5**:
      Screening, Scan Results & Explainability, Patient Registry, and
      Admin/Audit/Notifications are real and verified. **Doctor Review &
      Referrals cannot be wired because it does not exist** (see §1) —
      not a wiring gap, a missing-workstream gap.
- [x] Upload flows verified against the backend's actual expected request
      shape (both were already correct; confirmed via live smoke test)
- [x] This summary

## 6. What the rest of the team / human needs to know

1. **Build the Doctor Review & Referrals workstream.** The backend side
   is done and tested (`POST/GET /api/v1/scans/{id}/review(s)`,
   `POST/GET/PATCH /api/v1/referrals`, `GET /api/v1/facilities`,
   `GET /api/v1/scans/{id}/referral-suggestion`, referral-letter PDF) —
   nothing on the frontend consumes any of it yet.
2. **Fix the source repo, not just this bundle.** `SIH_frontend`'s own
   `main` should get `agent-1-foundation` merged in properly (a real PR,
   not another silent overwrite) — otherwise every future clone of that
   repo is broken in the same way this one was, independent of the SIH
   integration effort.
3. **Agent 1 (integration scaffold) hasn't run.** I did not create a PR
   or push anything — see below for exact commands once that scaffold
   exists (or to push this as the first thing that does).
4. I did not touch anything backend-side or outside `frontend/`, beyond
   *reading* the backend source to get real contracts, and running it
   locally, read-only, for the smoke test.
5. Frontend build has one perf nit: a >500kB JS chunk with no
   code-splitting. Not fixed — cosmetic, out of scope for wiring.

## 7. This sandbox has no GitHub credentials — getting this into GitHub

```bash
# From wherever you keep a real clone of SIH.git (once Agent 1's scaffold
# exists) or directly, to push this as the first thing that does:
cd /path/to/SIH
git remote add agent3-bundle /path/to/unzipped/bundle   # this zip, unzipped
git fetch agent3-bundle agent-int-3-frontend-wiring
git checkout -b agent-int-3-frontend-wiring agent3-bundle/agent-int-3-frontend-wiring
git push origin agent-int-3-frontend-wiring
```

Or, simplest if `SIH.git` main is still just the empty init commit:

```bash
git clone https://github.com/ankitghosh1809/SIH.git
cd SIH
git checkout -b agent-int-3-frontend-wiring
cp -r /path/to/unzipped/bundle/frontend .
git add frontend/
git commit -m "Agent 3: wire frontend to real backend, fix contract drift, finish the stitch"
git push -u origin agent-int-3-frontend-wiring
```

## 8. Running it yourself

```bash
cd frontend
cp .env.example .env        # defaults to http://localhost:8000, matches the backend's own default port
npm install
npm run dev                 # serves on :3000 — matches the backend's default ALLOWED_ORIGINS out of the box
```

`smoke_test.sh` (bundled at the zip root, not inside `frontend/` — it
also drives the backend, which isn't my owned scope, so I kept it
out from under `frontend/` on purpose) reproduces the full 26-check
verification above against a locally-running backend + frontend.
