/**
 * Sentry integration for renderer process
 */

import * as Sentry from '@sentry/electron/renderer';
import { isDevelopment } from '@/shared/lib/logging/config';
import {
  type SentryIssueLevel,
  type SentryLogLevel,
  captureException as sharedCaptureException,
  captureIssue as sharedCaptureIssue,
  sendLog as sharedSendLog,
} from '@/shared/lib/sentry';

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
  level: SentryLogLevel = 'info',
  attributes?: Record<string, unknown>
): void {
  sharedSendLog(Sentry, getSentryDsn(), message, level, attributes);
}

/**
 * Send error/warn to Sentry Issues
 */
export function captureIssue(
  message: string,
  level: SentryIssueLevel = 'error',
  context?: Record<string, unknown>
): void {
  sharedCaptureIssue(Sentry, getSentryDsn(), message, level, context);
}

/**
 * Capture exception to Sentry Issues
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  sharedCaptureException(Sentry, getSentryDsn(), error, context);
}
