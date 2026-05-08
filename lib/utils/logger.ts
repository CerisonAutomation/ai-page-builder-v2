/**
 * Structured Logger
 *
 * Wraps console methods with structured JSON output in production
 * and human-readable format in development.
 *
 * Usage:
 * ```ts
 * import { logger } from '@/lib/utils/logger';
 * logger.info('Page rendered', { slug });
 * logger.error('DB query failed', error, { userId });
 * ```
 *
 * @module lib/utils/logger
 */

type LogLevel = "debug" | "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

const isDev = process.env.NODE_ENV === "development";

function buildLogEntry(
  level: LogLevel,
  message: string,
  error?: unknown,
  meta?: LogMeta
) {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
    ...(error
      ? {
          error: {
            message: error instanceof Error ? error.message : String(error),
            stack:
              error instanceof Error && isDev ? error.stack : undefined,
            code:
              (error as Record<string, unknown>)?.code ?? undefined,
          },
        }
      : {}),
  };
}

/**
 * Application logger — structured JSON in production, pretty-print in dev.
 */
export const logger = {
  /**
   * Log a debug-level message (dev only).
   */
  debug(message: string, meta?: LogMeta): void {
    if (!isDev) return;
    console.debug(JSON.stringify(buildLogEntry("debug", message, undefined, meta), null, 2));
  },

  /**
   * Log an informational message.
   */
  info(message: string, meta?: LogMeta): void {
    const entry = buildLogEntry("info", message, undefined, meta);
    if (isDev) {
      console.info(`[INFO] ${message}`, meta ?? "");
    } else {
      console.info(JSON.stringify(entry));
    }
  },

  /**
   * Log a warning.
   */
  warn(message: string, meta?: LogMeta): void {
    const entry = buildLogEntry("warn", message, undefined, meta);
    if (isDev) {
      console.warn(`[WARN] ${message}`, meta ?? "");
    } else {
      console.warn(JSON.stringify(entry));
    }
  },

  /**
   * Log an error with optional context metadata.
   * @param message - Human-readable description
   * @param error   - The caught error (Error instance or unknown)
   * @param meta    - Additional key-value context (userId, slug, etc.)
   */
  error(message: string, error?: unknown, meta?: LogMeta): void {
    const entry = buildLogEntry("error", message, error, meta);
    if (isDev) {
      console.error(`[ERROR] ${message}`, error ?? "", meta ?? "");
    } else {
      console.error(JSON.stringify(entry));
    }
  },
};
