# ADR-001: API gateway module and HTTP stack

## Status

Accepted (2026-03-26)

## Context

The UI needs a single place to call backend endpoints while parts of the API are still mocked or evolving. Multiple pages (customers, invoices, checkouts, items) must share consistent async contracts and error handling so features can ship without rewriting page-level code on every backend change.

## Decision

1. **Gateway location**: Use `src/services/api.js` as the centralized API boundary (sometimes referred to as the “API gateway” in this repo). Domain groups (`customers`, `invoices`, `checkouts`, `items`) stay colocated in that module.
2. **Transport**: Use the browser **Fetch API** via the internal `apiFetch` wrapper for real HTTP calls. The wrapper centralizes **401 Unauthorized** handling and returns a structured `{ ok: false, error: 'ERR_TOKEN_EXPIRED', status: 401 }` shape so callers do not need ad hoc session logic everywhere.
3. **Configuration**: Resolve the service base URL from `import.meta.env.VITE_API_URL` with a development fallback (`http://localhost:3000/api`).
4. **Migration path**: Replace `delay` + mock data calls incrementally with `apiFetch(\`${API_BASE_URL}/...\`)` without changing page component signatures.

## Consequences

- **Positive**: One place to adjust auth/error semantics; pages depend on stable method names on `api`.
- **Positive**: Mock-backed methods can be swapped to HTTP without touching routing or modal code.
- **Trade-off**: The file will grow until domain slices are extracted into separate modules (acceptable until traffic justifies a split).

## Implementation reference

See the file header and `apiFetch` / `setUnauthorizedHandler` in:

`src/services/api.js`
