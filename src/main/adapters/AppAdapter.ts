import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { IAppAdapter } from './interfaces';

/**
 * Adapter for Electron app operations
 * Wraps Electron's app.getAppPath() API
 */
export class AppAdapter implements IAppAdapter {
  async getAppIconViaSips(appPath: string, size = 128): Promise<Buffer> {
    // 1. Read CFBundleIconFile from Info.plist
    const plistPath = join(appPath, 'Contents', 'Info.plist');
    const iconFileName = await this.readPlistValue(plistPath, 'CFBundleIconFile');

    // 2. Append .icns if needed
    const icnsFileName = iconFileName.endsWith('.icns') ? iconFileName : `${iconFileName}.icns`;
    const icnsPath = join(appPath, 'Contents', 'Resources', icnsFileName);

    // 3. Convert with sips to temp PNG
    const tmpPath = join(tmpdir(), `agirity-icon-${randomUUID()}.png`);
    try {
      await this.runSips(icnsPath, tmpPath, size);
      const pngBuffer = await readFile(tmpPath);
      return pngBuffer;
    } finally {
      // Clean up temp file
      await unlink(tmpPath).catch(() => {
        // Ignore cleanup errors - the file will be cleaned up by the OS
      });
    }
  }

  private readPlistValue(plistPath: string, key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile('/usr/libexec/PlistBuddy', ['-c', `Print :${key}`, plistPath], (error, stdout) => {
        if (error) {
          reject(new Error(`Failed to read ${key} from plist: ${error.message}`));
          return;
        }
        resolve(stdout.trim());
      });
    });
  }

  private runSips(icnsPath: string, outputPath: string, size: number): Promise<void> {
    return new Promise((resolve, reject) => {
      execFile(
        'sips',
        ['-s', 'format', 'png', '-z', String(size), String(size), icnsPath, '--out', outputPath],
        (error) => {
          if (error) {
            reject(new Error(`sips conversion failed: ${error.message}`));
            return;
          }
          resolve();
        }
      );
    });
  }

  async fetchFavicon(url: string, size = 128): Promise<Buffer> {
    const { default: https } = await import('node:https');

    const parsedUrl = new URL(url);
    const faviconApiUrl = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=${size}`;

    return new Promise<Buffer>((resolve, reject) => {
      const request = https.get(faviconApiUrl, (response) => {
        // Follow redirects
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          https.get(response.headers.location, (redirectResponse) => {
            const chunks: Buffer[] = [];
            redirectResponse.on('data', (chunk: Buffer) => {
              chunks.push(chunk);
            });
            redirectResponse.on('end', () => {
              const buffer = Buffer.concat(chunks);
              if (buffer.length === 0) {
                reject(new Error(`Empty favicon response for ${parsedUrl.hostname}`));
                return;
              }
              resolve(buffer);
            });
            redirectResponse.on('error', (err: Error) => {
              reject(new Error(`Failed to fetch favicon: ${err.message}`));
            });
          });
          return;
        }

        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (buffer.length === 0) {
            reject(new Error(`Empty favicon response for ${parsedUrl.hostname}`));
            return;
          }
          resolve(buffer);
        });
        response.on('error', (err: Error) => {
          reject(new Error(`Failed to fetch favicon: ${err.message}`));
        });
      });

      request.on('error', (error: Error) => {
        reject(new Error(`Failed to fetch favicon for ${parsedUrl.hostname}: ${error.message}`));
      });
    });
  }
}
