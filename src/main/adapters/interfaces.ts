/**
 * Adapter interfaces for external dependencies
 * These interfaces allow for easy mocking in tests
 */

/**
 * File system operations adapter
 * Wraps Node.js fs.promises API
 */
export interface IFileSystemAdapter {
  mkdir(path: string, options?: { recursive?: boolean }): Promise<undefined | string>;
  readFile(path: string, encoding?: BufferEncoding): Promise<string | Buffer>;
  writeFile(path: string, content: string, encoding?: BufferEncoding): Promise<void>;
}

/**
 * OS operations adapter
 * Wraps Node.js os module
 */
export interface IOSAdapter {
  homedir(): string;
}

/**
 * Shell operations adapter
 * Wraps Electron shell API for cross-platform support
 */
export interface IShellAdapter {
  /**
   * Open a URL in the default browser or an app with a protocol handler
   */
  openExternal(url: string): Promise<void>;

  /**
   * Open a file or folder in the default application
   * @returns Error message if failed, empty string if successful
   */
  openPath(path: string): Promise<string>;
}
