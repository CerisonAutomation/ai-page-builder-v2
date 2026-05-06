/**
 * Structured Logger — Standardised Logging Across App
 * ✅ All logs: { timestamp, level, context, message, duration? }
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: Record<string, unknown>;
  message: string;
  duration?: number;
  error?: {
    code?: string;
    message?: string;
    stack?: string;
  };
}

class Logger {
  private isDev = process.env.NODE_ENV === "development";
  private context: Record<string, unknown> = {};

  /**
   * Set persistent context for all logs in this scope
   * Useful for request IDs, user IDs, etc.
   */
  setContext(context: Record<string, unknown>) {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear context
   */
  clearContext() {
    this.context = {};
  }

  /**
   * Create child logger with additional context
   */
  child(context: Record<string, unknown>): Logger {
    const child = new Logger();
    child.context = { ...this.context, ...context };
    return child;
  }

  /**
   * Debug level — detailed info for development
   */
  debug(message: string, context: Record<string, unknown> = {}, durationMs?: number) {
    if (!this.isDev) return;
    this.log("debug", message, context, durationMs);
  }

  /**
   * Info level — important events (page saved, user logged in, etc.)
   */
  info(message: string, context: Record<string, unknown> = {}, durationMs?: number) {
    this.log("info", message, context, durationMs);
  }

  /**
   * Warn level — potentially problematic situations
   */
  warn(message: string, context: Record<string, unknown> = {}, durationMs?: number) {
    this.log("warn", message, context, durationMs);
  }

  /**
   * Error level — error conditions
   */
  error(message: string, error?: Error | unknown, context: Record<string, unknown> = {}, durationMs?: number) {
    const errorContext = this.extractError(error);
    this.log("error", message, { ...errorContext, ...context }, durationMs);
  }

  /**
   * Time an operation and log result
   */
  async timed<T>(
    message: string,
    fn: () => Promise<T>,
    context: Record<string, unknown> = {}
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = Math.round(performance.now() - start);
      this.info(message, context, duration);
      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      this.error(`${message} failed`, error, context, duration);
      throw error;
    }
  }

  /**
   * Log HTTP request
   */
  request(method: string, path: string, status: number, durationMs: number, context: Record<string, unknown> = {}) {
    const statusEmoji = status < 300 ? "✅" : status < 400 ? "ℹ️" : status < 500 ? "⚠️" : "❌";
    const message = `${statusEmoji} ${method} ${path} ${status}`;
    this.info(message, { ...context, status, duration: durationMs }, durationMs);
  }

  /**
   * Internal: extract error info
   */
  private extractError(error: unknown) {
    if (!error) return {};

    if (error instanceof Error) {
      const errorWithCode = error as Error & { code?: string | number };
      return {
        error: {
          code: String(errorWithCode.code ?? "UNKNOWN"),
          message: error.message,
          stack: error.stack,
        },
      };
    }

    return {
      error: {
        message: String(error),
      },
    };
  }

  /**
   * Internal: log to console
   */
  private log(
    level: LogLevel,
    message: string,
    context: Record<string, unknown> = {},
    durationMs?: number
  ) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: { ...this.context, ...context },
      message,
    };

    if (durationMs !== undefined) {
      entry.duration = durationMs;
    }

    const logFn = console[level] || console.log;

    if (this.isDev) {
      // Development: pretty print
      logFn(`[${entry.level.toUpperCase()}] ${entry.message}`, {
        ...entry.context,
        duration: entry.duration,
      });
    } else {
      // Production: JSON logs (for log aggregation services)
      logFn(JSON.stringify(entry));
    }
  }
}

export const logger = new Logger();

// ✅ CREATE SCOPED LOGGERS
export function createLogger(scope: string) {
  const scoped = new Logger();
  scoped.setContext({ scope });
  return scoped;
}
