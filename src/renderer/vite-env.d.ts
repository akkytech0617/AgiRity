/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_USE_MOCK_DATA?: string;
  }

  interface Window {
    ipcRenderer: {
      on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void;
      off: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void;
      send: (channel: string, ...args: unknown[]) => void;
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
    };
  }

  var ipcRenderer: Window['ipcRenderer'];
}

export {};
