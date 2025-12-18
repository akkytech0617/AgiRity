import { promises as fs } from 'fs';
import * as path from 'path';
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

    // Since we don't have a restricted base directory enforced here currently,
    // we primarily rely on normalization.
    // In a stricter environment, we would check if normalizedPath starts with a specific base.
    
    return normalizedPath;
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
