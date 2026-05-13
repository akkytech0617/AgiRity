/**
 * Sentry integration for renderer process
 */

import * as Sentry from '@sentry/electron/renderer';
import { isDevelopment } from '@/shared/lib/logging/config';
import { createSentryClient } from '@/shared/lib/sentry';

/**
 * Get Sentry DSN from environment
 */
function getSentryDsn(): string | null {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (dsn === undefined || dsn === '') {
    return null;
  }
  return dsn;
}

/**
 * Initialize Sentry for renderer process
 */
export function initSentryRenderer(): void {
  const dsn = getSentryDsn();
  if (dsn === null) {
    return;
  }

  Sentry.init({
    dsn,
    environment: isDevelopment() ? 'development' : 'production',
    release: import.meta.env.VITE_APP_VERSION as string | undefined,
    debug: false,
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
