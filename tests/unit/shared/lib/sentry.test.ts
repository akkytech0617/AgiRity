import { beforeEach, describe, expect, it, vi } from 'vitest';
import { captureException, captureIssue, type SentryLike, sendLog } from '@/shared/lib/sentry';

const DSN = 'https://test@sentry.io/123';

function createFakeSentry(): {
  sentry: SentryLike;
  mocks: {
    logger: Record<
      'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal',
      ReturnType<typeof vi.fn>
    >;
    captureMessage: ReturnType<typeof vi.fn>;
    captureException: ReturnType<typeof vi.fn>;
    withScope: ReturnType<typeof vi.fn>;
    setExtras: ReturnType<typeof vi.fn>;
  };
} {
  const logger = {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  };
  const setExtras = vi.fn();
  const captureMessage = vi.fn();
  const captureExceptionFn = vi.fn();
  const withScope = vi.fn((callback: (scope: { setExtras: typeof setExtras }) => void) => {
    callback({ setExtras });
  });

  const sentry: SentryLike = {
    logger,
    captureMessage,
    captureException: captureExceptionFn,
    withScope,
  };

  return {
    sentry,
    mocks: {
      logger,
      captureMessage,
      captureException: captureExceptionFn,
      withScope,
      setExtras,
    },
  };
}

describe('shared/lib/sentry', () => {
  describe('sendLog', () => {
    let fixture: ReturnType<typeof createFakeSentry>;

    beforeEach(() => {
      fixture = createFakeSentry();
    });

    it('should not send when DSN is null', () => {
      sendLog(fixture.sentry, null, 'msg', 'info');
      expect(fixture.mocks.logger.info).not.toHaveBeenCalled();
    });

    it('should default to info level', () => {
      sendLog(fixture.sentry, DSN, 'msg');
      expect(fixture.mocks.logger.info).toHaveBeenCalledWith('msg', {});
    });

    it('should send to the matching logger level', () => {
      sendLog(fixture.sentry, DSN, 'msg', 'error');
      expect(fixture.mocks.logger.error).toHaveBeenCalledWith('msg', {});
    });

    it('should forward attributes when provided', () => {
      sendLog(fixture.sentry, DSN, 'msg', 'debug', { key: 'value' });
      expect(fixture.mocks.logger.debug).toHaveBeenCalledWith('msg', { key: 'value' });
    });

    it('should pass empty attributes object when none are provided', () => {
      sendLog(fixture.sentry, DSN, 'msg', 'warn');
      expect(fixture.mocks.logger.warn).toHaveBeenCalledWith('msg', {});
    });
  });

  describe('captureIssue', () => {
    let fixture: ReturnType<typeof createFakeSentry>;

    beforeEach(() => {
      fixture = createFakeSentry();
    });

    it('should not capture when DSN is null', () => {
      captureIssue(fixture.sentry, null, 'msg');
      expect(fixture.mocks.captureMessage).not.toHaveBeenCalled();
      expect(fixture.mocks.withScope).not.toHaveBeenCalled();
    });

    it('should default to error level when no level is provided', () => {
      captureIssue(fixture.sentry, DSN, 'msg');
      expect(fixture.mocks.captureMessage).toHaveBeenCalledWith('msg', 'error');
    });

    it('should capture without scope when context is undefined', () => {
      captureIssue(fixture.sentry, DSN, 'msg', 'warning');
      expect(fixture.mocks.withScope).not.toHaveBeenCalled();
      expect(fixture.mocks.captureMessage).toHaveBeenCalledWith('msg', 'warning');
    });

    it('should capture without scope when context is empty', () => {
      captureIssue(fixture.sentry, DSN, 'msg', 'error', {});
      expect(fixture.mocks.withScope).not.toHaveBeenCalled();
      expect(fixture.mocks.captureMessage).toHaveBeenCalledWith('msg', 'error');
    });

    it('should attach extras via withScope when context has entries', () => {
      captureIssue(fixture.sentry, DSN, 'msg', 'warning', { key: 'value' });
      expect(fixture.mocks.withScope).toHaveBeenCalledTimes(1);
      expect(fixture.mocks.setExtras).toHaveBeenCalledWith({ key: 'value' });
      expect(fixture.mocks.captureMessage).toHaveBeenCalledWith('msg', 'warning');
    });
  });

  describe('captureException', () => {
    let fixture: ReturnType<typeof createFakeSentry>;

    beforeEach(() => {
      fixture = createFakeSentry();
    });

    it('should not capture when DSN is null', () => {
      captureException(fixture.sentry, null, new Error('boom'));
      expect(fixture.mocks.captureException).not.toHaveBeenCalled();
    });

    it('should capture an exception without context', () => {
      const error = new Error('boom');
      captureException(fixture.sentry, DSN, error);
      expect(fixture.mocks.captureException).toHaveBeenCalledWith(error, { extra: undefined });
    });

    it('should capture an exception with context attached as extras', () => {
      const error = new Error('boom');
      captureException(fixture.sentry, DSN, error, { processType: 'main' });
      expect(fixture.mocks.captureException).toHaveBeenCalledWith(error, {
        extra: { processType: 'main' },
      });
    });
  });
});
