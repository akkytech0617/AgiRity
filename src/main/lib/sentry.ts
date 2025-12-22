/**
 * Sentry integration for main process
 */

import * as Sentry from '@sentry/electron/main';
import { isDevelopment } from '@/shared/lib/logging/config';

/**
 * Get Sentry DSN from environment
 * Returns null if not configured
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
 * Must be called as early as possible in the main process
 */
export function initSentryMain(): void {
  const dsn = getSentryDsn();
  if (dsn === null) {
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: isDevelopment() ? 'development' : 'production',
      release: process.env.npm_package_version,
      debug: isDevelopment(),
      tracesSampleRate: isDevelopment() ? 1 : 0.1,
      enableLogs: true,
    });

    // 初期化直後にテストログを送信 (Logs機能)
    Sentry.logger.info('Sentry initialized - test log from main process', {
      timestamp: Date.now(),
      processType: 'main',
      testLog: true,
    });

    // 初期化直後にテストメッセージを送信 (Issues機能)
    Sentry.captureMessage('Sentry initialized - test issue from main process', 'info');
  } catch {
    // Sentry initialization failed, continue without it
  }
}

/**
 * Capture an exception to Sentry (main process)
 */
export function captureExceptionMain(error: Error, context?: Record<string, unknown>): void {
  const dsn = getSentryDsn();
  if (dsn === null) {
    return;
  }

  try {
    Sentry.captureException(error, { extra: context });
  } catch {
    // Sentry not available
  }
}

/**
 * Send a log to Sentry Logs (main process)
 * Uses Sentry.logger API for Logs feature (requires enableLogs: true)
 */
export function sendLogMain(
  message: string,
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' = 'info',
  attributes?: Record<string, unknown>
): void {
  const dsn = getSentryDsn();
  if (dsn === null) {
    return;
  }

  try {
    const attrs = attributes ?? {};
    switch (level) {
      case 'trace':
        Sentry.logger.trace(message, attrs);
        break;
      case 'debug':
        Sentry.logger.debug(message, attrs);
        break;
      case 'info':
        Sentry.logger.info(message, attrs);
        break;
      case 'warn':
        Sentry.logger.warn(message, attrs);
        break;
      case 'error':
        Sentry.logger.error(message, attrs);
        break;
      case 'fatal':
        Sentry.logger.fatal(message, attrs);
        break;
      default:
        Sentry.logger.info(message, attrs);
    }
  } catch {
    // Sentry logger not available
  }
}

/**
 * Flush Sentry buffer (main process)
 * Call this before app exits to ensure all events are sent
 */
export async function flushSentryMain(timeout = 2000): Promise<boolean> {
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

/**
 * Capture a message to Sentry Issues (main process)
 * Uses captureMessage API for Issues feature
 */
export function captureMessageMain(
  message: string,
  level: 'info' | 'warning' | 'error' | 'debug' = 'info',
  context?: Record<string, unknown>
): void {
  const dsn = getSentryDsn();
  if (dsn === null) {
    return;
  }

  try {
    if (context && Object.keys(context).length > 0) {
      Sentry.withScope((scope) => {
        scope.setExtras(context);
        Sentry.captureMessage(message, level);
      });
    } else {
      Sentry.captureMessage(message, level);
    }
  } catch {
    // Sentry not available
  }
}
