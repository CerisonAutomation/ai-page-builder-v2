/**
 * Production-Grade Logger
 * ✅ Structured logging with context, levels, and optional backend integration
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  stack?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private isProduction = process.env.NODE_ENV === "production";

  /**
   * Format log entry for console output
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const ctx = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level}] ${message}${ctx}`;
  }

  /**
   * Log debug message (dev only)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;
    console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage(LogLevel.INFO, message, context));
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  /**
   * Log error message with optional stack trace
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    let stack: string | undefined;

    // Extract stack trace from error
    if (error instanceof Error) {
      stack = error.stack;
    } else if (typeof error === "object" && error !== null) {
      const err = error as Error & { code?: string | number };
      stack = err.stack;
    }

    const fullContext = {
      ...context,
      ...(error instanceof Error && { errorMessage: error.message }),
    };

    const msg = this.formatMessage(LogLevel.ERROR, message, fullContext);
    console.error(msg);
    if (stack) {
      console.error(stack);
    }
  }

  /**
   * Log performance metrics
   */
  metric(label: string, duration: number, context?: LogContext): void {
    const msg = `[METRIC] ${label}: ${duration}ms`;
    console.log(
      msg,
      context ? JSON.stringify(context) : ""
    );
  }

  /**
   * Start timer for performance measurement
   */
  startTimer(): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      return duration;
    };
  }

  /**
   * Create child logger with fixed context
   */
  createChild(childContext: LogContext): ChildLogger {
    return new ChildLogger(this, childContext);
  }
}

/**
 * Child logger that inherits parent context
 */
class ChildLogger {
  constructor(private parent: Logger, private context: LogContext) {}

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, { ...this.context, ...context });
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, { ...this.context, ...context });
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, { ...this.context, ...context });
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    this.parent.error(message, error, { ...this.context, ...context });
  }

  metric(label: string, duration: number, context?: LogContext): void {
    this.parent.metric(label, duration, { ...this.context, ...context });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other modules
export type ILogger = Logger;
