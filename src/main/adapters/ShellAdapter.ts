import { shell } from 'electron';
import type { IShellAdapter } from './interfaces';

/**
 * Shell adapter wrapping Electron shell API
 * Provides cross-platform support for opening URLs and files
 */
export class ShellAdapter implements IShellAdapter {
  async openExternal(url: string): Promise<void> {
    await shell.openExternal(url);
  }

  async openPath(path: string): Promise<string> {
    return shell.openPath(path);
  }
}
