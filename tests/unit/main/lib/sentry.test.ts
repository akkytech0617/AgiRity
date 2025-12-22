import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

  describe('sendLog', () => {
    beforeEach(() => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      vi.resetModules();
    });

    it('should not send when DSN is not configured', async () => {
      delete process.env.SENTRY_DSN;
      vi.resetModules();
      const { sendLog } = await import('@/main/lib/sentry');
      sendLog('test', 'info');
      expect(mockSentryLogger.info).not.toHaveBeenCalled();
    });

    it('should send info log', async () => {
      const { sendLog } = await import('@/main/lib/sentry');
      sendLog('test message', 'info');
      expect(mockSentryLogger.info).toHaveBeenCalledWith('test message', {});
    });

    it('should send error log', async () => {
      const { sendLog } = await import('@/main/lib/sentry');
      sendLog('error message', 'error');
      expect(mockSentryLogger.error).toHaveBeenCalledWith('error message', {});
    });

    it('should pass attributes', async () => {
      const { sendLog } = await import('@/main/lib/sentry');
      sendLog('test', 'info', { key: 'value' });
      expect(mockSentryLogger.info).toHaveBeenCalledWith('test', { key: 'value' });
    });
  });

  describe('captureIssue', () => {
    beforeEach(() => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      vi.resetModules();
    });

    it('should not capture when DSN is not configured', async () => {
      delete process.env.SENTRY_DSN;
      vi.resetModules();
      const { captureIssue } = await import('@/main/lib/sentry');
      captureIssue('test');
      expect(mockSentryCaptureMessage).not.toHaveBeenCalled();
    });

    it('should capture message', async () => {
      const { captureIssue } = await import('@/main/lib/sentry');
      captureIssue('test message', 'error');
      expect(mockSentryCaptureMessage).toHaveBeenCalledWith('test message', 'error');
    });

    it('should capture with context using withScope', async () => {
      const mockScope = { setExtras: vi.fn() };
      mockSentryWithScope.mockImplementation((cb: (scope: typeof mockScope) => void) => {
        cb(mockScope);
      });
      const { captureIssue } = await import('@/main/lib/sentry');
      captureIssue('test', 'warning', { key: 'value' });
      expect(mockScope.setExtras).toHaveBeenCalledWith({ key: 'value' });
    });
  });

  describe('captureException', () => {
    beforeEach(() => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      vi.resetModules();
    });

    it('should not capture when DSN is not configured', async () => {
      delete process.env.SENTRY_DSN;
      vi.resetModules();
      const { captureException } = await import('@/main/lib/sentry');
      captureException(new Error('test'));
      expect(mockSentryCaptureException).not.toHaveBeenCalled();
    });

    it('should capture exception', async () => {
      const { captureException } = await import('@/main/lib/sentry');
      const error = new Error('test');
      captureException(error);
      expect(mockSentryCaptureException).toHaveBeenCalledWith(error, { extra: undefined });
    });
  });

  describe('flushSentry', () => {
    beforeEach(() => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      vi.resetModules();
    });

    it('should return true when DSN is not configured', async () => {
      delete process.env.SENTRY_DSN;
      vi.resetModules();
      const { flushSentry } = await import('@/main/lib/sentry');
      const result = await flushSentry();
      expect(result).toBe(true);
    });

    it('should call flush with timeout', async () => {
      mockSentryFlush.mockResolvedValue(true);
      const { flushSentry } = await import('@/main/lib/sentry');
      const result = await flushSentry(5000);
      expect(mockSentryFlush).toHaveBeenCalledWith(5000);
      expect(result).toBe(true);
    });
  });
});
