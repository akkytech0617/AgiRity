import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPerfTracker, NOOP_TRACKER, type IPerfTracker } from '@/shared/lib/perf/PerfTracker';

describe('PerfTracker', () => {
  let tracker: IPerfTracker;

  beforeEach(() => {
    tracker = createPerfTracker();
  });

  describe('mark and measure', () => {
    it('records marks and measures duration', () => {
      tracker.mark('start');
      tracker.mark('end');
      const duration = tracker.measure('test', 'start', 'end');

      expect(duration).toBeGreaterThanOrEqual(0);

      const report = tracker.report();
      expect(report.measurements).toHaveLength(1);
      expect(report.measurements[0].name).toBe('test');
      expect(report.measurements[0].startMark).toBe('start');
      expect(report.measurements[0].endMark).toBe('end');
    });

    it('measures from mark to current time when endMark is omitted', () => {
      tracker.mark('start');
      const duration = tracker.measure('test', 'start');

      expect(duration).toBeGreaterThanOrEqual(0);

      const report = tracker.report();
      expect(report.measurements).toHaveLength(1);
    });

    it('returns -1 when start mark does not exist', () => {
      const duration = tracker.measure('test', 'nonexistent');
      expect(duration).toBe(-1);
    });

    it('returns -1 when end mark does not exist', () => {
      tracker.mark('start');
      const duration = tracker.measure('test', 'start', 'nonexistent');
      expect(duration).toBe(-1);
    });
  });

  describe('memorySnapshot', () => {
    it('records memory snapshot', () => {
      tracker.memorySnapshot('test');

      const report = tracker.report();
      expect(report.memorySnapshots).toHaveLength(1);
      expect(report.memorySnapshots[0].label).toBe('test');
      expect(report.memorySnapshots[0].rss).toBeGreaterThanOrEqual(0);
      expect(report.memorySnapshots[0].heapUsed).toBeGreaterThanOrEqual(0);
      expect(report.memorySnapshots[0].heapTotal).toBeGreaterThanOrEqual(0);
      expect(report.memorySnapshots[0].timestamp).toBeGreaterThan(0);
    });
  });

  describe('report', () => {
    it('returns empty report when no measurements', () => {
      const report = tracker.report();
      expect(report.measurements).toHaveLength(0);
      expect(report.memorySnapshots).toHaveLength(0);
    });

    it('returns a copy of data', () => {
      tracker.mark('start');
      tracker.measure('test', 'start');
      tracker.memorySnapshot('test');

      const report1 = tracker.report();
      const report2 = tracker.report();

      expect(report1).toEqual(report2);
      expect(report1.measurements).not.toBe(report2.measurements);
      expect(report1.memorySnapshots).not.toBe(report2.memorySnapshots);
    });

    it('accumulates multiple measurements', () => {
      tracker.mark('a');
      tracker.mark('b');
      tracker.mark('c');
      tracker.measure('first', 'a', 'b');
      tracker.measure('second', 'b', 'c');

      const report = tracker.report();
      expect(report.measurements).toHaveLength(2);
      expect(report.measurements[0].name).toBe('first');
      expect(report.measurements[1].name).toBe('second');
    });
  });
});

describe('NOOP_TRACKER', () => {
  it('does nothing on mark', () => {
    expect(() => {
      NOOP_TRACKER.mark('test');
    }).not.toThrow();
  });

  it('returns -1 on measure', () => {
    expect(NOOP_TRACKER.measure('test', 'start')).toBe(-1);
  });

  it('does nothing on memorySnapshot', () => {
    expect(() => {
      NOOP_TRACKER.memorySnapshot('test');
    }).not.toThrow();
  });

  it('returns empty report', () => {
    const report = NOOP_TRACKER.report();
    expect(report.measurements).toHaveLength(0);
    expect(report.memorySnapshots).toHaveLength(0);
  });
});

describe('isPerfEnabled', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns false when AGIRITY_PERF is not set', async () => {
    delete process.env.AGIRITY_PERF;
    const { isPerfEnabled } = await import('@/shared/lib/perf/config');
    expect(isPerfEnabled()).toBe(false);
  });

  it('returns true when AGIRITY_PERF is "true"', async () => {
    process.env.AGIRITY_PERF = 'true';
    const { isPerfEnabled } = await import('@/shared/lib/perf/config');
    expect(isPerfEnabled()).toBe(true);
  });

  it('returns false when AGIRITY_PERF is "false"', async () => {
    process.env.AGIRITY_PERF = 'false';
    const { isPerfEnabled } = await import('@/shared/lib/perf/config');
    expect(isPerfEnabled()).toBe(false);
  });
});
