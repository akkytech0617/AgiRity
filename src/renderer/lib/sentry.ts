/**
 * Sentry integration for renderer process
 */

import * as Sentry from '@sentry/electron/renderer';
import { isDevelopment } from '@/shared/lib/logging/config';

/**
 * Get Sentry DSN from environment
 * Returns null if not configured
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

  try {
    Sentry.init({
      dsn,
      environment: isDevelopment() ? 'development' : 'production',
      release: import.meta.env.VITE_APP_VERSION as string | undefined,
      debug: isDevelopment(),
      enableLogs: true,
    });
  } catch {
    // Sentry initialization failed, continue without it
  }
}

/**
 * Capture an exception to Sentry (renderer process)
 */
export function captureExceptionRenderer(error: Error, context?: Record<string, unknown>): void {
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
 * Send a log to Sentry Logs (renderer process)
 * Uses Sentry.logger API for Logs feature (requires enableLogs: true)
 */
export function sendLogRenderer(
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
 * Capture a message to Sentry Issues (renderer process)
 * Uses captureMessage API for Issues feature
 */
export function captureMessageRenderer(
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
