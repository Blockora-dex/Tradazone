import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import * as Mocks from './mocks/signUpMocks';

let mockNavigate;
let mockSearchParams;
let mockUser;
let mockOnConnectArgs;
const mockConnectWallet = vi.fn();
const mockDispatchWebhook = vi.fn().mockResolvedValue(Mocks.MOCK_WEBHOOK_SUCCESS);

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
        useNavigate: () => mockNavigate,
        useSearchParams: () => [mockSearchParams],
    };
});

vi.mock('../components/ui/Logo', () => ({
    default: () => React.createElement('div', { 'data-testid': 'logo' }),
}));

vi.mock('../assets/auth-splash.svg', () => ({ default: 'splash.svg' }));

vi.mock('../services/webhook', () => ({
    dispatchWebhook: (...args) => mockDispatchWebhook(...args),
}));

vi.mock('../config/env', () => ({
    IS_STAGING: false,
    APP_NAME: 'Tradazone',
}));

vi.mock('../context/AuthContext', () => ({
    useAuthActions: () => ({ connectWallet: mockConnectWallet }),
    useAuthUser: () => mockUser,
}));

vi.mock('../components/ui/ConnectWalletModal', () => ({
    default: ({ isOpen, onConnect }) => (
        isOpen ? (
            <button
                data-testid="mock-connect-success"
                onClick={() => onConnect(mockOnConnectArgs.walletAddress, mockOnConnectArgs.walletType)}
            >
                Simulate Connect
            </button>
        ) : null
    ),
}));

async function renderSignUp() {
    const { default: SignUp } = await import('../pages/auth/SignUp');
    const { BrowserRouter } = await import('react-router-dom');

    render(
        React.createElement(
            BrowserRouter,
            null,
            React.createElement(SignUp)
        )
    );
}

beforeEach(() => {
    localStorage.clear();
    mockNavigate = vi.fn();
    mockSearchParams = new URLSearchParams();
    mockUser = { isAuthenticated: false, walletAddress: null, walletType: null };
    mockOnConnectArgs = { walletAddress: Mocks.MOCK_WALLET_SUCCESS.walletAddress, walletType: Mocks.MOCK_WALLET_SUCCESS.walletType };
    mockConnectWallet.mockReset();
    mockDispatchWebhook.mockClear();
    mockDispatchWebhook.mockResolvedValue(Mocks.MOCK_WEBHOOK_SUCCESS);
});

