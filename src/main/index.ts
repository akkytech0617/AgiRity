import { app, BrowserWindow } from 'electron';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContainer } from './container';
import { setupIpcHandlers } from './ipc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Explicitly log startup
console.log('Electron process started (ESM)');
console.log('__dirname:', __dirname);

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js
// │ ├─┬ preload
// │ │ └── index.js
// │ └── renderer
// │     └── index.html

process.env.DIST_ELECTRON = path.join(__dirname, '..');
process.env.DIST = path.join(process.env.DIST_ELECTRON, '../dist');
process.env.PUBLIC =
  process.env.VITE_DEV_SERVER_URL !== undefined && process.env.VITE_DEV_SERVER_URL !== ''
    ? path.join(process.env.DIST_ELECTRON, '../public')
    : process.env.DIST;

console.log('DIST_ELECTRON:', process.env.DIST_ELECTRON);
console.log('DIST:', process.env.DIST);
console.log('PUBLIC:', process.env.PUBLIC);

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, '../preload/preload.js');
console.log('Preload path:', preload);

const publicDir = process.env.PUBLIC || '';
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = path.join(process.env.DIST, 'index.html');

console.log('VITE_DEV_SERVER_URL:', url);
console.log('indexHtml:', indexHtml);

async function createWindow() {
  console.log('Creating window...');
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
    console.log('Loading URL:', url);
    await win.loadURL(url);
  } else {
    console.log('Loading File:', indexHtml);
    await win.loadFile(indexHtml);
  }
  console.log('Window created successfully');
}

// Initialize container and handlers
const container = createContainer();
setupIpcHandlers(container);

app
  .whenReady()
  .then(async () => {
    console.log('App ready, creating window...');
    await createWindow();
  })
  .catch((error: unknown) => {
    console.log('Failed to start application:', error);
    app.quit();
  });

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
