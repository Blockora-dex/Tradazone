# ADR-002: App routing stack (React Router + layout guard)

## Status

Accepted (2026-03-26)

## Context

Tradazone is a Vite + React SPA deployed under a subpath on GitHub Pages (`basename` required). We need declarative routes, nested layouts for authenticated areas, and a reliable guard that enforces wallet-backed sessions without duplicating auth checks on every page.

## Decision

1. **Library**: Use **react-router-dom** (v7.x in this project) with **`BrowserRouter`**, **`Routes`**, **`Route`**, **`Navigate`**, and **`Outlet`**-friendly layout composition.
2. **Subpath deployment**: Set `basename="/Tradazone"` on `BrowserRouter` so production URLs align with `homepage` / GitHub Pages hosting (see `vite.config.js` and env-based `BASE_URL`).
3. **Route model**:
   - **Public**: `/signin`, `/signup`, `/pay/:checkoutId`, `/invoice/:id` — no `PrivateRoute` wrapper.
   - **Protected shell**: A single parent route with path `/` whose element is `<PrivateRoute><Layout /></PrivateRoute>`; child routes render inside `Layout` via `<Outlet />`.
   - **Fallback**: `path="*"` redirects unmapped paths to `/signin` (replace navigation).
4. **Auth guard**: Implement protection with `src/components/routing/PrivateRoute.jsx`, which checks both React auth state and a live `localStorage` session (see component JSDoc) and redirects with `redirect` / `reason` query params as appropriate.

## Consequences

- **Positive**: Clear split between marketing/public flows and the main app shell; deep links preserve intent via `redirect`.
- **Positive**: `PrivateRoute` centralizes session edge cases (e.g. TTL expiry) instead of scattering checks.
- **Trade-off**: All new authenticated pages must be registered as children of the protected layout route in `src/App.jsx`.

## Implementation reference

Primary route table:

`src/App.jsx`

Session-aware guard:

`src/components/routing/PrivateRoute.jsx`
