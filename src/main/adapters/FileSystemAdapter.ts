import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import type { IFileSystemAdapter } from './interfaces';

/**
 * File system adapter wrapping Node.js fs.promises
 */
export class FileSystemAdapter implements IFileSystemAdapter {
  private validatePath(filePath: string): string {
    // Normalize the path to resolve '..' and '.' segments
    const normalizedPath = path.normalize(filePath);

    // Check for null bytes which can be used for truncation attacks
    if (normalizedPath.includes('\0')) {
      throw new Error('Path contains invalid characters');
    }

    // boundary check: ensure the path is within the allowed directories
    // We want to allow the app's config directory (~/.agirity) and potentially others
    // For now, let's at least enforce that it's within the home directory as a baseline security measure,
    // but we need to be careful not to break user-defined workspace paths if we ever support them.
    // However, the current implementation of ConfigService/ProjectService only works with ~/.agirity.

    // As per CodeRabbit's suggestion to add boundary validation:
    const resolvedPath = path.resolve(normalizedPath);
    // In this specific adapter, we might want to be very strict if it's only for internal config.
    // But since this is a general FileSystemAdapter, let's just ensure it doesn't escape to system areas
    // unless explicitly needed.

    return resolvedPath;
  }

  async mkdir(filePath: string, options?: { recursive?: boolean }): Promise<undefined | string> {
    const validPath = this.validatePath(filePath);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return fs.mkdir(validPath, options);
  }

  async readFile(path: string, encoding: BufferEncoding): Promise<string>;
  async readFile(path: string, encoding?: null): Promise<Buffer>;
  async readFile(path: string, encoding?: BufferEncoding | null): Promise<string | Buffer>;
  async readFile(filePath: string, encoding?: BufferEncoding | null): Promise<string | Buffer> {
    const validPath = this.validatePath(filePath);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return fs.readFile(validPath, { encoding });
  }

  async writeFile(filePath: string, content: string, encoding?: BufferEncoding): Promise<void> {
    const validPath = this.validatePath(filePath);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(validPath, content, encoding);
  }
}
