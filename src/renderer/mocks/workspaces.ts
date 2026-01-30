import { Workspace } from '../../shared/types';

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: '1',
    name: 'AgiRity Development',
    description: 'Frontend & Electron setup environment',
    items: [
      { type: 'folder', name: 'Project Root', path: '~/workspace/AgiRity' },
      { type: 'app', name: 'VS Code', path: '/Applications/Visual Studio Code.app' },
      {
        type: 'app',
        name: 'Zed (Project)',
        path: '/Applications/Zed.app',
        folder: '~/workspace/tmp',
      },
      {
        type: 'app',
        name: 'Terminal',
        path: '/System/Applications/Utilities/Terminal.app',
        folder: '~/workspace/AgiRity',
      },
      { type: 'browser', name: 'Linear Board', urls: ['https://linear.app/'] },
      { type: 'app', name: 'Docker', path: '/Applications/Docker.app' },
      { type: 'browser', name: 'GitHub Repo', urls: ['https://github.com/agirity/agirity'] },
    ],
    presets: [
      {
        name: 'Full Development',
        description: 'Start everything for full stack dev',
        itemNames: ['Project Root', 'VS Code', 'Linear Board', 'Docker', 'GitHub Repo'],
      },
      {
        name: 'Code Only',
        description: 'Just editor and terminal',
        itemNames: ['Project Root', 'VS Code'],
      },
      {
        name: 'Review Mode',
        description: 'Browser tools for PR review',
        itemNames: ['Linear Board', 'GitHub Repo'],
      },
    ],
    tags: ['Dev', 'Electron'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Morning Routine',
    description: 'Check emails and calendar',
    items: [
      { type: 'app', name: 'Slack', path: '/Applications/Slack.app' },
      { type: 'browser', name: 'Outlook', urls: ['https://outlook.office.com'] },
    ],
    tags: ['Daily', 'Communication'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Design Work',
    description: 'Figma and reference sites',
    items: [
      { type: 'browser', name: 'Figma', urls: ['https://figma.com'] },
      { type: 'browser', name: 'Pinterest', urls: ['https://pinterest.com'] },
    ],
    tags: ['Design'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
