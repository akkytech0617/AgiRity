import logger from 'electron-log/renderer';
import {
  createPerfTracker,
  NOOP_TRACKER,
  type IPerfTracker,
  type PerfReport,
} from '@/shared/lib/perf/PerfTracker';

const perfEnabled = import.meta.env.VITE_PERF === 'true';

let tracker: IPerfTracker = NOOP_TRACKER;

export function initRendererPerfTracker(): IPerfTracker {
  if (!perfEnabled) {
    return NOOP_TRACKER;
  }

  tracker = createPerfTracker();
  tracker.mark('renderer:start');
  return tracker;
}

export function getRendererPerfTracker(): IPerfTracker {
  return tracker;
}

function formatBytes(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024)}MB`;
}

export function printRendererPerfReport(report: PerfReport): void {
  if (!perfEnabled) {
    return;
  }

  logger.info('[perf] === Renderer Performance Report ===');

  for (const m of report.measurements) {
    const indent = m.name.includes(':') && !m.name.startsWith('renderer:') ? '  ' : '';
    logger.info(`[perf] ${indent}${m.name} → ${String(m.durationMs)}ms`);
  }

  for (const snap of report.memorySnapshots) {
    const rssInfo = snap.rss > 0 ? `RSS: ${formatBytes(snap.rss)}, ` : '';
    logger.info(
      `[perf] memory:${snap.label} → ${rssInfo}Heap: ${formatBytes(snap.heapUsed)}/${formatBytes(snap.heapTotal)}`
    );
  }
}
