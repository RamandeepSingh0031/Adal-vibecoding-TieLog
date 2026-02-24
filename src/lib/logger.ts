/**
 * Structured JSON logger — output is compatible with Vercel Log Drains.
 * Replaces ad-hoc console.log/console.error calls throughout the codebase.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogPayload {
    level: LogLevel;
    message: string;
    timestamp: string;
    [key: string]: unknown;
}

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    // In browser environments keep it minimal; on server (Edge/Node) emit JSON.
    const payload: LogPayload = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...meta,
    };

    const formatted = JSON.stringify(payload);

    switch (level) {
        case 'debug':
            // eslint-disable-next-line no-console
            console.debug(formatted);
            break;
        case 'info':
            // eslint-disable-next-line no-console
            console.info(formatted);
            break;
        case 'warn':
            // eslint-disable-next-line no-console
            console.warn(formatted);
            break;
        case 'error':
            // eslint-disable-next-line no-console
            console.error(formatted);
            break;
    }
}

export const logger = {
    debug: (message: string, meta?: Record<string, unknown>) => emit('debug', message, meta),
    info: (message: string, meta?: Record<string, unknown>) => emit('info', message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => emit('warn', message, meta),
    error: (message: string, meta?: Record<string, unknown>) => emit('error', message, meta),
};
