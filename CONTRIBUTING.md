# Contributing to Tradazone

This guide is the onboarding reference for contributors, with focused notes for the SignUp flow and shared contributor workflow.

## Architecture decisions (ADRs)

Recorded decisions for stack selection:

- **API gateway / HTTP boundary** — `docs/adr/001-api-gateway-stack.md` (Issue #201)
- **App routing** (React Router, guards, basename) — `docs/adr/002-app-routing-stack.md` (Issue #202)

## Development Setup

```bash
# 1. Clone
git clone https://github.com/FolushoJoseph/Tradazone.git
cd Tradazone

# 2. Install dependencies
npm install

# 3. Run locally
npm run dev
```

Optional validation before opening a PR:

```bash
npm run lint
npm run build
```

## 🛠️ CI/CD Pipeline

We use **GitHub Actions** to ensure code quality and automate our deployment process.

### Automated Checks

Every pull request and push to the `main` branch triggers our CI pipeline, which performs the following steps:

1.  **Environment Setup**: Sets up the Node.js environment (v20).
2.  **Dependency Installation**: Runs `npm ci` for a clean, reproducible installation.
3.  **Linting**: Runs `npm run lint` to enforce code style and catch potential errors. **This step must pass for the build to proceed.**
4.  **Building**: Runs `npm run build` to verify the project builds correctly.
5.  **Deployment**: If the push is to the `main` branch, the project is automatically deployed to GitHub Pages.

### Manual Verification

Before submitting a pull request, please ensure your changes pass the same checks locally:

```bash
# Run linting
npm run lint

# Verify build
npm run build
```

## ConnectWalletModal onboarding

Primary file: `src/components/ui/ConnectWalletModal.jsx`

This modal is the shared UI for connecting Stellar, Starknet, EVM, and Solana-related wallets. Changes here affect Sign-in, Sign-up, Payments, and mail checkout flows.

**Dependencies to know before editing**

- `useAuth()` from `src/context/AuthContext.jsx` — exposes `completeWalletLogin`, `installed` (includes EIP-6963 `discovered` providers), `availableWallets`, and related session APIs the modal lists and connects through.
- `useLobstr()` from `src/hooks/useLobstr.js` — LOBSTR (Stellar) connect flow used inside the modal.
- EIP-6963 discovery lives in `src/utils/wallet-discovery.js` and is wired through `AuthContext` (not imported directly in the modal).
- Optional props: `isOpen`, `onClose`, `onConnect` (success callback), `connectWalletFn` (defaults to `useAuth().connectWallet` when passed from pages; tests may inject a stub).

**Conventions**

- Keep provider-specific logic inside the modal or small hooks; pages should only pass callbacks and open/close state.
- New wallet types: extend connection in `AuthContext` / discovery helpers as needed, surface a clear error state in the modal, and avoid logging secrets or full addresses in production builds.
- For EVM, prefer EIP-6963 provider selection (`installed.discovered` / `rdns`) over assuming a single `window.ethereum`.

**Manual test checklist**

- Open/close from Sign-in and Sign-up without console errors.
- Connect with at least one installed wallet path (e.g. LOBSTR or an injected EVM wallet) and confirm `onConnect` runs and navigation/session match the host page’s expectations.
- Payment settings and mail checkout: modal still receives the correct `connectWalletFn` when the page overrides it.

## SignUp Onboarding Guide

Primary file: `src/pages/auth/SignUp.jsx`

Related dependencies:
- `useAuth()` from `src/context/AuthContext.jsx` for auth state and wallet connection
- `ConnectWalletModal` from `src/components/ui/ConnectWalletModal`
- Route handling via `useNavigate` and `useSearchParams`

Current flow summary:
1. If `user.isAuthenticated` is true, user is redirected immediately.
2. Clicking "Connect Wallet" opens the modal.
3. On successful wallet connect, `tradazone_onboarded` is set to `false`.
4. User is redirected to the computed `redirect` path (or `/`).

When modifying SignUp:
- Keep redirect behavior backward compatible with query param `redirect`.
- Preserve `tradazone_onboarded` initialization unless onboarding flow is intentionally redesigned.
- Avoid coupling modal internals into page logic; keep the page orchestrating state and navigation only.
- Ensure the layout remains usable on small screens (left panel is scrollable by design).

Manual test checklist for SignUp:
- Visiting `/signup` while authenticated redirects correctly.
- Visiting `/signup?redirect=/settings/profile` redirects to the expected route after connect.
- Modal opens, closes, and triggers success callback without console errors.
- `localStorage.getItem("tradazone_onboarded")` is `"false"` right after successful connect.

## 🤝 How to Contribute

1.  **Fork** this repository.
2.  **Create a feature branch**:
    ```bash
    git checkout -b feature/your-feature-name
    ```
3.  **Commit your changes** with a clear message:
    ```bash
    git commit -m "feat: add your feature description"
    ```
4.  **Push** to your branch:
    ```bash
    git push origin feature/your-feature-name
    ```
5.  **Open a Pull Request** — describe what you changed and why.

## 📝 Commit Message Convention

We follow a simple convention for commit messages to keep our history clean and readable:

| Prefix | When to use |
|---|---|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `style:` | UI/CSS changes with no logic change |
| `refactor:` | Code restructuring without behavior change |
| `docs:` | Documentation updates |
| `chore:` | Dependency updates, build configs |

## 🐞 Reporting Issues

Found a bug or have a suggestion? [Open an issue](https://github.com/FolushoJoseph/Tradazone/issues) and include:
- A clear description of the problem.
- Steps to reproduce.
- Expected vs actual behavior.
- Screenshots if applicable.

## 🎨 Code Style

- Keep components focused and single-purpose.
- Co-locate styles with components where possible.
- Follow existing naming conventions (`PascalCase` for components, `camelCase` for hooks/utils).
- Avoid hardcoded values — use the data/context layer.

