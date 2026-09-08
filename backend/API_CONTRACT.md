# SIH26139 Backend — API Contract

**Status: verified against running code**, not inferred from work orders or `PROJECT_CONTEXT.md`.
Every endpoint below was confirmed two ways: (1) reading the route source in `app/api/*.py`, and
(2) booting the app (`uvicorn app.main:app`) and pulling the live `/openapi.json`. Where this
document differs from `00_PROJECT_CONTEXT.md`, **trust this document** — that was the brief's own
instruction, and it's now backed by a running instance, not just a read of the files.

- Verified against `SIH_backend` `main` @ `3d10060` (2026-09-07)
- **30 endpoints, 27 paths, 12 route groups. 77/77 tests passing.**
- Base URL: none hardcoded on the frontend side — everything is prefixed `/api/v1` and the backend
  itself doesn't know its own deployed origin. Point axios' `baseURL` at wherever `backend/` ends
  up deployed (or `http://localhost:8000` locally).
- Interactive docs: `GET /docs` (Swagger UI, includes a working "Authorize" button for the JWT
  flow) and `GET /openapi.json` (machine-readable — regenerate this document from it after any
  future backend change, rather than hand-editing both).

## Contents
1. [Auth model](#auth-model)
2. [Common conventions](#common-conventions) — errors, rate limiting, dates, IDs
3. [Core](#core) — health, metrics
4. [Auth](#auth)
5. [Scans](#scans)
6. [Batch](#batch)
7. [Doctor Review](#doctor-review)
8. [Referrals](#referrals)
9. [Explainability](#explainability)
10. [Patients](#patients)
11. [Admin](#admin)
12. [Audit](#audit)
13. [Notifications](#notifications)
14. [Known gaps / things Agent 3 should not assume](#known-gaps--things-agent-3-should-not-assume)

---

## Auth model

JWT bearer tokens, `HS256`, obtained from `POST /api/v1/auth/login`. Send as
`Authorization: Bearer <token>` on every request to a protected endpoint.

Three roles: **`admin`** (everything), **`doctor`** (can review scans), **`camp_staff`** (base
level, everything that doesn't need a role — i.e. most of the API today, see the per-endpoint
Auth column below). A role requirement of "doctor or admin" means either satisfies it.

**Only two endpoints actually enforce a role today**: `GET /api/v1/admin/stats` (`admin`) and
`POST /api/v1/scans/{id}/review` (`doctor` or `admin`). Everything else — including scan/batch
upload, patients, referrals, notifications, and audit logs — has **no auth check at all** right
now, regardless of what `PROJECT_CONTEXT.md`'s workstream list might imply. This is real,
confirmed backend behavior, not a doc gap — see [Known gaps](#known-gaps--things-agent-3-should-not-assume).
Deciding whether/how to gate the rest is Agent 4's (`agent-int-4-auth-security`) call, not
something this branch changed.

Token expiry: 60 min by default (`ACCESS_TOKEN_EXPIRE_MINUTES`). A request with an expired or
malformed token gets a 401 with `WWW-Authenticate: Bearer` — the frontend's axios interceptor
should treat any 401 as "redirect to login," not just render an inline error.

## Common conventions

- **IDs**: every resource ID (`scan_id`, `patient_id`, `referral_id`, `notification_id`, `review_id`)
  is a UUID4 string, e.g. `"3fa85f64-5717-4562-b3fc-2c963f66afa6"`. None are numeric.
- **Timestamps**: ISO-8601 strings via Pydantic's default `datetime` JSON encoding, e.g.
  `"2026-09-07T14:32:01.123456"`. Some hand-rolled response models (`audit`, `notifications`,
  `review`) serialize with `.isoformat()` directly and can be `null` if the row has no timestamp
  yet — treat every `created_at`/`reviewed_at`/`updated_at` field as **optional** on the frontend
  types even where a given schema doesn't mark it `Optional`, to be safe against the mix.
- **Validation errors** — any endpoint, malformed input → `422` with FastAPI's standard shape:
  ```json
  { "detail": [ { "loc": ["body", "field_name"], "msg": "...", "type": "..." } ] }
  ```
- **Not-found errors** → `404` with `{"detail": "<message>"}` (plain string, not the array form above).
- **Auth errors** → `401` with `{"detail": "Could not validate credentials"}` (bad/missing/expired
  token) or `{"detail": "Incorrect username or password"}` (bad login). `403` with
  `{"detail": "Requires one of roles: <roles>"}` (valid token, wrong role).
- **Rate limiting** — `POST /api/v1/scans` and `POST /api/v1/batch` only, `25/minute` per client IP
  by default (`UPLOAD_RATE_LIMIT`). Exceeding it returns **`429`** with a shape that does **not**
  match the validation-error convention above:
  ```json
  { "error": "Rate limit exceeded: 25 per 1 minute" }
  ```
  (note the key is `error`, not `detail` — easy to miss if the frontend's error handler assumes
  every non-2xx body has a `.detail`).
- **CORS**: driven by `ALLOWED_ORIGINS` (comma-separated). See `backend/.env.example`.

---

## Core

| Method & Path | Auth | Request | Response |
|---|---|---|---|
| `GET /api/v1/health` | none | — | `200 { "status": "ok" }` |
| `GET /api/v1/metrics` | none | — | `200` → see below |

`GET /api/v1/metrics` response (all fields nullable — `null` until `model_metrics` rows exist):
```ts
{
  classical: { accuracy: number, precision: number, recall: number, f1: number, auc_roc: number } | null,
  hybrid_quantum: { accuracy: number, precision: number, recall: number, f1: number, auc_roc: number } | null,
  evaluated_on: string | null
}
```

## Auth

| Method & Path | Auth | Request | Response |
|---|---|---|---|
| `POST /api/v1/auth/register` | none | JSON, see below | `201` → `UserResponse` |
| `POST /api/v1/auth/login` | none | **form-encoded** (not JSON) | `200` → `Token` |
| `GET /api/v1/auth/me` | any valid token | — | `200` → `UserResponse` |

Registration is deliberately open to any role for the hackathon build — anyone can self-register
as `admin`. Real deployment should close this off; not this branch's call to make (Agent 4).

```ts
// POST /register — request (application/json)
{ username: string, password: string, role: "admin" | "doctor" | "camp_staff", full_name?: string }
// -> 201 UserResponse
{ id: string, username: string, role: string, full_name: string | null, is_active: boolean }
// 422 if role isn't one of the three; 409 if username is taken

// POST /login — request is OAuth2PasswordRequestForm, i.e. a form body
// (Content-Type: application/x-www-form-urlencoded or multipart), fields:
//   username=<username>&password=<password>
// axios: use URLSearchParams / FormData, NOT `axios.post(url, {username, password})` as JSON.
// -> 200 Token
{ access_token: string, token_type: "bearer" }

// GET /me -> 200 UserResponse (same shape as register's response)
```

## Scans

| Method & Path | Auth | Request | Response |
|---|---|---|---|
| `POST /api/v1/scans` | none, rate-limited | multipart/form-data | `201` → `ScanResponse` |
| `GET /api/v1/scans` | none | query: `limit` (default 20) | `200` → `ScanListItem[]` |
| `GET /api/v1/scans/{scan_id}` | none | — | `200` → `ScanResponse`, `404` if missing |
| `GET /api/v1/scans/{scan_id}/heatmap` | none | — | `200 image/png`, `404` if missing |
| `GET /api/v1/scans/{scan_id}/report` | none | — | `200 application/pdf` (download), `404` if scan missing |

```ts
// POST /scans — multipart/form-data fields:
//   file: File            (required — the fundus photo)
//   patient_name: string  (optional, free text)
//   patient_id: string    (optional — must be a real patient id or this 404s;
//                          old-style callers that only send patient_name still work)
// -> 201 ScanResponse
{
  scan_id: string,
  created_at: string,          // ISO datetime
  prediction: {
    diabetic_retinopathy: { positive: boolean, probability: number, uncertainty: number | null },
    cataract:              { positive: boolean, probability: number, uncertainty: number | null }
  },
  risk_level: "low" | "medium" | "high",
  heatmap_url: string,          // relative path, e.g. "/api/v1/scans/{id}/heatmap" — prefix with your API base URL
  model_version: string         // e.g. "stub-v0" today (see Known gaps)
}
// 422 if the uploaded file doesn't look like an image (magic-byte check, not full decode)

// GET /scans?limit=20 -> 200 ScanListItem[]
{ scan_id: string, created_at: string, risk_level: string, thumbnail_url: string }[]
// NOTE: thumbnail_url currently just reuses the heatmap endpoint — there is no
// separate "original uploaded image" endpoint anywhere in this API. See Known gaps.

// GET /scans/{id} -> 200 ScanResponse (identical shape to POST's response)
```

## Batch

| Method & Path | Auth | Request | Response |
|---|---|---|---|
| `POST /api/v1/batch` | none, rate-limited | multipart/form-data, ≤50 files | `200` → `BatchResponse` |

```ts
// POST /batch — multipart/form-data field:
//   files: File[]   (required, max 50 — a 51st+ file is a request-level 422,
//                    NOT a per-item error in the results array below)
// -> 200 BatchResponse
{
  results: {
    filename: string,
    scan_id: string | null,     // null if this file failed
    risk_level: string | null,  // null if this file failed
    error: string | null        // the exception message if this file failed, else null
  }[],
  summary: {
    total: number, succeeded: number, failed: number,
    low_risk: number, medium_risk: number, high_risk: number
  }
}
// A single bad file (e.g. corrupt image) does NOT fail the whole batch — check
// each result's `error` field rather than relying on the outer response's status code.
// No patient linking on this endpoint (unlike POST /scans) — batch items are anonymous.
```

## Doctor Review

| Method & Path | Auth | Request | Response |
|---|---|---|---|
| `POST /api/v1/scans/{scan_id}/review` | **doctor or admin** | JSON | `201` → `ReviewResponse` |
| `GET /api/v1/scans/{scan_id}/reviews` | none | — | `200` → `ReviewResponse[]` (`[]` if none yet) |

```ts
// POST /scans/{id}/review — request (application/json)
{ note?: string, override_risk_level?: "low" | "medium" | "high" }
// -> 201 ReviewResponse
{
  review_id: string, scan_id: string,
  reviewer_note: string | null,
  override_risk_level: string | null,
  reviewed_at: string
}
// 404 if scan_id doesn't exist; 422 if override_risk_level is set but not low/medium/high
// NOTE: this endpoint does not currently write who reviewed it — the authenticated
// doctor's identity isn't stored on the Review row. Flag if the UI needs "reviewed by Dr. X".
```

## Referrals

| Method & Path | Auth | Request | Response |
|---|---|---|---|
| `GET /api/v1/facilities` | none | — | `200` → `FacilityResponse[]` |
| `GET /api/v1/scans/{scan_id}/referral-suggestion` | none | — | `200` → `{suggested, reason}` |
| `POST /api/v1/scans/{scan_id}/referral` | none | JSON | `201` → `ReferralResponse` |
| `GET /api/v1/referrals` | none | query: `status` (optional) | `200` → `ReferralResponse[]` |
| `GET /api/v1/referrals/{referral_id}` | none | — | `200` → `ReferralResponse`, `404` if missing |
| `PATCH /api/v1/referrals/{referral_id}` | none | JSON | `200` → `ReferralResponse` |
| `GET /api/v1/referrals/{referral_id}/letter` | none | — | `200 application/pdf` |

```ts
// GET /facilities -> 200 FacilityResponse[]  (static seed list — see Known gaps)
{ id: string, name: string, city: string, contact: string }[]

// GET /scans/{id}/referral-suggestion -> 200
{ suggested: boolean, reason: string | null }  // suggested=true only when risk_level === "high"; advisory only, not a gate

// POST /scans/{id}/referral — request (application/json)
{ facility_name: string, facility_contact?: string, notes?: string }
// Can be created regardless of risk level (the suggestion above doesn't block this).
// -> 201 ReferralResponse
{
  id: string, scan_id: string,
  facility_name: string, facility_contact: string | null,
  status: "pending" | "contacted" | "completed" | "declined",   // always "pending" on create
  notes: string | null,
  created_at: string, updated_at: string
}

// GET /referrals?status=pending -> 200 ReferralResponse[]

// PATCH /referrals/{id} — request (application/json, both optional)
{ status?: "pending" | "contacted" | "completed" | "declined", notes?: string }
// -> 200 ReferralResponse (updated). 422 if status isn't one of the four literal values.

// GET /referrals/{id}/letter -> 200 application/pdf (no Content-Disposition header set,
// unlike /scans/{id}/report — browsers will likely render inline rather than download)
```

## Explainability

| Method & Path | Auth | Request | Response |
|---|---|---|---|
| `GET /api/v1/scans/{scan_id}/explain` | none | — | `200` → `ExplainResponse`, `404` if scan missing |

```ts
{ scan_id: string, dr_uncertainty: number, cataract_uncertainty: number, explanation_text: string }
```
Read-only — doesn't modify anything. `explanation_text` is currently generic boilerplate, not
scan-specific reasoning (see Known gaps).

## Patients

| Method & Path | Auth | Request | Response |
|---|---|---|---|
| `POST /api/v1/patients` | none | JSON | `201` → `PatientResponse` |
| `GET /api/v1/patients` | none | query: `search`, `limit` (default 20) | `200` → `PatientResponse[]` |
| `GET /api/v1/patients/{patient_id}` | none | — | `200` → `PatientResponse`, `404` if missing |
| `GET /api/v1/patients/{patient_id}/scans` | none | — | `200` → `PatientScanSummary[]` |
| `GET /api/v1/patients/{patient_id}/trend` | none | — | `200` → `TrendResponse` |

```ts
// POST /patients — request (application/json)
{ full_name: string, age?: number, gender?: string, phone?: string, diabetes_type?: string }
// -> 201 PatientResponse
{ id: string, full_name: string, age: number|null, gender: string|null, phone: string|null, diabetes_type: string|null, created_at: string }

// GET /patients?search=&limit=20 -> 200 PatientResponse[]
// search is a case-insensitive substring match on full_name; omitted/empty -> most recent `limit`, newest first

// GET /patients/{id}/scans -> 200 PatientScanSummary[]  (newest first)
{ scan_id: string, created_at: string, risk_level: string|null, dr_probability: number|null, cataract_probability: number|null }[]

// GET /patients/{id}/trend -> 200 TrendResponse  (oldest first — chart-ready, plot left-to-right)
{
  patient_id: string,
  points: { created_at: string, dr_probability: number|null, cataract_probability: number|null, risk_level: string|null }[]
}
```
`patient_id` on a scan is always optional — every scan endpoint keeps working for callers that
never touch the patient registry at all (they just get `patient_id: null`).

## Admin

| Method & Path | Auth | Request | Response |
|---|---|---|---|
| `GET /api/v1/admin/stats` | **admin** | — | `200` → `AdminStatsResponse` |

```ts
{
  total_scans: number,
  by_risk_level: Record<string, number>,      // e.g. {"low": 10, "medium": 3, "high": 1}
  avg_inference_ms: number | null,             // null if zero scans exist yet
  by_model_version: Record<string, number>     // e.g. {"stub-v0": 14}
}
```

## Audit

| Method & Path | Auth | Request | Response |
|---|---|---|---|
| `GET /api/v1/audit/logs` | **none** (flagged, see Known gaps) | query: `action`, `limit` (default 50) | `200` → `AuditLogResponse[]` |

```ts
{ id: string, actor: string | null, action: string, ip_address: string | null, created_at: string | null }[]
```
`action` filter is a substring match, not exact.

## Notifications

| Method & Path | Auth | Request | Response |
|---|---|---|---|
| `GET /api/v1/notifications` | none | query: `unread_only` (bool, default false) | `200` → `NotificationResponse[]` |
| `PATCH /api/v1/notifications/{notification_id}/read` | none | — | `200` → `NotificationResponse`, `404` if missing |

```ts
{
  id: string, event_type: string, scan_id: string | null,
  channel: string,        // always "in_app" today — no email/SMS delivery built, see Known gaps
  message: string, is_read: boolean, created_at: string | null
}
```
Every `GET` re-syncs notifications from current scan/review data first (pull-based, not written
at scan-creation time) — so polling this endpoint is the intended pattern, not a websocket/push.

---

## Known gaps / things Agent 3 should not assume

Real, verified behavior — not speculation — that a frontend built against "what the workstream
names imply" would get wrong:

- **Almost nothing is auth-gated yet.** Only `GET /admin/stats` and `POST /scans/{id}/review`
  check a role. Build the UI's auth guards (which routes redirect to login, which show/hide by
  role) against this document's per-endpoint Auth column, not against what would make sense for a
  clinical app — the gap between the two is real and is Agent 4's scope to close, not something
  wired around on the frontend by, e.g., hiding a button and trusting that as the security
  boundary.
- **No "original uploaded image" endpoint.** `thumbnail_url` and `heatmap_url` both point at the
  *heatmap* PNG — there's no route that serves the plain fundus photo back. If a results/gallery
  screen needs the original image, that's a real gap to flag back to this branch or Agent 5, not
  a naming mismatch to work around.
- **The model is a stub.** `dr_probability`/`cataract_probability` are randomly generated
  (`app/ml/model_backend.py`), and the heatmap is a flat placeholder with no real spatial
  data — the *shape* of every response above is stable and safe to build against, but don't
  build UI that implies the numbers or heatmap are clinically meaningful yet.
- **`/explain`'s `explanation_text` is generic boilerplate**, not scan-specific reasoning — same
  root cause (no real model yet).
- **Referral facilities are hardcoded demo data** (`app/data/facilities.py`) — 10 placeholder
  entries, not a real directory.
- **Notifications never leave the app.** `channel` is always `"in_app"`; there's no email/SMS
  send, so don't build a "notification sent to your phone" UI promise around this.
- **Rate-limit error shape differs from every other error** (`{"error": ...}` vs `{"detail": ...}`)
  — see [Common conventions](#common-conventions). A generic axios error interceptor that always
  reads `err.response.data.detail` will silently show `undefined` on a 429.
- **`POST /auth/login` takes a form body, not JSON** — the single most likely integration bug if
  this contract isn't read closely; every other `POST`/`PATCH` in this API is JSON.

