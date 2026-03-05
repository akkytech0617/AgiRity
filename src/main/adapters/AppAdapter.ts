import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { readFile, unlink } from 'node:fs/promises';
import https from 'node:https';
import type { IncomingMessage } from 'node:http';
import { isIP } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { IAppAdapter } from './interfaces';

const EXTERNAL_COMMAND_TIMEOUT = 10000;
const FAVICON_FETCH_TIMEOUT = 5000;
const MAX_FAVICON_REDIRECTS = 2;
const MAX_FAVICON_BYTES = 512 * 1024;
const ALLOW_EXTERNAL_FAVICONS = process.env.AGIRITY_ALLOW_EXTERNAL_FAVICONS === 'true';

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
      execFile(
        '/usr/libexec/PlistBuddy',
        ['-c', `Print :${key}`, plistPath],
        { timeout: EXTERNAL_COMMAND_TIMEOUT },
        (error, stdout) => {
          if (error) {
            reject(new Error(`Failed to read ${key} from plist: ${error.message}`));
            return;
          }
          resolve(stdout.trim());
        }
      );
    });
  }

  private runSips(icnsPath: string, outputPath: string, size: number): Promise<void> {
    return new Promise((resolve, reject) => {
      execFile(
        '/usr/bin/sips',
        ['-s', 'format', 'png', '-z', String(size), String(size), icnsPath, '--out', outputPath],
        { timeout: EXTERNAL_COMMAND_TIMEOUT },
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
    const parsedUrl = new URL(url);
    try {
      return await this.fetchUrl(
        `https://${parsedUrl.hostname}/favicon.ico`,
        parsedUrl.hostname,
        MAX_FAVICON_REDIRECTS
      );
    } catch (firstPartyError) {
      if (!ALLOW_EXTERNAL_FAVICONS) {
        throw new Error(
          `Failed to fetch first-party favicon for ${parsedUrl.hostname} and external favicon provider is disabled: ${firstPartyError instanceof Error ? firstPartyError.message : String(firstPartyError)}`
        );
      }
    }

    const thirdPartyUrl = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=${size}`;
    return this.fetchUrl(thirdPartyUrl, parsedUrl.hostname, MAX_FAVICON_REDIRECTS);
  }

  private async resolveAndValidate(url: string): Promise<{ parsed: URL; resolvedAddress: string }> {
    const parsed = new URL(url);

    if (parsed.protocol !== 'https:') {
      throw new Error(`Blocked non-HTTPS URL: ${parsed.hostname}`);
    }

    const blockedHostnames = ['localhost', '0.0.0.0'];
    if (blockedHostnames.includes(parsed.hostname.toLowerCase())) {
      throw new Error(`Blocked request to private hostname: ${parsed.hostname}`);
    }

    const results = await lookup(parsed.hostname, { all: true });
    for (const { address } of results) {
      if (this.isPrivateIp(address)) {
        throw new Error(`Blocked request to private IP: ${address} (${parsed.hostname})`);
      }
    }

    return { parsed, resolvedAddress: results[0].address };
  }

  private isPrivateIp(ip: string): boolean {
    const normalized = ip.toLowerCase();
    if (isIP(normalized) === 6) return this.isPrivateIpv6(normalized);
    return this.isPrivateIpv4(normalized);
  }

  private isPrivateIpv6(ip: string): boolean {
    if (ip === '::1' || ip === '::') return true;
    if (ip.startsWith('fc') || ip.startsWith('fd')) return true;
    if (/^fe[89ab]/.test(ip)) return true;
    if (ip.startsWith('::ffff:')) return this.isPrivateIp(ip.slice('::ffff:'.length));
    return false;
  }

  private isPrivateIpv4(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4) return false;

    if (parts[0] === 127) return true;
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts.every((p) => p === 0)) return true;

    return false;
  }

  private async fetchUrl(
    url: string,
    hostname: string,
    redirectsRemaining: number
  ): Promise<Buffer> {
    const { parsed, resolvedAddress } = await this.resolveAndValidate(url);

    return new Promise<Buffer>((resolve, reject) => {
      const request = https.get(
        {
          hostname: resolvedAddress,
          port: parsed.port || 443,
          path: `${parsed.pathname}${parsed.search}`,
          headers: { Host: parsed.hostname },
          servername: parsed.hostname,
          timeout: FAVICON_FETCH_TIMEOUT,
        },
        (response: IncomingMessage) => {
          if (this.isRedirect(response)) {
            if (redirectsRemaining <= 0) {
              response.resume();
              reject(new Error(`Too many favicon redirects for ${hostname}`));
              return;
            }

            const nextUrl = new URL(response.headers.location ?? '', url).toString();
            response.resume();
            this.fetchUrl(nextUrl, hostname, redirectsRemaining - 1)
              .then(resolve)
              .catch(reject);
            return;
          }

          if (response.statusCode && response.statusCode >= 400) {
            response.resume();
            reject(
              new Error(`Failed to fetch favicon for ${hostname}: HTTP ${response.statusCode}`)
            );
            return;
          }

          const chunks: Buffer[] = [];
          let totalBytes = 0;
          response.on('data', (chunk: Buffer) => {
            totalBytes += chunk.length;
            if (totalBytes > MAX_FAVICON_BYTES) {
              response.resume();
              request.destroy(new Error(`Favicon too large for ${hostname}`));
              return;
            }
            chunks.push(chunk);
          });
          response.on('end', () => {
            const buffer = Buffer.concat(chunks);
            if (buffer.length === 0) {
              reject(new Error(`Empty favicon response for ${hostname}`));
              return;
            }
            resolve(buffer);
          });
          response.on('error', (error: Error) => {
            reject(new Error(`Failed to fetch favicon for ${hostname}: ${error.message}`));
          });
        }
      );

      request.setTimeout(FAVICON_FETCH_TIMEOUT, () => {
        request.destroy(new Error(`Timeout fetching favicon for ${hostname}`));
      });

      request.on('error', (error: Error) => {
        reject(new Error(`Failed to fetch favicon for ${hostname}: ${error.message}`));
      });
    });
  }

  private isRedirect(response: IncomingMessage): boolean {
    return (
      response.statusCode != null &&
      response.statusCode >= 300 &&
      response.statusCode < 400 &&
      typeof response.headers.location === 'string'
    );
  }
}
