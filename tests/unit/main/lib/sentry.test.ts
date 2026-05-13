import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockSentryInit = vi.fn();
const mockSentryFlush = vi.fn();
const mockSentryCaptureException = vi.fn();
const mockSentryCaptureMessage = vi.fn();
const mockSentryWithScope = vi.fn();
const mockSentryLogger = {
  trace: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  fatal: vi.fn(),
};

vi.mock('@sentry/electron/main', () => ({
  init: mockSentryInit,
  flush: mockSentryFlush,
  captureException: mockSentryCaptureException,
  captureMessage: mockSentryCaptureMessage,
  withScope: mockSentryWithScope,
  logger: mockSentryLogger,
}));

vi.mock('@/shared/lib/logging/config', () => ({
  isDevelopment: vi.fn(() => true),
}));

describe('Sentry Main Process', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  describe('initSentryMain', () => {
    it('should not initialize when DSN is not configured', async () => {
      delete process.env.SENTRY_DSN;
      const { initSentryMain } = await import('@/main/lib/sentry');
      initSentryMain();
      expect(mockSentryInit).not.toHaveBeenCalled();
    });

    it('should initialize with correct config when DSN is provided', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      const { initSentryMain } = await import('@/main/lib/sentry');
      initSentryMain();
      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123',
          environment: 'development',
          debug: false,
          enableLogs: true,
        })
      );
    });
  });

  describe('shared helper integration', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should forward sendLog to the main Sentry logger when DSN is configured', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      const { sendLog } = await import('@/main/lib/sentry');
      sendLog('main log', 'info', { key: 'value' });
      expect(mockSentryLogger.info).toHaveBeenCalledWith('main log', { key: 'value' });
    });

    it('should no-op sendLog when DSN is missing', async () => {
      delete process.env.SENTRY_DSN;
      const { sendLog } = await import('@/main/lib/sentry');
      sendLog('main log', 'info');
      expect(mockSentryLogger.info).not.toHaveBeenCalled();
    });

    it('should forward captureIssue to the main Sentry instance', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      const { captureIssue } = await import('@/main/lib/sentry');
      captureIssue('issue', 'error');
      expect(mockSentryCaptureMessage).toHaveBeenCalledWith('issue', 'error');
    });

    it('should attach context via withScope when captureIssue receives context', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      const mockScope = { setExtras: vi.fn() };
      mockSentryWithScope.mockImplementation((cb: (scope: typeof mockScope) => void) => {
        cb(mockScope);
      });
      const { captureIssue } = await import('@/main/lib/sentry');
      captureIssue('issue', 'warning', { processType: 'main' });
      expect(mockScope.setExtras).toHaveBeenCalledWith({ processType: 'main' });
      expect(mockSentryCaptureMessage).toHaveBeenCalledWith('issue', 'warning');
    });

    it('should forward captureException to the main Sentry instance', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      const { captureException } = await import('@/main/lib/sentry');
      const error = new Error('boom');
      captureException(error, { processType: 'main' });
      expect(mockSentryCaptureException).toHaveBeenCalledWith(error, {
        extra: { processType: 'main' },
      });
    });

    it('should no-op captureException when DSN is missing', async () => {
      delete process.env.SENTRY_DSN;
      const { captureException } = await import('@/main/lib/sentry');
      captureException(new Error('boom'));
      expect(mockSentryCaptureException).not.toHaveBeenCalled();
    });
  });

  describe('flushSentry', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should return true when DSN is not configured', async () => {
      delete process.env.SENTRY_DSN;
      const { flushSentry } = await import('@/main/lib/sentry');
      const result = await flushSentry();
      expect(result).toBe(true);
      expect(mockSentryFlush).not.toHaveBeenCalled();
    });

    it('should call flush with the provided timeout when DSN is configured', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      mockSentryFlush.mockResolvedValue(true);
      const { flushSentry } = await import('@/main/lib/sentry');
      const result = await flushSentry(5000);
      expect(mockSentryFlush).toHaveBeenCalledWith(5000);
      expect(result).toBe(true);
    });

    it('should return false when flush throws', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      mockSentryFlush.mockRejectedValue(new Error('flush failed'));
      const { flushSentry } = await import('@/main/lib/sentry');
      const result = await flushSentry(1000);
      expect(result).toBe(false);
    });
  });
});
