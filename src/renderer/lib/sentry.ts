/**
 * Sentry integration for renderer process
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
 * Initialize Sentry for renderer process
 */
export async function initSentryRenderer(): Promise<void> {
  const dsn = getSentryDsn();
  if (dsn === null) {
    return;
  }

  try {
    const Sentry = await import('@sentry/electron/renderer');
    Sentry.init({
      dsn,
      environment: isDevelopment() ? 'development' : 'production',
      release: process.env.npm_package_version,
      debug: isDevelopment(),
    });
  } catch {
    // Sentry initialization failed, continue without it
  }
}

/**
 * Capture an exception to Sentry (renderer process)
 */
export async function captureExceptionRenderer(
  error: Error,
  context?: Record<string, unknown>
): Promise<void> {
  const dsn = getSentryDsn();
  if (dsn === null) {
    return;
  }

  try {
    const Sentry = await import('@sentry/electron/renderer');
    Sentry.captureException(error, { extra: context });
  } catch {
    // Sentry not available
  }
}
