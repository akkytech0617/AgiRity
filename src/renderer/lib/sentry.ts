/**
 * Sentry integration for renderer process
 */

import * as Sentry from '@sentry/electron/renderer';
import { isDevelopment } from '@/shared/lib/logging/config';

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

/**
 * Send log to Sentry Logs
 */
export function sendLog(
  message: string,
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' = 'info',
  attributes?: Record<string, unknown>
): void {
  const dsn = getSentryDsn();
  if (dsn === null) {
    return;
  }

  Sentry.logger[level](message, attributes ?? {});
}

/**
 * Send error/warn to Sentry Issues
 */
export function captureIssue(
  message: string,
  level: 'warning' | 'error' = 'error',
  context?: Record<string, unknown>
): void {
  const dsn = getSentryDsn();
  if (dsn === null) {
    return;
  }

  if (context !== undefined && Object.keys(context).length > 0) {
    Sentry.withScope((scope) => {
      scope.setExtras(context);
      Sentry.captureMessage(message, level);
    });
  } else {
    Sentry.captureMessage(message, level);
  }
}

/**
 * Capture exception to Sentry Issues
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  const dsn = getSentryDsn();
  if (dsn === null) {
    return;
  }

  Sentry.captureException(error, { extra: context });
}