describe('SignUp', () => {
    it('renders the onboarding copy', async () => {
        await renderSignUp();

        expect(screen.getByText(/Manage clients, send invoices/i)).toBeInTheDocument();
        expect(screen.getByText('Connect your wallet to get started')).toBeInTheDocument();
        expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    });

    it('redirects authenticated users immediately', async () => {
        mockSearchParams = new URLSearchParams('redirect=/dashboard');
        mockUser = { isAuthenticated: true, walletAddress: '0xAUTH', walletType: 'evm' };

        await renderSignUp();

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });

    it('fires the signup webhook and navigates after a successful wallet connection', async () => {
        const user = userEvent.setup();
        await renderSignUp();

        await user.click(screen.getByText('Connect Wallet'));
        await user.click(screen.getByTestId('mock-connect-success'));

        expect(mockDispatchWebhook).toHaveBeenCalledWith('user.signed_up', {
            walletAddress: Mocks.MOCK_WALLET_SUCCESS.walletAddress,
            walletType: Mocks.MOCK_WALLET_SUCCESS.walletType,
        });
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('exports a csv snapshot of the current signup state', async () => {
        const user = userEvent.setup();
        const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
        let appendedLink = null;
        const realAppendChild = document.body.appendChild.bind(document.body);
        const realRemoveChild = document.body.removeChild.bind(document.body);

        const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((element) => {
            appendedLink = element;
            return realAppendChild(element);
        });
        const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((element) => {
            return realRemoveChild(element);
        });

        mockUser = { isAuthenticated: false, walletAddress: null, walletType: null };

        await renderSignUp();
        await user.click(screen.getByRole('button', { name: /export signup data to csv/i }));

        expect(appendedLink).toBeTruthy();
        expect(appendedLink.getAttribute('download')).toBe('auth_data.csv');
        expect(clickSpy).toHaveBeenCalled();

        appendSpy.mockRestore();
        removeSpy.mockRestore();
        clickSpy.mockRestore();
    });

    it('falls back to the auth user wallet metadata when modal data is missing', async () => {
        const user = userEvent.setup();
        mockUser = { isAuthenticated: false, walletAddress: '0xFALLBACK', walletType: 'stellar' };
        mockOnConnectArgs = { walletAddress: null, walletType: null };

        await renderSignUp();
        await user.click(screen.getByRole('button', { name: /connect wallet/i }));
        await user.click(screen.getByTestId('mock-connect-success'));

        expect(mockDispatchWebhook).toHaveBeenCalledWith('user.signed_up', {
            walletAddress: '0xFALLBACK',
            walletType: 'stellar',
        });
    });

    // --- Enhanced Test Cases with Edge/Failure/Performance Mocks ---

    it('handles webhook 500 error gracefully without crashing', async () => {
        // FAILURE CASE: API returns 500
        mockDispatchWebhook.mockResolvedValue(Mocks.MOCK_WEBHOOK_ERROR_500);
        const user = userEvent.setup();
        
        await renderSignUp();
        await user.click(screen.getByText('Connect Wallet'));
        await user.click(screen.getByTestId('mock-connect-success'));

        // Webhook fails but component should still navigate (non-blocking)
        expect(mockDispatchWebhook).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('handles network failure during webhook dispatch', async () => {
        // FAILURE CASE: Network failure (promise rejection)
        mockDispatchWebhook.mockRejectedValue(Mocks.MOCK_NETWORK_FAILURE);
        const user = userEvent.setup();
        
        await renderSignUp();
        await user.click(screen.getByText('Connect Wallet'));
        await user.click(screen.getByTestId('mock-connect-success'));

        // Navigation should still occur despite the background webhook failure
        expect(mockNavigate).toHaveBeenCalled();
    });

    it('handles partial response data with missing optional fields', async () => {
        // SUCCESS CASE: Response with optional fields missing
        mockOnConnectArgs = { 
            walletAddress: Mocks.MOCK_WALLET_PARTIAL.walletAddress, 
            walletType: Mocks.MOCK_WALLET_PARTIAL.walletType 
        };
        const user = userEvent.setup();
        
        await renderSignUp();
        await user.click(screen.getByText('Connect Wallet'));
        await user.click(screen.getByTestId('mock-connect-success'));

        expect(mockDispatchWebhook).toHaveBeenCalledWith('user.signed_up', {
            walletAddress: Mocks.MOCK_WALLET_PARTIAL.walletAddress,
            walletType: Mocks.MOCK_WALLET_PARTIAL.walletType,
        });
    });

    it('handles edge case: unexpected data shape in onConnect', async () => {
        // EDGE CASE: Unexpected data shape
        mockOnConnectArgs = {
            ...Mocks.MOCK_UNEXPECTED_SHAPE,
            walletAddress: '0xUNEXPECTED',
            walletType: 'evm'
        };
        const user = userEvent.setup();

        await renderSignUp();
        await user.click(screen.getByText('Connect Wallet'));
        await user.click(screen.getByTestId('mock-connect-success'));

        expect(mockDispatchWebhook).toHaveBeenCalledWith('user.signed_up', {
            walletAddress: '0xUNEXPECTED',
            walletType: 'evm',
        });
    });

    it('handles delayed webhook response without blocking navigation', async () => {
        // PERFORMANCE CASE: Delayed response
        mockDispatchWebhook.mockReturnValue(Mocks.simulateDelayedResponse(100));
        const user = userEvent.setup();

        await renderSignUp();
        await user.click(screen.getByText('Connect Wallet'));
        await user.click(screen.getByTestId('mock-connect-success'));

        // SignUp navigates immediately after firing the webhook, doesn't wait for response
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
        
        await waitFor(() => {
            expect(mockDispatchWebhook).toHaveBeenCalled();
        });
    });
});

