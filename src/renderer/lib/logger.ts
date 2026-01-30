/**
 * Renderer process logger initialization and configuration
 */

import logger from 'electron-log/renderer';
import { captureException, captureIssue, initSentryRenderer, sendLog } from './sentry';

/**
 * Initialize logging for the renderer process
 */
export function initRendererLogger(): typeof logger {
  // Initialize Sentry
  initSentryRenderer();

  // Error handler
  logger.errorHandler.startCatching({
    onError: ({ error }) => {
      captureException(error, { processType: 'renderer' });
    },
  });

  // Send logs to Sentry
  logger.hooks.push((message) => {
    const { level, data } = message;
    const logMessage = data.map((d) => (typeof d === 'string' ? d : JSON.stringify(d))).join(' ');

    // All logs → Sentry Logs
    if (level === 'error' || level === 'warn' || level === 'info' || level === 'debug') {
      sendLog(logMessage, level, { processType: 'renderer' });
    }

    // error/warn → Sentry Issues
    if (level === 'error') {
      captureIssue(logMessage, 'error', { processType: 'renderer' });
    } else if (level === 'warn') {
      captureIssue(logMessage, 'warning', { processType: 'renderer' });
    }

    return message;
  });

  return logger;
}

export { default as log } from 'electron-log/renderer';
