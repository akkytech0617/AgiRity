/**
 * Logging configuration constants
 * Shared between main and renderer processes
 */

/**
 * Determines if the app is running in development mode
 */
export const isDevelopment = (): boolean => {
  return (
    process.env.NODE_ENV === 'development' ||
    (process.env.VITE_DEV_SERVER_URL !== undefined &&
      process.env.VITE_DEV_SERVER_URL !== '')
  );
};

/**
 * File rotation configuration
 * 5MB max size, 3 rotated files
 */
export const FILE_ROTATION = {
  maxSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 3,
} as const;

/**
 * Log format string for file transport
 * Format: [2024-01-15 10:30:45.123] [info] Message text
 */
export const LOG_FORMAT = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';

/**
 * Console log format (shorter for development)
 */
export const CONSOLE_FORMAT = '{h}:{i}:{s}.{ms} [{level}] {text}';

/**
 * Log file names
 */
export const LOG_FILE_NAMES = {
  main: 'main.log',
  renderer: 'renderer.log',
} as const;
