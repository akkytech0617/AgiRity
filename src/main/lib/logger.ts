/**
 * Main process logger initialization and configuration
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
import { initSentryMain, captureException, sendLog, captureIssue } from './sentry';

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function archiveLogAsync(file: { toString(): string }): Promise<void> {
  const filePath = file.toString();
  const info = path.parse(filePath);

  try {
    for (let i = FILE_ROTATION.maxFiles - 1; i >= 1; i--) {
      const oldPath = path.join(info.dir, `${info.name}.${String(i)}${info.ext}`);
      const newPath = path.join(info.dir, `${info.name}.${String(i + 1)}${info.ext}`);

      if (await fileExists(oldPath)) {
        if (i === FILE_ROTATION.maxFiles - 1) {
          await fs.unlink(oldPath);
        } else {
          await fs.rename(oldPath, newPath);
        }
      }
    }
    await fs.rename(filePath, path.join(info.dir, `${info.name}.1${info.ext}`));
  } catch {
    // Log rotation failed
  }
}

function archiveLog(file: { toString(): string }): void {
  setImmediate(() => {
    archiveLogAsync(file).catch(() => {
      // Silently ignore rotation errors
    });
  });
}

/**
 * Initialize logging for the main process
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

  // Initialize Sentry
  initSentryMain();

  // Error handler
  logger.errorHandler.startCatching({
    showDialog: !dev,
    onError: ({ error }) => {
      captureException(error, { processType: 'main' });
    },
  });

  // Send logs to Sentry
  logger.hooks.push((message, transport) => {
    if (transport !== logger.transports.file) {
      return message;
    }

    const { level, data } = message;
    const logMessage = data.map((d) => (typeof d === 'string' ? d : JSON.stringify(d))).join(' ');

    // All logs → Sentry Logs
    if (level === 'error' || level === 'warn' || level === 'info' || level === 'debug') {
      sendLog(logMessage, level, { processType: 'main' });
    }

    // error/warn → Sentry Issues
    if (level === 'error') {
      captureIssue(logMessage, 'error', { processType: 'main' });
    } else if (level === 'warn') {
      captureIssue(logMessage, 'warning', { processType: 'main' });
    }

    return message;
  });

  return logger;
}

export { default as log } from 'electron-log/main';
