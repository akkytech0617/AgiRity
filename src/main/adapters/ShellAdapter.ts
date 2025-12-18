import { shell } from 'electron';
import * as path from 'node:path';
import { spawn } from 'node:child_process';
import type { IShellAdapter, IOSAdapter } from './interfaces';

/**
 * Shell adapter wrapping Electron shell API
 * Provides cross-platform support for opening URLs and files
 */
export class ShellAdapter implements IShellAdapter {
  private readonly whitelistedProtocols = ['http:', 'https:', 'mailto:'];

  constructor(private readonly osAdapter: IOSAdapter) {}

  async openExternal(url: string): Promise<void> {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      throw new Error(`Invalid URL: ${url}`, { cause: error });
    }

    if (!this.whitelistedProtocols.includes(parsedUrl.protocol)) {
      throw new Error(`Disallowed protocol in URL: ${parsedUrl.protocol}`);
    }

    await shell.openExternal(url);
  }

  async openPath(pathValue: string): Promise<string> {
    const validatedPath = this.validatePath(pathValue);
    return shell.openPath(validatedPath);
  }

  async launchApp(appPath: string, args: string[] = []): Promise<void> {
    const validatedAppPath = this.validatePath(appPath);
    const validatedArgs = args.map((arg) => this.validatePath(arg));

    const child = spawn(validatedAppPath, validatedArgs, {
      detached: true,
      stdio: 'ignore',
    });

    child.unref();
    // Satisfy @typescript-eslint/require-await
    await Promise.resolve();
  }

  private validatePath(pathValue: string): string {
    // Basic check for shell metacharacters.
    if (/[;&$`<>|!]/.test(pathValue)) {
      throw new Error('Path contains invalid shell metacharacters.');
    }

    const resolvedPath = path.resolve(pathValue);
    const homeDir = this.osAdapter.homedir();

    // For security, enforce that paths must resolve to within the user's home directory.
    // This uses path.relative to prevent prefix-collision bypasses.
    const relative = path.relative(homeDir, resolvedPath);
    const isInsideHome = !relative.startsWith('..') && !path.isAbsolute(relative);

    if (!isInsideHome && resolvedPath !== homeDir) {
      throw new Error(`Path is outside the allowed directory: ${resolvedPath}`);
    }

    return resolvedPath;
  }
}
