import { describe, it, expect } from 'vitest';
import { toUtcMidnightIso, formatUtcDate } from '../utils/date';

describe('date utils', () => {
    describe('toUtcMidnightIso', () => {
        it('converts YYYY-MM-DD to UTC midnight ISO', () => {
            expect(toUtcMidnightIso('2025-12-31')).toBe('2025-12-31T00:00:00.000Z');
        });

        it('returns empty string for invalid input', () => {
            expect(toUtcMidnightIso('')).toBe('');
            expect(toUtcMidnightIso('2025/12/31')).toBe('');
            expect(toUtcMidnightIso('2025-1-31')).toBe('');
            expect(toUtcMidnightIso(null)).toBe('');
        });
    });

    describe('formatUtcDate', () => {
        it('formats legacy YYYY-MM-DD as-is', () => {
            expect(formatUtcDate('2025-12-31')).toBe('2025-12-31');
        });

        it('formats ISO with explicit Z using UTC components', () => {
            expect(formatUtcDate('2025-12-31T23:59:59.000Z')).toBe('2025-12-31');
            expect(formatUtcDate('2026-01-01T00:00:01.000Z')).toBe('2026-01-01');
        });

        it('avoids parsing ISO without timezone designator', () => {
            expect(formatUtcDate('2025-12-31T10:00:00.000')).toBe('2025-12-31');
        });
    });
});

