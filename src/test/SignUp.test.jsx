import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignUp from '../pages/auth/SignUp';

// Mock the AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        connectWallet: vi.fn(),
        user: { isAuthenticated: false },
    }),
}));

// Mock the webhook dispatch
vi.mock('../../services/webhook', () => ({
    dispatchWebhook: vi.fn(),
}));

// Mock the env config
vi.mock('../../config/env', () => ({
    IS_STAGING: true,
    APP_NAME: 'Tradazone (Staging)',
}));

// Mock the assets
vi.mock('../../assets/auth-splash.svg', () => ({ default: 'mock-illustration' }));

// Mock components
vi.mock('../../components/ui/Logo', () => ({
    default: ({ className }) => <div className={className}>Logo</div>,
}));

vi.mock('../../components/ui/ConnectWalletModal', () => ({
    default: ({ isOpen, onClose }) => isOpen ? <div>Modal Open</div> : null,
}));

describe('SignUp component in staging', () => {
    it('displays staging banner when IS_STAGING is true', () => {
        render(
            <BrowserRouter>
                <SignUp />
            </BrowserRouter>
        );

        const banner = screen.getByTestId('staging-banner');
        expect(banner).toBeInTheDocument();
        expect(banner).toHaveTextContent('⚠️ Tradazone (Staging) — STAGING ENVIRONMENT. Data is not real and may be reset at any time.');
    });
});