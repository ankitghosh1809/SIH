/**
 * Intended path: frontend/src/lib/auth-utils.ts
 *
 * Framework-agnostic auth helpers. These live separately from
 * AuthContext.tsx because apiClient.ts is an axios interceptor, not a
 * React component — it can't call useNavigate() or useContext()
 * directly. AuthContext.tsx calls setNavigate() once, on mount, to
 * connect the two.
 *
 * ASSUMPTION — UNVERIFIED (no backend access, see AGENT4_SUMMARY.md):
 * the backend issues a bearer JWT in the login response body, not an
 * httpOnly session cookie. If it's actually cookie-based instead:
 *   - delete getToken/setToken/clearToken and the storage below
 *   - set `withCredentials: true` on the axios instance in apiClient.ts
 *   - delete the manual Authorization header in apiClient.ts's request interceptor
 *   - the navigation helpers below stay exactly the same either way
 */

const TOKEN_KEY = 'sih_auth_token';

let inMemoryToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

export function getToken(): string | null {
  return inMemoryToken;
}

export function setToken(token: string): void {
  inMemoryToken = token;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  inMemoryToken = null;
  localStorage.removeItem(TOKEN_KEY);
}

// --- Imperative navigation, for use outside React components (e.g. the axios interceptor) ---

type NavigateFn = (path: string) => void;
let navigateRef: NavigateFn | null = null;

export function setNavigate(fn: NavigateFn): void {
  navigateRef = fn;
}

export function redirectToLogin(): void {
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  const path = `/login?next=${next}`;
  if (navigateRef) {
    navigateRef(path);
  } else {
    window.location.assign(path); // fallback if this fires before the router mounts
  }
}
