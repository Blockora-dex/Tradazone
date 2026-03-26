/**
 * Date utilities for timezone-stable date handling.
 *
 * ISSUE (Date parsing inconsistent across timezones):
 * - Storing or parsing ambiguous `YYYY-MM-DD` strings using `new Date(value)`
 *   can shift the day depending on the runtime timezone.
 * - This module provides helpers that avoid `new Date(dateOnly)` for
 *   date-only values, and standardize display using UTC.
 */

/**
 * Convert a `YYYY-MM-DD` string into a UTC-pinned ISO timestamp string.
 *
 * @param {string} dateOnly - Date-only in `YYYY-MM-DD` format.
 * @returns {string} ISO string pinned to UTC midnight, e.g. `2025-12-31T00:00:00.000Z`.
 */
export function toUtcMidnightIso(dateOnly) {
    if (!dateOnly || typeof dateOnly !== 'string') return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly.trim());
    if (!match) return '';
    return `${match[0]}T00:00:00.000Z`;
}

/**
 * Format an ISO timestamp (or legacy `YYYY-MM-DD`) into a stable `YYYY-MM-DD`.
 *
 * - If the input is already a legacy date-only string, returns it as-is.
 * - If the input includes an explicit timezone designator (`Z` or `+HH:MM`),
 *   it is parsed and formatted using UTC components.
 * - If the input looks like ISO but has no timezone designator, we return the
 *   date prefix without parsing to avoid timezone shifts.
 *
 * @param {string|null|undefined} value
 * @returns {string}
 */
export function formatUtcDate(value) {
    if (!value || typeof value !== 'string') return '';

    const trimmed = value.trim();

    // Legacy `YYYY-MM-DD` support (stable, no parsing).
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

    // Fast-path: if it starts with `YYYY-MM-DD`, either:
    // - use UTC formatting when timezone is explicit, or
    // - avoid parsing entirely when timezone is implicit.
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        const hasExplicitTimezone = /Z$|[+-]\d{2}:\d{2}$/.test(trimmed);
        if (!hasExplicitTimezone) return trimmed.slice(0, 10);
    }

    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) return '';

    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

