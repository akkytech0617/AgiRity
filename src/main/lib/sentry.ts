/**
 * Sentry integration for main process
 */

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
 */
export async function initSentryMain(): Promise<void> {
  const dsn = getSentryDsn();
  if (dsn === null) {
    return;
  }

  try {
    const Sentry = await import('@sentry/electron/main');
    Sentry.init({
      dsn,
      environment: isDevelopment() ? 'development' : 'production',
      release: process.env.npm_package_version,
      debug: isDevelopment(),
      tracesSampleRate: isDevelopment() ? 1 : 0.1,
    });
  } catch {
    // Sentry initialization failed, continue without it
  }
}

/**
 * Capture an exception to Sentry (main process)
 */
export async function captureExceptionMain(
  error: Error,
  context?: Record<string, unknown>
): Promise<void> {
  const dsn = getSentryDsn();
  if (dsn === null) {
    return;
  }

  try {
    const Sentry = await import('@sentry/electron/main');
    Sentry.captureException(error, { extra: context });
  } catch {
    // Sentry not available
  }
}
