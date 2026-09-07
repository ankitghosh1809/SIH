# Agent 4 — Security Pass Checklist

I couldn't run any of this against the real repos — no network access from
this chat sandbox, and the repos aren't reachable via web fetch or search
either (see AGENT4_SUMMARY.md). Everything below is written to be run
directly, in order, by whoever has real access next — you, or Claude Code.

## 1. Committed secrets
```bash
# Is .env tracked at all?
git ls-files | grep -E '(^|/)\.env$'
# → should return nothing. If it does: git rm --cached <path>, add it to
#   .gitignore, and rotate whatever was in it — removing it from the tree
#   doesn't remove it from history.

# Scan history, not just the working tree
git log --all -p | grep -iE '(api[_-]?key|secret|password|token)\s*=\s*[\x27"][^\x27"]{8,}'

# Common hardcoded-key patterns in source
grep -rnE '(AKIA[0-9A-Z]{16}|sk-[a-zA-Z0-9]{20,}|AIza[0-9A-Za-z_-]{35})' backend/ frontend/src/
```

## 2. CORS
Find the CORS setup (Express `cors()` middleware; FastAPI/Django
`CORSMiddleware` / `django-cors-headers`) and confirm it is never both:
- a wildcard origin (`*`, or code that reflects any `Origin` header back), **and**
- `credentials: true` / `Access-Control-Allow-Credentials: true`

Browsers reject that exact combination for cookie auth, but some backends
achieve the same unsafe effect by reflecting the request's `Origin` header
instead of a literal `'*'` — check for that pattern specifically, not just a
string match on `'*'`.

## 3. Upload endpoints
For both `POST /api/v1/scans` and `POST /api/v1/batch`, confirm server-side
(not just the frontend dropzone config):
- [ ] Max file size is enforced
- [ ] File type is checked by content/MIME, not just extension or the
      frontend's `accept` attribute — both are trivially spoofable
- [ ] Batch upload actually caps at 50 files server-side, not only in the
      frontend's upload loop

## 4. Auth-specific
- [ ] Passwords (if applicable) are hashed at rest, never logged in plaintext
- [ ] Tokens have a real expiry — no `exp: never` / non-expiring JWTs
- [ ] Role checks happen server-side on every protected route.
      `ProtectedRoute.tsx` in this delivery is a UX nicety, not a security
      boundary — anyone can edit the JS running in their own browser.
