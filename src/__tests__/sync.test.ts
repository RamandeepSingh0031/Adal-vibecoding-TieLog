import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncToSupabase } from '../src/lib/sync';

// Use vitest hoisting
const { mockGetPendingSyncItems, mockBulkDelete, mockUpsert, mockLoggerInfo, mockLoggerWarn, mockLoggerError, mockLoggerDebug } = vi.hoisted(() => ({
    mockGetPendingSyncItems: vi.fn(),
    mockBulkDelete: vi.fn(),
    mockUpsert: vi.fn(),
    mockLoggerInfo: vi.fn(),
    mockLoggerWarn: vi.fn(),
    mockLoggerError: vi.fn(),
    mockLoggerDebug: vi.fn(),
}));

// Mock db module
vi.mock('../lib/db', () => ({
    db: {
        syncQueue: {
            bulkDelete: mockBulkDelete,
        },
        clusters: { put: vi.fn(async () => { }) },
        organizations: { put: vi.fn(async () => { }) },
        people: { put: vi.fn(async () => { }) },
        notes: { put: vi.fn(async () => { }) },
    },
    getPendingSyncItems: mockGetPendingSyncItems,
    clearSyncQueue: vi.fn(async () => { }),
}));

// Mock Supabase client
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            upsert: mockUpsert,
            delete: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
            select: vi.fn(() => ({
                eq: vi.fn(async () => ({ data: [], error: null })),
                in: vi.fn(async () => ({ data: [], error: null })),
                order: vi.fn(async () => ({ data: [], error: null })),
            })),
        })),
        auth: { getSession: vi.fn() },
    },
}));

// Mock logger
vi.mock('../lib/logger', () => ({
    logger: {
        info: mockLoggerInfo,
        warn: mockLoggerWarn,
        error: mockLoggerError,
        debug: mockLoggerDebug,
    },
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('syncToSupabase', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns early when there are no pending items', async () => {
        mockGetPendingSyncItems.mockResolvedValue([]);
        await syncToSupabase('user-123');
        expect(mockUpsert).not.toHaveBeenCalled();
    });

    it('only syncs items belonging to the given userId', async () => {
        mockGetPendingSyncItems.mockResolvedValue([
            { id: 1, table: 'clusters', action: 'create', data: { id: 'c1', name: 'Test' }, user_id: 'user-A', timestamp: new Date() },
            { id: 2, table: 'clusters', action: 'create', data: { id: 'c2', name: 'Other' }, user_id: 'user-B', timestamp: new Date() },
        ]);
        mockUpsert.mockResolvedValue({ error: null });

        await syncToSupabase('user-A');

        expect(mockUpsert).toHaveBeenCalledTimes(1);
    });

    it('retries a failing upsert up to 3 times before giving up', async () => {
        mockGetPendingSyncItems.mockResolvedValue([
            { id: 1, table: 'clusters', action: 'create', data: { id: 'c1', name: 'Retry Test' }, user_id: 'user-X', timestamp: new Date() },
        ]);

        mockUpsert
            .mockRejectedValueOnce(new Error('Network error 1'))
            .mockRejectedValueOnce(new Error('Network error 2'))
            .mockResolvedValueOnce({ error: null });

        await syncToSupabase('user-X');

        expect(mockUpsert).toHaveBeenCalledTimes(3);
    });

    it('stops retrying after 3 failures and does not throw', async () => {
        mockGetPendingSyncItems.mockResolvedValue([
            { id: 1, table: 'clusters', action: 'create', data: { id: 'c1', name: 'Fail Test' }, user_id: 'user-Y', timestamp: new Date() },
        ]);

        mockUpsert.mockRejectedValue(new Error('Persistent failure'));

        await expect(syncToSupabase('user-Y')).resolves.not.toThrow();
        expect(mockUpsert).toHaveBeenCalledTimes(3);
    });
});
