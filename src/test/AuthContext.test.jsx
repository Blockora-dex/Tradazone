import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, render } from '@testing-library/react';
import { AuthProvider, useAuth, useAuthUser } from '../context/AuthContext';
import { STORAGE_PREFIX } from '../config/env';

// Keys must match what AuthContext derives from STORAGE_PREFIX
const SESSION_KEY = `${STORAGE_PREFIX}_auth`;
const WALLET_KEY  = `${STORAGE_PREFIX}_last_wallet`;

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

// ─── Initial state ────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('starts unauthenticated when no session exists', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user.isAuthenticated).toBe(false);
    expect(result.current.wallet.isConnected).toBe(false);
  });

  it('restores a valid saved session', () => {
    const userData = { id: '1', name: 'Alice', email: 'a@a.com', isAuthenticated: true, walletAddress: null, walletType: null };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: userData, expiresAt: Date.now() + 999999 }));
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user.isAuthenticated).toBe(true);
    expect(result.current.user.name).toBe('Alice');
  });

  it('ignores an expired session', () => {
    const userData = { id: '1', name: 'Alice', email: 'a@a.com', isAuthenticated: true };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: userData, expiresAt: Date.now() - 1 }));
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user.isAuthenticated).toBe(false);
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('handles corrupt session data gracefully', () => {
    localStorage.setItem(SESSION_KEY, 'not-valid-json{{');
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user.isAuthenticated).toBe(false);
  });
});

// ─── login / logout ───────────────────────────────────────────────────────────

describe('login', () => {
  it('sets user as authenticated and persists session', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.login({ id: '42', name: 'Bob', email: 'bob@b.com' });
    });
    expect(result.current.user.isAuthenticated).toBe(true);
    expect(result.current.user.name).toBe('Bob');
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY));
    expect(stored.user.name).toBe('Bob');
    expect(stored.expiresAt).toBeGreaterThan(Date.now());
  });
});

describe('logout', () => {
  it('clears user state and removes session from localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.login({ id: '1', name: 'Alice', email: 'a@a.com' }));
    act(() => result.current.logout());
    expect(result.current.user.isAuthenticated).toBe(false);
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('resets wallet state on logout', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.login({ id: '1', name: 'Alice', email: 'a@a.com' }));
    act(() => result.current.logout());
    expect(result.current.wallet.isConnected).toBe(false);
    expect(result.current.wallet.address).toBe('');
    expect(result.current.walletType).toBeNull();
  });
});

// ─── completeWalletLogin ──────────────────────────────────────────────────────

describe('completeWalletLogin', () => {
  it('sets stellar wallet state correctly', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const addr = 'GBXXX123';
    act(() => result.current.completeWalletLogin(addr, 'stellar'));
    expect(result.current.wallet.isConnected).toBe(true);
    expect(result.current.wallet.address).toBe(addr);
    expect(result.current.wallet.currency).toBe('XLM');
    expect(result.current.wallet.chainId).toBe('stellar');
    expect(result.current.walletType).toBe('stellar');
  });

  it('sets starknet wallet state correctly', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const addr = '0xabc123';
    act(() => result.current.completeWalletLogin(addr, 'starknet'));
    expect(result.current.wallet.currency).toBe('STRK');
    expect(result.current.wallet.chainId).toBe('');
    expect(result.current.walletType).toBe('starknet');
  });

  it('authenticates the user and persists session', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.completeWalletLogin('0xabc', 'starknet'));
    expect(result.current.user.isAuthenticated).toBe(true);
    expect(result.current.user.walletAddress).toBe('0xabc');
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY));
    expect(stored.user.walletAddress).toBe('0xabc');
  });

  it('stores last wallet address in localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.completeWalletLogin('GADDR', 'stellar'));
    expect(localStorage.getItem(WALLET_KEY)).toBe('GADDR');
  });

  it('formats user name as truncated address', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const addr = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
    act(() => result.current.completeWalletLogin(addr, 'starknet'));
    expect(result.current.user.name).toBe(`${addr.slice(0, 6)}...${addr.slice(-4)}`);
  });
});

// ─── disconnectAll ───────────────────────────────────────────────────────────

describe('disconnectAll', () => {
  it('resets auth and wallet state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.completeWalletLogin('GADDR', 'stellar'));
    await act(async () => { await result.current.disconnectAll(); });
    expect(result.current.user.isAuthenticated).toBe(false);
    expect(result.current.wallet.isConnected).toBe(false);
    expect(result.current.walletType).toBeNull();
  });

  it('removes last wallet key from localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.completeWalletLogin('GADDR', 'stellar'));
    await act(async () => { await result.current.disconnectAll(); });
    expect(localStorage.getItem(WALLET_KEY)).toBeNull();
  });

  it('removes session from localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.completeWalletLogin('GADDR', 'stellar'));
    await act(async () => { await result.current.disconnectAll(); });
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });
});

// ─── useAuth guard ────────────────────────────────────────────────────────────

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });
});

describe('useAuthUser', () => {
  it('does not re-render for wallet-only updates', () => {
    let authApi;
    let userRenderCount = 0;

    function AuthControls() {
      authApi = useAuth();
      return null;
    }

    function UserConsumer() {
      useAuthUser();
      userRenderCount += 1;
      return null;
    }

    render(
      <AuthProvider>
        <AuthControls />
        <UserConsumer />
      </AuthProvider>
    );

    expect(userRenderCount).toBe(1);

    act(() => {
      authApi.setWallet((current) => ({
        ...current,
        balance: String(Number(current.balance || '0') + 1),
      }));
    });

    expect(userRenderCount).toBe(1);

    act(() => {
      authApi.login({ id: '99', name: 'Profile User', email: 'profile@example.com' });
    });

    expect(userRenderCount).toBe(2);
  });

  it('throws when used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuthUser())).toThrow('useAuthUser must be used within an AuthProvider');
    spy.mockRestore();
  });
});
