/**
 * Main process logger initialization and configuration
 * Uses electron-log for file and console output
 */

import logger from 'electron-log/main';
import path from 'node:path';
import fs from 'node:fs/promises';
import {
  isDevelopment,
  FILE_ROTATION,
  LOG_FORMAT,
  CONSOLE_FORMAT,
  LOG_FILE_NAMES,
} from '@/shared/lib/logging/config';
import { initSentryMain, captureExceptionMain } from './sentry';

/**
 * Check if a file exists using async fs.access
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Async implementation of log rotation
 * Keeps up to FILE_ROTATION.maxFiles rotated logs
 */
async function archiveLogAsync(file: { toString(): string }): Promise<void> {
  const filePath = file.toString();
  const info = path.parse(filePath);

  try {
    // Shift existing rotated files
    for (let i = FILE_ROTATION.maxFiles - 1; i >= 1; i--) {
      const oldPath = path.join(info.dir, `${info.name}.${String(i)}${info.ext}`);
      const newPath = path.join(info.dir, `${info.name}.${String(i + 1)}${info.ext}`);

      if (await fileExists(oldPath)) {
        if (i === FILE_ROTATION.maxFiles - 1) {
          await fs.unlink(oldPath); // Delete oldest
        } else {
          await fs.rename(oldPath, newPath);
        }
      }
    }

    // Rotate current log to .1
    await fs.rename(filePath, path.join(info.dir, `${info.name}.1${info.ext}`));
  } catch {
    // Log rotation failed, continue without rotation
  }
}

/**
 * Synchronous wrapper for archiveLogAsync to maintain compatibility with electron-log API
 * Uses setImmediate to avoid blocking and .catch() to prevent unhandled rejections
 */
function archiveLog(file: { toString(): string }): void {
  setImmediate(() => {
    archiveLogAsync(file).catch(() => {
      // Silently ignore errors - rotation is best-effort
    });
  });
}

/**
 * Initialize logging for the main process
 * Must be called before any other code in main/index.ts
 */
export function initMainLogger(): typeof logger {
  const dev = isDevelopment();

  // Configure file transport
  logger.transports.file.level = dev ? 'debug' : 'info';
  logger.transports.file.format = LOG_FORMAT;
  logger.transports.file.fileName = LOG_FILE_NAMES.main;
  logger.transports.file.maxSize = FILE_ROTATION.maxSize;
  logger.transports.file.archiveLogFn = archiveLog;

  // Configure console transport
  logger.transports.console.level = dev ? 'debug' : 'warn';
  logger.transports.console.format = CONSOLE_FORMAT;

  // Initialize for renderer process IPC
  logger.initialize({ spyRendererConsole: dev });

  // Set up error handler with Sentry integration
  logger.errorHandler.startCatching({
    showDialog: !dev,
    onError: ({ error }) => {
      void captureExceptionMain(error, { processType: 'main' });
      // Return undefined to allow default handling
    },
  });

  // Initialize Sentry (async, non-blocking)
  void initSentryMain();

  logger.info('Main process logger initialized', {
    environment: dev ? 'development' : 'production',
    logPath: logger.transports.file.getFile().path,
  });

  return logger;
}

// Export the log instance for use throughout the main process
export { default as log } from 'electron-log/main';
