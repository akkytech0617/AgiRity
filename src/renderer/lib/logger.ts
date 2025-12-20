/**
 * Renderer process logger initialization and configuration
 * Uses electron-log for IPC-based logging to main process
 */

import log from 'electron-log/renderer';
import { initSentryRenderer, captureExceptionRenderer } from './sentry';

/**
 * Initialize logging for the renderer process
 * Should be called early in renderer/index.tsx
 */
export function initRendererLogger(): typeof log {
  // Set up error handler with Sentry integration
  log.errorHandler.startCatching({
    onError: ({ error }) => {
      void captureExceptionRenderer(error, { processType: 'renderer' });
    },
  });

  // Initialize Sentry (async, non-blocking)
  void initSentryRenderer();

  log.info('Renderer logger initialized');

  return log;
}

// Export the log instance for use throughout the renderer process
export { log };
