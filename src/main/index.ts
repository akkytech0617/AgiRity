import { app, BrowserWindow } from 'electron';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContainer } from './container';
import { setupIpcHandlers } from './ipc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js
// │ ├─┬ preload
// │ │ └── index.js
// │ └── renderer
// │     └── index.html

process.env.DIST_ELECTRON = path.join(__dirname, '../..');
process.env.DIST = path.join(process.env.DIST_ELECTRON, '../dist');
process.env.PUBLIC =
  process.env.VITE_DEV_SERVER_URL !== undefined && process.env.VITE_DEV_SERVER_URL !== ''
    ? path.join(process.env.DIST_ELECTRON, '../public')
    : process.env.DIST;

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, '../preload/preload.js');
const publicDir = process.env.PUBLIC || '';
// Note: vite-plugin-electron builds preload to dist-electron/preload/preload.js based on our config
// But wait, our config output is 'dist-electron/preload'. The input is 'src/main/preload.ts'.
// So it will be 'dist-electron/preload/preload.js' if the input filename is preserved,
// or index.js depending on rollup options.
// Let's check vite.config.ts again.
// We didn't specify entry file names, so it defaults.
// Usually vite-plugin-electron/simple handles this.
// Let's assume the standard output path for now, and if it fails, we'll debug.
// Actually, let's look at standard vite-plugin-electron templates.
// Usually: path.join(__dirname, '../preload/index.js') if we didn't name it preload.js explicitly.
// In vite.config.ts, input is 'src/main/preload.ts'.
// Let's point to '../preload/preload.js' assuming the file name is preserved or mapped.

const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = path.join(process.env.DIST, 'index.html');

async function createWindow() {
  win = new BrowserWindow({
    title: 'AgiRity',
    icon: path.join(publicDir, 'favicon.ico'),
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (url !== undefined && url !== '') {
    await win.loadURL(url);
    // win.webContents.openDevTools();
  } else {
    await win.loadFile(indexHtml);
  }
}

// Create service container and setup IPC handlers
const container = createContainer();
setupIpcHandlers(container);

await app.whenReady();
await createWindow();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow().catch((err: unknown) => {
      console.error('Failed to create window on activate:', err);
    });
  }
});
