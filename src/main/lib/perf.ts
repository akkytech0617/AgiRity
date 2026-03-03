import logger from 'electron-log/main';
import { isPerfEnabled } from '@/shared/lib/perf/config';
import {
  createPerfTracker,
  NOOP_TRACKER,
  type IPerfTracker,
  type PerfReport,
} from '@/shared/lib/perf/PerfTracker';

let tracker: IPerfTracker = NOOP_TRACKER;

export function initPerfTracker(): IPerfTracker {
  if (!isPerfEnabled()) {
    return NOOP_TRACKER;
  }

  tracker = createPerfTracker();
  tracker.mark('main:start');
  return tracker;
}

export function getMainPerfTracker(): IPerfTracker {
  return tracker;
}

function formatBytes(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024)}MB`;
}

export function printPerfReport(report: PerfReport): void {
  if (!isPerfEnabled()) {
    return;
  }

  logger.info('[perf] === AgiRity Performance Report ===');

  for (const m of report.measurements) {
    const indent = m.name.includes(':') && !m.name.startsWith('main:') ? '  ' : '';
    logger.info(`[perf] ${indent}${m.name} → ${String(m.durationMs)}ms`);
  }

  for (const snap of report.memorySnapshots) {
    logger.info(
      `[perf] memory:${snap.label} → RSS: ${formatBytes(snap.rss)}, Heap: ${formatBytes(snap.heapUsed)}/${formatBytes(snap.heapTotal)}`
    );
  }
}
