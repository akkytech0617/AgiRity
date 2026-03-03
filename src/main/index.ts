import 'dotenv/config';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow } from 'electron';
import { createContainer } from './container';
import { setupIpcHandlers } from './ipc';
import { initMainLogger, log } from './lib/logger';
import { getMainPerfTracker, initPerfTracker, printPerfReport } from './lib/perf';
import { flushSentry } from './lib/sentry';

// Initialize perf tracker first (before anything else)
const perf = initPerfTracker();

// Initialize logger first
initMainLogger();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Log startup
log.info('AgiRity started');

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

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, '../preload/preload.js');

const publicDir = process.env.PUBLIC || '';
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = path.join(process.env.DIST, 'index.html');

async function createWindow() {
  win = new BrowserWindow({
    title: 'AgiRity - Workspace Manager',
    icon: path.join(publicDir, 'favicon.ico'),
    minWidth: 640,
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (url !== undefined && url !== '') {
    await win.loadURL(url);
  } else {
    await win.loadFile(indexHtml);
  }
}

// Initialize container and handlers
perf.mark('container:start');
const container = createContainer();
perf.mark('container:end');
perf.measure('container:create', 'container:start', 'container:end');

perf.mark('ipc:start');
setupIpcHandlers(container);
perf.mark('ipc:end');
perf.measure('ipc:setup', 'ipc:start', 'ipc:end');

// nosonar: Using promise chain instead of top-level await to prevent blocking Electron's main process startup
perf.mark('app:whenReady:start');
app
  .whenReady()
  .then(async () => {
    perf.mark('app:whenReady:end');
    perf.measure('app:whenReady', 'app:whenReady:start', 'app:whenReady:end');

    perf.mark('window:start');
    await createWindow();
    perf.mark('window:end');
    perf.measure('window:create', 'window:start', 'window:end');

    perf.measure('main:startup', 'main:start');
    perf.memorySnapshot('main');
    printPerfReport(getMainPerfTracker().report());
  })
  .catch((error: unknown) => {
    log.error('Failed to start application:', error);
    app.quit();
  });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Sentryバッファをフラッシュしてから終了
    flushSentry(2000)
      .then(() => {
        app.quit();
      })
      .catch(() => {
        app.quit();
      });
  }
});

app.on('before-quit', () => {
  log.info('AgiRity shutting down');
  // アプリ終了前にSentryのログをフラッシュ
  flushSentry(2000).catch(() => {
    // フラッシュ失敗しても終了を続行
  });
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow().catch((err: unknown) => {
      log.error('Failed to create window on activate:', err);
    });
  }
});
