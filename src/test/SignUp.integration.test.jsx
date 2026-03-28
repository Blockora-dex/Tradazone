import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { STORAGE_PREFIX } from '../config/env';
import SignUp from '../pages/auth/SignUp';

/**
 * SignUp Integration Tests
 * 
 * These tests verify the integration between SignUp, ConnectWalletModal, 
 * and AuthContext. They ensure that successful wallet connections 
 * correctly mutate the global auth state and trigger appropriate UI transitions.
 */

// Mock ResizeObserver which is not available in all test environments
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock react-router-dom for navigation tracking
let mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
        useNavigate: () => mockNavigate,
        useSearchParams: () => [mockSearchParams],
    };
});

// Mock services
vi.mock('../services/webhook', () => ({
    dispatchWebhook: vi.fn().mockResolvedValue({ ok: true }),
}));

// Mock assets
vi.mock('../assets/auth-splash.svg', () => ({ default: 'mock-splash.svg' }));

// Mock wallet discovery to provide a stable list of wallets
vi.mock('../utils/wallet-discovery', () => ({
    useDiscoveredProviders: () => [],
    subscribeToProviders: (cb) => {
        cb([]);
        return () => {};
    },
    getDiscoveredProviders: () => [],
}));

// Mock wallet providers
const mockStarknet = {
    enable: vi.fn(),
    isConnected: false,
    selectedAddress: null,
    name: 'Argent X',
    on: vi.fn(),
};

const SESSION_KEY = `${STORAGE_PREFIX}_auth`;

describe('SignUp Integration Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        window.starknet = undefined;
        window.starknet_argentX = undefined;
        mockNavigate = vi.fn();
        mockSearchParams = new URLSearchParams();
    });

    /**
     * Verifies that a successful wallet connection:
     * 1. Updates the AuthContext user state to authenticated.
     * 2. Persists the session to localStorage.
     * 3. Triggers a redirect via useNavigate.
     */
    it('successfully connects wallet and updates context', async () => {
        const mockAddress = '0x123abc';
        
        // Setup mock Starknet provider
        window.starknet_argentX = mockStarknet;
        mockStarknet.enable.mockImplementation(async () => {
            mockStarknet.isConnected = true;
            mockStarknet.selectedAddress = mockAddress;
            return [mockAddress];
        });

        render(
            <AuthProvider>
                <SignUp />
            </AuthProvider>
        );

        // Simulate opening the wallet modal
        fireEvent.click(screen.getByText('Connect Wallet'));
        
        // Select Argent wallet from the list
        const argentBtn = await screen.findByText('Argent');
        fireEvent.click(argentBtn.closest('button'));

        // Verify Context Mutation was successful (signaled by navigation)
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
        }, { timeout: 4000 });

        // Verify Auth session is persisted correctly
        const sessionRaw = localStorage.getItem(SESSION_KEY);
        expect(sessionRaw).not.toBeNull();
        const session = JSON.parse(sessionRaw);
        expect(session.user.walletAddress).toBe(mockAddress);
        expect(session.user.isAuthenticated).toBe(true);
    });

    /**
     * Verifies that a failed connection attempt:
     * 1. Shows a user-friendly error message.
     * 2. Does NOT update the context or persist a session.
     */
    it('shows error on connection failure and does not update context', async () => {
        window.starknet_argentX = mockStarknet;
        mockStarknet.enable.mockRejectedValue(new Error('User rejected'));

        render(
            <AuthProvider>
                <SignUp />
            </AuthProvider>
        );

        fireEvent.click(screen.getByText('Connect Wallet'));
        const argentBtn = await screen.findByText('Argent');
        fireEvent.click(argentBtn.closest('button'));

        // Verify Error message is visible
        await waitFor(() => {
            expect(screen.getByText(/Please check your wallet and try again/i)).toBeInTheDocument();
        });

        // Verify Context did NOT update (no session in storage)
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    /**
     * Verifies that while a connection is in flight:
     * 1. The connect button is disabled to prevent re-entrancy.
     */
    it('disables connect buttons while processing', async () => {
        window.starknet_argentX = mockStarknet;
        
        // Mock a connection that stays pending
        mockStarknet.enable.mockReturnValue(new Promise(() => {}));

        render(
            <AuthProvider>
                <SignUp />
            </AuthProvider>
        );

        fireEvent.click(screen.getByText('Connect Wallet'));
        const argentBtn = await screen.findByText('Argent');
        const btn = argentBtn.closest('button');
        fireEvent.click(btn);

        // Verify button is disabled during connection
        expect(btn).toBeDisabled();
    });
});
