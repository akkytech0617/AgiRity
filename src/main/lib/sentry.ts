/**
 * Sentry integration for main process
 */

import * as Sentry from '@sentry/electron/main';
import { isDevelopment } from '@/shared/lib/logging/config';
import { createSentryClient } from '@/shared/lib/sentry';

/**
 * Get Sentry DSN from environment
 */
function getSentryDsn(): string | null {
  const dsn = process.env.SENTRY_DSN;
  if (dsn === undefined || dsn === '') {
    return null;
  }
  return dsn;
}

/**
 * Initialize Sentry for main process
 */
export function initSentryMain(): void {
  const dsn = getSentryDsn();
  if (dsn === null) {
    return;
  }

  Sentry.init({
    dsn,
    environment: isDevelopment() ? 'development' : 'production',
    release: process.env.npm_package_version,
    debug: false,
    tracesSampleRate: isDevelopment() ? 1 : 0.1,
    enableLogs: true,
  });
}

const client = createSentryClient(Sentry, getSentryDsn);

/**
 * Send log to Sentry Logs
 */
export const sendLog = client.sendLog;

/**
 * Send error/warn to Sentry Issues
 */
export const captureIssue = client.captureIssue;

/**
 * Capture exception to Sentry Issues
 */
export const captureException = client.captureException;

/**
 * Flush Sentry buffer before exit
 */
export async function flushSentry(timeout = 2000): Promise<boolean> {
  const dsn = getSentryDsn();
  if (dsn === null) {
    return true;
  }

  try {
    return await Sentry.flush(timeout);
  } catch {
    return false;
  }
}
