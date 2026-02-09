export interface PerfMeasurement {
  name: string;
  startMark: string;
  endMark: string;
  durationMs: number;
}

export interface PerfMemorySnapshot {
  label: string;
  rss: number;
  heapUsed: number;
  heapTotal: number;
  timestamp: number;
}

export interface PerfReport {
  measurements: PerfMeasurement[];
  memorySnapshots: PerfMemorySnapshot[];
}

export interface IPerfTracker {
  mark(name: string): void;
  measure(name: string, startMark: string, endMark?: string): number;
  memorySnapshot(label: string): void;
  report(): PerfReport;
}

class PerfTrackerImpl implements IPerfTracker {
  private readonly marks = new Map<string, number>();
  private readonly measurements: PerfMeasurement[] = [];
  private readonly memorySnapshots: PerfMemorySnapshot[] = [];

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    if (start === undefined) {
      return -1;
    }

    const end = endMark !== undefined ? this.marks.get(endMark) : performance.now();
    if (end === undefined) {
      return -1;
    }

    const durationMs = Math.round((end - start) * 100) / 100;
    this.measurements.push({
      name,
      startMark,
      endMark: endMark ?? `${name}:end`,
      durationMs,
    });
    return durationMs;
  }

  memorySnapshot(label: string): void {
    if (typeof process === 'undefined' || typeof process.memoryUsage !== 'function') {
      // Renderer process: use performance.memory if available (Chromium only)
      const perfMemory = (
        performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }
      ).memory;
      if (perfMemory) {
        this.memorySnapshots.push({
          label,
          rss: 0,
          heapUsed: perfMemory.usedJSHeapSize,
          heapTotal: perfMemory.totalJSHeapSize,
          timestamp: Date.now(),
        });
      }
      return;
    }

    const mem = process.memoryUsage();
    this.memorySnapshots.push({
      label,
      rss: mem.rss,
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      timestamp: Date.now(),
    });
  }

  report(): PerfReport {
    return {
      measurements: [...this.measurements],
      memorySnapshots: [...this.memorySnapshots],
    };
  }
}

class NoopPerfTracker implements IPerfTracker {
  mark(): void {
    // intentionally empty: noop implementation
  }
  measure(): number {
    return -1;
  }
  memorySnapshot(): void {
    // intentionally empty: noop implementation
  }
  report(): PerfReport {
    return { measurements: [], memorySnapshots: [] };
  }
}

export const NOOP_TRACKER: IPerfTracker = new NoopPerfTracker();

export function createPerfTracker(): IPerfTracker {
  return new PerfTrackerImpl();
}
