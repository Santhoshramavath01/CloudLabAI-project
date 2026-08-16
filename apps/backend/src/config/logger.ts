/**
 * PURPOSE: Minimal centralized logger so log format/level is consistent
 * across the backend and can later be swapped for pino/winston without
 * touching call sites.
 * DEPENDENCIES: ./env
 */

import { env } from './env';

type Level = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<Level, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

function log(level: Level, message: string, meta?: unknown): void {
  if (levelOrder[level] < levelOrder[env.LOG_LEVEL]) return;
  const timestamp = new Date().toISOString();
  const payload = meta !== undefined ? ` ${JSON.stringify(meta)}` : '';
  // eslint-disable-next-line no-console
  console[level === 'debug' ? 'log' : level](`[${timestamp}] [${level.toUpperCase()}] ${message}${payload}`);
}

export const logger = {
  debug: (message: string, meta?: unknown) => log('debug', message, meta),
  info: (message: string, meta?: unknown) => log('info', message, meta),
  warn: (message: string, meta?: unknown) => log('warn', message, meta),
  error: (message: string, meta?: unknown) => log('error', message, meta)
};
