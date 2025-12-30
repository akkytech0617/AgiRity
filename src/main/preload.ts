import '@sentry/electron/preload';
import { contextBridge, ipcRenderer } from 'electron';
import { WorkspaceItem, Workspace, IPC_CHANNELS } from '../shared/types';

// --------- Expose Scoped APIs to the Renderer process ---------

const launcherApi = {
  launchItem: (item: WorkspaceItem) => ipcRenderer.invoke(IPC_CHANNELS.LAUNCHER_LAUNCH_ITEM, item),
  getItemIcon: (item: WorkspaceItem) =>
    ipcRenderer.invoke(IPC_CHANNELS.LAUNCHER_GET_ITEM_ICON, item),
};

const workspaceApi = {
  load: () => ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_LOAD),
  get: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_GET, id),
  save: (workspace: Workspace) => ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_SAVE, workspace),
  delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_DELETE, id),
};

contextBridge.exposeInMainWorld('launcherApi', launcherApi);
contextBridge.exposeInMainWorld('workspaceApi', workspaceApi);

// Keep legacy for now, but mark as deprecated or for removal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listenerWrappers = new WeakMap<(...args: any[]) => void, (...args: any[]) => void>();

contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    const wrapper = (
      event: Electron.IpcRendererEvent,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...rest: any[]
    ) => {
      listener(event, ...rest);
    };
    listenerWrappers.set(listener, wrapper);
    return ipcRenderer.on(channel, wrapper);
  },

  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, listener] = args;
    const wrapper = listenerWrappers.get(listener);
    if (wrapper) {
      const result = ipcRenderer.off(channel, wrapper);
      listenerWrappers.delete(listener);
      return result;
    }
    return ipcRenderer.off(channel, listener);
  },

  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...rest] = args;
    ipcRenderer.send(channel, ...rest);
  },

  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...rest] = args;
    return ipcRenderer.invoke(channel, ...rest);
  },
});
