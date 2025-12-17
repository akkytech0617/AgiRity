import type { WorkspaceItem } from '../../shared/types';
import type { IOSAdapter, IShellAdapter } from '../adapters/interfaces';
import type { ILauncherService } from './interfaces';

export class LauncherService implements ILauncherService {
  constructor(
    private readonly osAdapter: IOSAdapter,
    private readonly shellAdapter: IShellAdapter
  ) {}

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
      await this.shellAdapter.openExternal(url);
    }
  }

  private async launchApp(item: WorkspaceItem): Promise<void> {
    if (!item.path) {
      throw new Error(`App item "${item.name}" has no path`);
    }

    // If folder is specified, open the folder with the app
    // Otherwise, just open the app
    const targetPath = item.folder ? this.expandTilde(item.folder) : item.path;

    // For apps, we use openExternal with file:// protocol for the app bundle
    // or openPath for opening a folder with the default app
    if (item.folder) {
      // Open folder - this will use the OS default or the app associated with folders
      const error = await this.shellAdapter.openPath(targetPath);
      if (error) {
        throw new Error(`Failed to open folder with app: ${error}`);
      }
    } else {
      // Open the app itself
      const error = await this.shellAdapter.openPath(item.path);
      if (error) {
        throw new Error(`Failed to launch app: ${error}`);
      }
    }
  }

  private async launchFolder(item: WorkspaceItem): Promise<void> {
    if (!item.path) {
      throw new Error(`Folder item "${item.name}" has no path`);
    }

    const folderPath = this.expandTilde(item.path);
    const error = await this.shellAdapter.openPath(folderPath);
    if (error) {
      throw new Error(`Failed to open folder: ${error}`);
    }
  }

  private expandTilde(filePath: string): string {
    if (filePath.startsWith('~/')) {
      return filePath.replace('~', this.osAdapter.homedir());
    }
    return filePath;
  }
}
