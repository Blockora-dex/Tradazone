import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiFetch, setUnauthorizedHandler } from '../services/api';

// ─── apiFetch ────────────────────────────────────────────────────────────────

describe('apiFetch', () => {
    afterEach(() => vi.restoreAllMocks());

    it('returns parsed JSON on a 2xx response', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ id: 1, name: 'Alice' }),
        }));
        const data = await apiFetch('/api/customers');
        expect(data).toEqual({ id: 1, name: 'Alice' });
    });

    it('throws an enriched error on non-401 failure', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({ message: 'Internal Server Error' }),
        }));
        await expect(apiFetch('/api/customers')).rejects.toMatchObject({
            message: 'Internal Server Error',
            status: 500,
        });
    });

    it('calls the unauthorized handler on 401', async () => {
        const handler = vi.fn();
        setUnauthorizedHandler(handler);

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 401,
            json: async () => ({}),
        }));

        const result = await apiFetch('/api/customers');

        expect(handler).toHaveBeenCalledOnce();
        expect(result).toMatchObject({ ok: false, error: 'ERR_TOKEN_EXPIRED', status: 401 });
    });

    it('returns ERR_TOKEN_EXPIRED code on 401 for machine-readable UI handling', async () => {
        setUnauthorizedHandler(vi.fn());

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 401,
            json: async () => ({}),
        }));

        const result = await apiFetch('/api/protected');
        expect(result.error).toBe('ERR_TOKEN_EXPIRED');
    });
});

// ─── setUnauthorizedHandler ───────────────────────────────────────────────────

describe('setUnauthorizedHandler', () => {
    it('replaces the default 401 callback', async () => {
        const custom = vi.fn();
        setUnauthorizedHandler(custom);

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 401,
            json: async () => ({}),
        }));

        await apiFetch('/api/anything');
        expect(custom).toHaveBeenCalledOnce();
    });
});
