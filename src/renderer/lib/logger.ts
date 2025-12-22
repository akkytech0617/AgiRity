/**
 * Renderer process logger initialization and configuration
 * Uses electron-log for IPC-based logging to main process
 */

import logger from 'electron-log/renderer';
import { initSentryRenderer, captureExceptionRenderer, sendLogRenderer } from './sentry';

/**
 * Initialize logging for the renderer process
 * Should be called early in renderer/index.tsx
 */
export function initRendererLogger(): typeof logger {
  // Initialize Sentry first (synchronously, as early as possible)
  initSentryRenderer();

  // Set up error handler with Sentry integration
  logger.errorHandler.startCatching({
    onError: ({ error }) => {
      captureExceptionRenderer(error, { processType: 'renderer' });
    },
  });

  // すべてのログをSentry Logsに送信するフックを追加
  logger.hooks.push((message) => {
    const { level, data } = message;
    const logMessage = data.map((d) => (typeof d === 'string' ? d : JSON.stringify(d))).join(' ');

    // すべてのレベルのログをSentry Logsに送信
    if (level === 'error') {
      sendLogRenderer(logMessage, 'error', { level, processType: 'renderer' });
    } else if (level === 'warn') {
      sendLogRenderer(logMessage, 'warn', { level, processType: 'renderer' });
    } else if (level === 'info') {
      sendLogRenderer(logMessage, 'info', { level, processType: 'renderer' });
    } else if (level === 'debug') {
      sendLogRenderer(logMessage, 'debug', { level, processType: 'renderer' });
    }

    return message;
  });

  logger.info('Renderer logger initialized');

  return logger;
}

// Export the log instance for use throughout the renderer process
export { default as log } from 'electron-log/renderer';
