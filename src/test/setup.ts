// @ts-nocheck
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';

// Polyfill import.meta.env for modules that read Vite env vars at import time
if (!import.meta.env) {
  Object.defineProperty(import.meta, 'env', {
    value: {
      VITE_APP_ENV: 'development',
      VITE_APP_NAME: 'Tradazone',
      BASE_URL: '/',
      // Fake Supabase values so createClient() doesn't throw in tests
      VITE_SUPABASE_URL:      'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    },
    writable: true,
  });
} else {
  import.meta.env.VITE_APP_ENV      = import.meta.env.VITE_APP_ENV      || 'development';
  import.meta.env.VITE_APP_NAME     = import.meta.env.VITE_APP_NAME     || 'Tradazone';
  import.meta.env.BASE_URL          = import.meta.env.BASE_URL           || '/';
  import.meta.env.VITE_SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      || 'https://test.supabase.co';
  import.meta.env.VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'test-anon-key';
}

// Mock Supabase so tests never make real network calls
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession:       vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange:vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut:          vi.fn().mockResolvedValue({ error: null }),
      setSession:       vi.fn().mockResolvedValue({ data: {}, error: null }),
      updateUser:       vi.fn().mockResolvedValue({ data: {}, error: null }),
      verifyOtp:        vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
    from: vi.fn().mockReturnValue({
      select:  vi.fn().mockReturnThis(),
      insert:  vi.fn().mockReturnThis(),
      update:  vi.fn().mockReturnThis(),
      upsert:  vi.fn().mockReturnThis(),
      delete:  vi.fn().mockReturnThis(),
      eq:      vi.fn().mockReturnThis(),
      in:      vi.fn().mockReturnThis(),
      order:   vi.fn().mockReturnThis(),
      single:  vi.fn().mockResolvedValue({ data: null, error: null }),
      then:    vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  },
}));

// Fix for happy-dom/jsdom localStorage.clear is not a function
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    length: 0,
    key: (index) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
/* globals: global */
/* vi intentionally unused - required for global polyfill */
Object.defineProperty(global, 'vi', { value: vi });
global.localStorage = localStorageMock;
