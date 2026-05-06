/**
 * Plugin Logger - Logging utility for plugins
 */

import { IPluginLogger } from '../types';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
}

export class PluginLogger implements IPluginLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: any): void {
    this.log('error', message, error);
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    // Console output
    const prefix = `[${level.toUpperCase()}]`;
    const timestamp = entry.timestamp.toISOString();
    const output = `${timestamp} ${prefix} ${message}`;

    switch (level) {
      case 'debug':
        data ? console.debug(output, data) : console.debug(output);
        break;
      case 'info':
        data ? console.info(output, data) : console.info(output);
        break;
      case 'warn':
        data ? console.warn(output, data) : console.warn(output);
        break;
      case 'error':
        data ? console.error(output, data) : console.error(output);
        break;
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    return level
      ? this.logs.filter((log) => log.level === level)
      : [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}
