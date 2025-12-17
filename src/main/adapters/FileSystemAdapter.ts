import { promises as fs } from 'fs';
import type { IFileSystemAdapter } from './interfaces';

/**
 * File system adapter wrapping Node.js fs.promises
 */
export class FileSystemAdapter implements IFileSystemAdapter {
  async mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
    await fs.mkdir(path, options);
  }

  async readFile(path: string, encoding: BufferEncoding): Promise<string> {
    return fs.readFile(path, encoding);
  }

  async writeFile(path: string, content: string, encoding: BufferEncoding): Promise<void> {
    await fs.writeFile(path, content, encoding);
  }
}
