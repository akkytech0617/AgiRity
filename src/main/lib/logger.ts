/**
 * Main process logger initialization and configuration
 * Uses electron-log for file and console output
 */

import log from 'electron-log/main';
import path from 'node:path';
import fs from 'node:fs';
import {
  isDevelopment,
  FILE_ROTATION,
  LOG_FORMAT,
  CONSOLE_FORMAT,
  LOG_FILE_NAMES,
} from '@/shared/lib/logging/config';
import { initSentryMain, captureExceptionMain } from './sentry';

/**
 * Custom archive function for log rotation
 * Keeps up to FILE_ROTATION.maxFiles rotated logs
 */
function archiveLog(file: { toString(): string }): void {
  const filePath = file.toString();
  const info = path.parse(filePath);

  try {
    // Shift existing rotated files
    for (let i = FILE_ROTATION.maxFiles - 1; i >= 1; i--) {
      const oldPath = path.join(info.dir, `${info.name}.${String(i)}${info.ext}`);
      const newPath = path.join(info.dir, `${info.name}.${String(i + 1)}${info.ext}`);

      if (fs.existsSync(oldPath)) {
        if (i === FILE_ROTATION.maxFiles - 1) {
          fs.unlinkSync(oldPath); // Delete oldest
        } else {
          fs.renameSync(oldPath, newPath);
        }
      }
    }

    // Rotate current log to .1
    fs.renameSync(filePath, path.join(info.dir, `${info.name}.1${info.ext}`));
  } catch {
    // Log rotation failed, continue without rotation
  }
}

/**
 * Initialize logging for the main process
 * Must be called before any other code in main/index.ts
 */
export function initMainLogger(): typeof log {
  const dev = isDevelopment();

  // Configure file transport
  log.transports.file.level = dev ? 'debug' : 'info';
  log.transports.file.format = LOG_FORMAT;
  log.transports.file.fileName = LOG_FILE_NAMES.main;
  log.transports.file.maxSize = FILE_ROTATION.maxSize;
  log.transports.file.archiveLogFn = archiveLog;

  // Configure console transport
  log.transports.console.level = dev ? 'debug' : 'warn';
  log.transports.console.format = CONSOLE_FORMAT;

  // Initialize for renderer process IPC
  log.initialize({ spyRendererConsole: dev });

  // Set up error handler with Sentry integration
  log.errorHandler.startCatching({
    showDialog: !dev,
    onError: ({ error }) => {
      void captureExceptionMain(error, { processType: 'main' });
      // Return undefined to allow default handling
    },
  });

  // Initialize Sentry (async, non-blocking)
  void initSentryMain();

  log.info('Main process logger initialized', {
    environment: dev ? 'development' : 'production',
    logPath: log.transports.file.getFile().path,
  });

  return log;
}

// Export the log instance for use throughout the main process
export { log };
