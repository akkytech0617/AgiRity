import { contextBridge, ipcRenderer } from 'electron';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listenerWrappers = new WeakMap<(...args: any[]) => void, (...args: any[]) => void>();

// --------- Expose some API to the Renderer process ---------
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
