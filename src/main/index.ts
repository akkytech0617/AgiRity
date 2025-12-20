import { app, BrowserWindow } from 'electron';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initMainLogger, log } from './lib/logger';
import { createContainer } from './container';
import { setupIpcHandlers } from './ipc';

// Initialize logger first
initMainLogger();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Log startup
log.info('Electron process started (ESM)');
log.debug('__dirname:', __dirname);

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

log.debug('DIST_ELECTRON:', process.env.DIST_ELECTRON);
log.debug('DIST:', process.env.DIST);
log.debug('PUBLIC:', process.env.PUBLIC);

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, '../preload/preload.js');
log.debug('Preload path:', preload);

const publicDir = process.env.PUBLIC || '';
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = path.join(process.env.DIST, 'index.html');

log.debug('VITE_DEV_SERVER_URL:', url);
log.debug('indexHtml:', indexHtml);

async function createWindow() {
  log.info('Creating window...');
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
    log.info('Loading URL:', url);
    await win.loadURL(url);
  } else {
    log.info('Loading File:', indexHtml);
    await win.loadFile(indexHtml);
  }
  log.info('Window created successfully');
}

// Initialize container and handlers
const container = createContainer();
setupIpcHandlers(container);

// nosonar: Using promise chain instead of top-level await to prevent blocking Electron's main process startup
app
  .whenReady()
  .then(async () => {
    log.info('App ready, creating window...');
    await createWindow();
  })
  .catch((error: unknown) => {
    log.error('Failed to start application:', error);
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
      log.error('Failed to create window on activate:', err);
    });
  }
});
