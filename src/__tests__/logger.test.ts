import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '@/src/lib/logger';

describe('logger', () => {
    beforeEach(() => {
        vi.spyOn(console, 'info').mockImplementation(() => undefined);
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    });

    it('emits a JSON string with the correct level for info', () => {
        logger.info('test message', { key: 'value' });
        expect(console.info).toHaveBeenCalledOnce();
        const mockInfo = console.info as unknown as { mock: { calls: readonly [string, ...unknown[]][] } };
        const [rawArg] = mockInfo.mock.calls[0];
        const parsed = JSON.parse(rawArg as string);
        expect(parsed.level).toBe('info');
        expect(parsed.message).toBe('test message');
        expect(parsed.key).toBe('value');
        expect(parsed.timestamp).toBeDefined();
    });

    it('emits the correct level for error', () => {
        logger.error('something broke', { code: 500 });
        const mockError = console.error as unknown as { mock: { calls: readonly [string, ...unknown[]][] } };
        const [rawArg] = mockError.mock.calls[0];
        const parsed = JSON.parse(rawArg as string);
        expect(parsed.level).toBe('error');
        expect(parsed.code).toBe(500);
    });

    it('emits the correct level for warn', () => {
        logger.warn('heads up');
        const mockWarn = console.warn as unknown as { mock: { calls: readonly [string, ...unknown[]][] } };
        const [rawArg] = mockWarn.mock.calls[0];
        const parsed = JSON.parse(rawArg as string);
        expect(parsed.level).toBe('warn');
    });

    it('includes an ISO 8601 timestamp', () => {
        logger.info('ts test');
        const mockInfo = console.info as unknown as { mock: { calls: readonly [string, ...unknown[]][] } };
        const [rawArg] = mockInfo.mock.calls[0];
        const parsed = JSON.parse(rawArg as string);
        expect(() => new Date(parsed.timestamp)).not.toThrow();
        expect(new Date(parsed.timestamp).toISOString()).toBe(parsed.timestamp);
    });

    it('works without meta argument', () => {
        expect(() => logger.info('no meta')).not.toThrow();
    });
});
