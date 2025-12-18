import { promises as fs } from 'fs';
import type { IFileSystemAdapter } from './interfaces';

/**
 * File system adapter wrapping Node.js fs.promises
 */
export class FileSystemAdapter implements IFileSystemAdapter {
  async mkdir(path: string, options?: { recursive?: boolean }): Promise<undefined | string> {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return fs.mkdir(path, options);
  }

  async readFile(path: string, encoding?: BufferEncoding): Promise<string | Buffer> {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return fs.readFile(path, { encoding });
  }

  async writeFile(path: string, content: string, encoding?: BufferEncoding): Promise<void> {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(path, content, encoding);
  }
}
