import { spawn } from 'child_process';
import { homedir } from 'os';
import { WorkspaceItem } from '../../shared/types';

export class LauncherService {
  async launchItem(item: WorkspaceItem): Promise<void> {
    switch (item.type) {
      case 'browser':
        await this.launchBrowser(item);
        break;
      case 'app':
        await this.launchApp(item);
        break;
      case 'folder':
        await this.launchFolder(item);
        break;
      default:
        throw new Error(`Unknown item type: ${(item as WorkspaceItem).type}`);
    }
  }

  private async launchBrowser(item: WorkspaceItem): Promise<void> {
    if (!item.urls || item.urls.length === 0) {
      throw new Error(`Browser item "${item.name}" has no URLs`);
    }

    for (const url of item.urls) {
      await this.openUrl(url);
    }
  }

  private async openUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn('open', [url], { detached: true, stdio: 'ignore' });
      
      child.on('error', (err) => {
        reject(new Error(`Failed to open URL: ${err.message}`));
      });

      child.unref();
      resolve();
    });
  }

  private async launchApp(item: WorkspaceItem): Promise<void> {
    if (!item.path) {
      throw new Error(`App item "${item.name}" has no path`);
    }

    return new Promise((resolve, reject) => {
      const args = ['-a', item.path!];
      
      // If folder is specified, open that folder with the app
      if (item.folder) {
        args.push(this.expandTilde(item.folder));
      }

      const child = spawn('open', args, { detached: true, stdio: 'ignore' });
      
      child.on('error', (err) => {
        reject(new Error(`Failed to launch app: ${err.message}`));
      });

      child.unref();
      resolve();
    });
  }

  private expandTilde(filePath: string): string {
    if (filePath.startsWith('~/')) {
      return filePath.replace('~', homedir());
    }
    return filePath;
  }

  private async launchFolder(item: WorkspaceItem): Promise<void> {
    if (!item.path) {
      throw new Error(`Folder item "${item.name}" has no path`);
    }

    return new Promise((resolve, reject) => {
      const folderPath = this.expandTilde(item.path!);
      const child = spawn('open', [folderPath], { detached: true, stdio: 'ignore' });
      
      child.on('error', (err) => {
        reject(new Error(`Failed to open folder: ${err.message}`));
      });

      child.unref();
      resolve();
    });
  }
}

export const launcherService = new LauncherService();
