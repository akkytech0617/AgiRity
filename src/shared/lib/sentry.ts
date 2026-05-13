/**
 * Sentry helpers shared between main and renderer processes.
 *
 * The helpers accept a process-specific Sentry instance and DSN so the
 * same logic can be reused across `@sentry/electron/main` and
 * `@sentry/electron/renderer`.
 */

export type SentryLogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type SentryIssueLevel = 'warning' | 'error';

type LoggerMethod = (message: string, attributes: Record<string, unknown>) => void;

interface SentryScopeLike {
  setExtras: (extras: Record<string, unknown>) => void;
}

/**
 * Minimal Sentry surface required by the shared helpers.
 *
 * Both `@sentry/electron/main` and `@sentry/electron/renderer` provide a
 * superset of this shape, so passing the imported namespace as-is is safe.
 */
export interface SentryLike {
  logger: Record<SentryLogLevel, LoggerMethod>;
  captureMessage: (message: string, level: SentryIssueLevel) => void;
  captureException: (error: Error, hint?: { extra?: Record<string, unknown> }) => void;
  withScope: (callback: (scope: SentryScopeLike) => void) => void;
}

/**
 * Send a structured log entry to Sentry Logs.
 *
 * No-ops when the DSN is not configured.
 */
export function sendLog(
  sentry: SentryLike,
  dsn: string | null,
  message: string,
  level: SentryLogLevel = 'info',
  attributes?: Record<string, unknown>
): void {
  if (dsn === null) {
    return;
  }

  sentry.logger[level](message, attributes ?? {});
}

/**
 * Capture a warning or error message as a Sentry Issue.
 *
 * Attaches `context` as extras when provided. No-ops when the DSN is not
 * configured.
 */
export function captureIssue(
  sentry: SentryLike,
  dsn: string | null,
  message: string,
  level: SentryIssueLevel = 'error',
  context?: Record<string, unknown>
): void {
  if (dsn === null) {
    return;
  }

  if (context !== undefined && Object.keys(context).length > 0) {
    sentry.withScope((scope) => {
      scope.setExtras(context);
      sentry.captureMessage(message, level);
    });
  } else {
    sentry.captureMessage(message, level);
  }
}

/**
 * Capture an exception as a Sentry Issue.
 *
 * No-ops when the DSN is not configured.
 */
export function captureException(
  sentry: SentryLike,
  dsn: string | null,
  error: Error,
  context?: Record<string, unknown>
): void {
  if (dsn === null) {
    return;
  }

  sentry.captureException(error, { extra: context });
}

/**
 * Per-process Sentry client bound to a specific Sentry instance and DSN source.
 */
export interface SentryClient {
  sendLog: (message: string, level?: SentryLogLevel, attributes?: Record<string, unknown>) => void;
  captureIssue: (
    message: string,
    level?: SentryIssueLevel,
    context?: Record<string, unknown>
  ) => void;
  captureException: (error: Error, context?: Record<string, unknown>) => void;
}

/**
 * Build a Sentry client bound to the given process-specific Sentry instance and
 * a DSN resolver. The resolver is invoked on every call so DSN changes (e.g.
 * lazy env loading) are picked up automatically.
 */
export function createSentryClient(sentry: SentryLike, getDsn: () => string | null): SentryClient {
  return {
    sendLog: (message, level, attributes) => sendLog(sentry, getDsn(), message, level, attributes),
    captureIssue: (message, level, context) =>
      captureIssue(sentry, getDsn(), message, level, context),
    captureException: (error, context) => captureException(sentry, getDsn(), error, context),
  };
}
