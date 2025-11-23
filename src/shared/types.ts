export interface WorkspaceItem {
  type: 'app' | 'browser' | 'folder';
  name: string;
  path?: string; // required for app, folder
  urls?: string[]; // required for browser
  folder?: string; // VS Code project folder
  waitTime?: number; // startup delay in seconds
  dependsOn?: string; // preceding item name
}

export interface Workspace {
  id: string; // UUID (v4)
  name: string;
  description?: string;
  items: WorkspaceItem[];
  tags?: string[];
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}
