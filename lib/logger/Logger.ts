

import { config } from '@/config/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.logLevel = config.monitoring.logLevel as LogLevel;
    this.isDevelopment = config.app.isDevelopment;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.logLevel];
  }

  debug(message: string, data?: any): void {
    if (!this.shouldLog('debug')) return;
    this.output('debug', message, data);
  }

  info(message: string, data?: any): void {
    if (!this.shouldLog('info')) return;
    this.output('info', message, data);
  }

  warn(message: string, data?: any): void {
    if (!this.shouldLog('warn')) return;
    this.output('warn', message, data);
  }

  error(message: string, data?: any): void {
    if (!this.shouldLog('error')) return;
    this.output('error', message, data);
  }

  private output(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    
    if (this.isDevelopment) {
      const emoji = { debug: '🔍', info: 'ℹ️', warn: '⚠️', error: '❌' };
      console.log(`${emoji[level]} [${level.toUpperCase()}] ${timestamp} - ${message}`);
      if (data) console.log('  Data:', data);
    } else {
      console.log(JSON.stringify({ level, message, timestamp, data }));
    }
  }
}

export const logger = new Logger();