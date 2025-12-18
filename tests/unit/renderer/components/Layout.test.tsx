import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Layout } from '@/renderer/components/Layout';
import type { Workspace } from '@/shared/types';

describe('Layout', () => {
  const mockWorkspaces: Workspace[] = [
    {
      id: '1',
      name: 'Test Workspace',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultProps = {
    workspaces: mockWorkspaces,
    header: {
      title: 'Test Header',
    },
    onSelectWorkspace: vi.fn(),
    onNewWorkspace: vi.fn(),
    onOpenSettings: vi.fn(),
    onOpenTools: vi.fn(),
    onOpenMCP: vi.fn(),
  };

  it('renders children', () => {
    render(
      <Layout {...defaultProps}>
        <div>Test Content</div>
      </Layout>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders header with title', () => {
    render(
      <Layout {...defaultProps}>
        <div>Test Content</div>
      </Layout>
    );
    expect(screen.getByText('Test Header')).toBeInTheDocument();
  });

  it('renders header with subtitle', () => {
    render(
      <Layout {...defaultProps} header={{ title: 'Test Header', subtitle: 'Test Subtitle' }}>
        <div>Test Content</div>
      </Layout>
    );
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });
});
