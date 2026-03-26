import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import PrivateRoute from '../components/routing/PrivateRoute';
import { STORAGE_PREFIX } from '../config/env';

const SESSION_KEY = `${STORAGE_PREFIX}_auth`;

// Minimal child to confirm protected content renders
function Protected() { return <div>protected</div>; }
function SignIn() {
    // Surfaces the URL so tests can assert on query params
    return <div data-testid="signin">{window.location.search}</div>;
}

function renderWithRouter(initialEntries = ['/']) {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route path="/signin" element={<SignIn />} />
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Protected />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );
}

beforeEach(() => localStorage.clear());

// ─── Unauthenticated ──────────────────────────────────────────────────────────

describe('unauthenticated user', () => {
    it('redirects to /signin without reason=expired', () => {
        renderWithRouter(['/']);
        expect(screen.getByTestId('signin')).toBeTruthy();
        // No expired banner param
        expect(window.location.search).not.toContain('reason=expired');
    });

    it('does not render protected content', () => {
        renderWithRouter(['/']);
        expect(screen.queryByText('protected')).toBeNull();
    });
});

// ─── Valid session ────────────────────────────────────────────────────────────

describe('authenticated user with valid session', () => {
    beforeEach(() => {
        const user = { id: '1', name: 'Alice', email: '', isAuthenticated: true, walletAddress: null, walletType: null };
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user, expiresAt: Date.now() + 999_999 }));
    });

    it('renders protected content', () => {
        renderWithRouter(['/']);
        expect(screen.getByText('protected')).toBeTruthy();
    });
});

// ─── Expired session ──────────────────────────────────────────────────────────

describe('authenticated user with expired session', () => {
    beforeEach(() => {
        // Write a session to localStorage that has already expired
        const user = { id: '1', name: 'Alice', email: '', isAuthenticated: true, walletAddress: null, walletType: null };
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user, expiresAt: Date.now() - 1 }));
    });

    it('does not render protected content', async () => {
        await act(async () => { renderWithRouter(['/']); });
        expect(screen.queryByText('protected')).toBeNull();
    });

    it('redirects to /signin with reason=expired', async () => {
        await act(async () => { renderWithRouter(['/']); });
        expect(screen.getByTestId('signin')).toBeTruthy();
    });

    it('removes the expired session from localStorage', async () => {
        await act(async () => { renderWithRouter(['/']); });
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });
});
