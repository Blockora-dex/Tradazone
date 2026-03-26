import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── Shared mocks ──────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

vi.mock('../components/ui/Logo', () => ({ default: () => <div data-testid="logo" /> }));
vi.mock('../assets/auth-splash.svg', () => ({ default: 'splash.svg' }));

const mockDispatchWebhook = vi.fn().mockResolvedValue({ ok: true });
vi.mock('../services/webhook', () => ({ dispatchWebhook: (...args) => mockDispatchWebhook(...args) }));

let mockUser = { isAuthenticated: false, walletAddress: null, walletType: null };
const mockConnectWallet = vi.fn();
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ connectWallet: mockConnectWallet, user: mockUser }),
}));

let mockIsStaging = false;
let mockAppName = 'Tradazone';
vi.mock('../config/env', () => ({
    get IS_STAGING() { return mockIsStaging; },
    get APP_NAME()   { return mockAppName; },
}));

// ConnectWalletModal — single mock; per-test behavior via `simulateWalletConnect`
let simulateWalletConnect = (onConnect) => onConnect('0xWALLET', 'evm');
vi.mock('../components/ui/ConnectWalletModal', () => ({
    default: ({ isOpen, onConnect }) =>
        isOpen ? (
            <button
                data-testid="mock-connect-success"
                onClick={() => simulateWalletConnect(onConnect)}
            >
                Simulate Connect
            </button>
        ) : null,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

async function renderSignUp() {
    // Dynamic import so per-test vi.mock overrides are in effect
    const { default: SignUp } = await import('../pages/auth/SignUp');
    render(<SignUp />);
}

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockUser = { isAuthenticated: false, walletAddress: null, walletType: null };
    mockSearchParams = new URLSearchParams();
    mockIsStaging = false;
    mockAppName = 'Tradazone';
    simulateWalletConnect = (onConnect) => onConnect('0xWALLET', 'evm');
});

afterEach(() => vi.restoreAllMocks());

// ─── 1. useEffect redirect ────────────────────────────────────────────────────

describe('useEffect redirect', () => {
    it('redirects to "/" when user is already authenticated (default redirect)', async () => {
        mockUser = { isAuthenticated: true, walletAddress: '0xABC', walletType: 'evm' };
        await renderSignUp();
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('redirects to the ?redirect param when user is already authenticated', async () => {
        mockUser = { isAuthenticated: true, walletAddress: '0xABC', walletType: 'evm' };
        mockSearchParams = new URLSearchParams('redirect=/invoices/INV-001');
        await renderSignUp();
        expect(mockNavigate).toHaveBeenCalledWith('/invoices/INV-001', { replace: true });
    });

    it('does NOT redirect when user is not authenticated', async () => {
        await renderSignUp();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});

// ─── 2. handleConnectSuccess ──────────────────────────────────────────────────

describe('handleConnectSuccess', () => {
    it('sets tradazone_onboarded to "false" in localStorage', async () => {
        await renderSignUp();
        await userEvent.click(screen.getByText('Connect Wallet'));
        await userEvent.click(screen.getByTestId('mock-connect-success'));
        expect(localStorage.getItem('tradazone_onboarded')).toBe('false');
    });

    it('fires the user.signed_up webhook with wallet details', async () => {
        await renderSignUp();
        await userEvent.click(screen.getByText('Connect Wallet'));
        await userEvent.click(screen.getByTestId('mock-connect-success'));
        expect(mockDispatchWebhook).toHaveBeenCalledWith('user.signed_up', {
            walletAddress: '0xWALLET',
            walletType: 'evm',
        });
    });

    it('navigates to "/" after successful connection (default redirect)', async () => {
        await renderSignUp();
        await userEvent.click(screen.getByText('Connect Wallet'));
        await userEvent.click(screen.getByTestId('mock-connect-success'));
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('navigates to the ?redirect param after successful connection', async () => {
        mockSearchParams = new URLSearchParams('redirect=/checkouts');
        await renderSignUp();
        await userEvent.click(screen.getByText('Connect Wallet'));
        await userEvent.click(screen.getByTestId('mock-connect-success'));
        expect(mockNavigate).toHaveBeenCalledWith('/checkouts', { replace: true });
    });

    it('falls back to user.walletAddress/walletType when onConnect args are falsy', async () => {
        simulateWalletConnect = (onConnect) => onConnect(null, null);
        mockUser = { isAuthenticated: false, walletAddress: '0xFALLBACK', walletType: 'stellar' };
        const { default: SignUp } = await import('../pages/auth/SignUp');
        render(<SignUp />);
        await userEvent.click(screen.getByText('Connect Wallet'));
        await userEvent.click(screen.getByTestId('mock-connect-success'));
        expect(mockDispatchWebhook).toHaveBeenCalledWith('user.signed_up', {
            walletAddress: '0xFALLBACK',
            walletType: 'stellar',
        });
    });
});

// ─── 3. Staging banner ────────────────────────────────────────────────────────

describe('staging banner', () => {
    it('renders the staging banner when IS_STAGING is true', async () => {
        mockIsStaging = true;
        await renderSignUp();
        expect(screen.getByTestId('staging-banner')).toBeInTheDocument();
    });

    it('includes the app name in the staging banner', async () => {
        mockIsStaging = true;
        mockAppName = 'Tradazone';
        await renderSignUp();
        expect(screen.getByTestId('staging-banner').textContent).toContain('Tradazone');
    });

    it('staging banner has role="banner" for accessibility', async () => {
        mockIsStaging = true;
        await renderSignUp();
        expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('does NOT render the staging banner when IS_STAGING is false', async () => {
        mockIsStaging = false;
        await renderSignUp();
        expect(screen.queryByTestId('staging-banner')).toBeNull();
    });
});
