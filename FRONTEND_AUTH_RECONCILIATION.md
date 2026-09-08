# Frontend authentication reconciliation — addendum to FRONTEND_INTEGRATION_SUMMARY.md

By the time this branch got merged into `main`, Agents 4 and 5 had also run
for real and pushed. Agent 4 built its own parallel auth stack
(`ProtectedRoute.tsx`, `context/AuthContext.tsx`, `lib/apiClient.ts`,
`lib/auth-utils.ts`) — an add/add conflict on `ProtectedRoute.tsx`, plus
three more files at paths that didn't collide with mine but were doing the
same job a second time.

**Read Agent 4's own summary before resolving anything.** It's honest about
its constraints: that session had zero network access (confirmed —
`git ls-remote` came back `403`), so every endpoint, field name, and
response shape in its auth stack is explicitly flagged `ASSUMPTION —
UNVERIFIED`. Checked against the real backend, several of those
assumptions are wrong: login assumed as JSON `{email, password}` (real:
form-encoded `username`/`password` — `OAuth2PasswordRequestForm`), response
assumed as `{token, user}` (real: `{access_token, token_type}` from
`/auth/login`, then a separate `GET /auth/me` for the user), a `name` field
that doesn't exist (real: `full_name`).

**Resolution:**
- Kept my `ProtectedRoute.tsx`, `contexts/AuthContext.tsx`,
  `lib/api-client.ts` — already real, already proven against the live
  backend (see the smoke test in the main summary).
- Deleted Agent 4's `context/AuthContext.tsx`, `lib/apiClient.ts`,
  `lib/auth-utils.ts` — duplicate, unverified, and concretely wrong on the
  points above. Leaving them in the tree unused would just be a trap for
  whoever imports the wrong one later.
- Kept and **wired in** Agent 4's `lib/errorHandler.ts`. This one's
  genuinely good and doesn't depend on repo access — it's a defensive
  parser for `{message}/{error}/{detail}/{errors:[]}` response shapes that
  falls back gracefully, which happens to match FastAPI's real default
  error shape (`{"detail": "..."}`) already. Added one line to
  `api-client.ts`'s response interceptor so every non-401 API failure now
  surfaces as a `sonner` toast instead of failing silently — this wasn't
  something my original wiring pass had.
- Re-ran the full 26-check smoke test after the merge (fresh backend DB,
  fresh frontend): **still 26/26.**

No action needed from Agent 4 or anyone else — this is done. Flagging it
here per the project's own ground rule about deviations, not because
anything is still open.
