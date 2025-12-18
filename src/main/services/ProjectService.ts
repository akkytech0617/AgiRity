import * as yaml from 'js-yaml';
import { z } from 'zod';
import type { Workspace } from '../../shared/types';
import type { IFileSystemAdapter } from '../adapters/interfaces';
import type { IConfigService, IProjectService } from './interfaces';

const SCHEMA_VERSION = 1;

const WorkspaceItemSchema = z.object({
  type: z.enum(['app', 'browser', 'folder']),
  name: z.string(),
  category: z.string().optional(),
  path: z.string().optional(),
  urls: z.array(z.string()).optional(),
  folder: z.string().optional(),
  waitTime: z.number().optional(),
  dependsOn: z.string().optional(),
});

const WorkspacePresetSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  itemNames: z.array(z.string()),
});

const WorkspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  items: z.array(WorkspaceItemSchema),
  presets: z.array(WorkspacePresetSchema).optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const WorkspacesFileSchema = z.object({
  schemaVersion: z.number(),
  workspaces: z.array(WorkspaceSchema),
});

type WorkspacesFile = z.infer<typeof WorkspacesFileSchema>;

export class ProjectService implements IProjectService {
  constructor(
    private readonly configService: IConfigService,
    private readonly fsAdapter: IFileSystemAdapter
  ) {}

  async loadWorkspaces(): Promise<Workspace[]> {
    await this.configService.ensureConfigDir();
    const filePath = this.configService.getWorkspacesFilePath();

    try {
      const content = await this.fsAdapter.readFile(filePath, 'utf8');
      const parsed = yaml.load(content);
      const validated = WorkspacesFileSchema.parse(parsed);
      return validated.workspaces;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid workspace file format: ${error.message}`);
      }
      throw error;
    }
  }

  async getWorkspace(id: string): Promise<Workspace | null> {
    const workspaces = await this.loadWorkspaces();
    return workspaces.find((w) => w.id === id) ?? null;
  }

  async saveWorkspace(workspace: Workspace): Promise<void> {
    // Validate workspace before saving
    WorkspaceSchema.parse(workspace);

    const workspaces = await this.loadWorkspaces();
    const existingIndex = workspaces.findIndex((w) => w.id === workspace.id);

    if (existingIndex >= 0) {
      // eslint-disable-next-line security/detect-object-injection
      workspaces[existingIndex] = {
        ...workspace,
        updatedAt: new Date().toISOString(),
      };
    } else {
      workspaces.push({
        ...workspace,
        createdAt: workspace.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    await this.writeWorkspaces(workspaces);
  }

  async deleteWorkspace(id: string): Promise<boolean> {
    const workspaces = await this.loadWorkspaces();
    const filtered = workspaces.filter((w) => w.id !== id);

    if (filtered.length === workspaces.length) {
      return false;
    }

    await this.writeWorkspaces(filtered);
    return true;
  }

  private async writeWorkspaces(workspaces: Workspace[]): Promise<void> {
    await this.configService.ensureConfigDir();
    const filePath = this.configService.getWorkspacesFilePath();

    const data: WorkspacesFile = {
      schemaVersion: SCHEMA_VERSION,
      workspaces,
    };

    const content = yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });

    await this.fsAdapter.writeFile(filePath, content, 'utf8');
  }
}
