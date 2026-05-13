/**
 * Sentry integration for main process
 */

import * as Sentry from '@sentry/electron/main';
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
