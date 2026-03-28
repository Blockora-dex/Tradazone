/**
 * @fileoverview Visual snapshot tests for Auth module components — Issue #156
 *
 * ISSUE: #156 — Add visual snapshot testing for the Auth module components.
 * Category: Testing / Auth module
 * Affected Area: Auth module (SignIn, SignUp pages)
 *
 * Captures stable render snapshots for the two auth entry-point pages so that
 * unintentional UI regressions are caught in CI. The ConnectWalletModal and
 * context dependencies are mocked to keep snapshots deterministic and fast.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── Shared mocks ─────────────────────────────────────────────────────────────

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        connectWallet: vi.fn(),
        user: { isAuthenticated: false, walletAddress: null },
        lastWallet: null,
    }),
    useAuthUser: () => ({ isAuthenticated: false, walletAddress: null }),
    useAuthActions: () => ({ connectWallet: vi.fn() }),
}));

vi.mock('../components/ui/ConnectWalletModal', () => ({
    default: () => null,
}));

vi.mock('../components/ui/StagingBanner', () => ({
    default: () => null,
}));

// Stub SVG / image imports so snapshots stay portable
vi.mock('../assets/auth-splash.svg', () => ({ default: 'auth-splash.svg' }));
vi.mock('../assets/logo-blue.png',   () => ({ default: 'logo-blue.png' }));
vi.mock('../assets/logo-white.png',  () => ({ default: 'logo-white.png' }));
vi.mock('../assets/logo.png',        () => ({ default: 'logo.png' }));
vi.mock('../assets/logo-blue.svg',   () => ({ default: 'logo-blue.svg' }));

// ─── SignIn snapshots ─────────────────────────────────────────────────────────

describe('Auth module snapshots — SignIn', () => {
    let SignIn;

    beforeEach(async () => {
        vi.resetModules();
        ({ default: SignIn } = await import('../pages/auth/SignIn'));
    });

    it('matches snapshot for unauthenticated state (no last wallet)', () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/signin']}>
                <SignIn />
            </MemoryRouter>
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot when session-expired query param is present', () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/signin?reason=expired']}>
                <SignIn />
            </MemoryRouter>
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});

// ─── SignUp snapshots ─────────────────────────────────────────────────────────

describe('Auth module snapshots — SignUp', () => {
    let SignUp;

    beforeEach(async () => {
        vi.resetModules();
        ({ default: SignUp } = await import('../pages/auth/SignUp'));
    });

    it('matches snapshot for unauthenticated state', () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/signup']}>
                <SignUp />
            </MemoryRouter>
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with redirect query param', () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/signup?redirect=%2Fdashboard']}>
                <SignUp />
            </MemoryRouter>
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
