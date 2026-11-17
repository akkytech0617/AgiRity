import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkspaceItem } from '@/shared/types';

const { getItemIcon } = vi.hoisted(() => ({ getItemIcon: vi.fn() }));

vi.mock('@/renderer/api', () => ({
  launcherApi: { launchItem: vi.fn(), getItemIcon },
  workspaceApi: {},
}));

import { LaunchItemCard } from '@/renderer/components/workspace/LaunchItemCard';

const item: WorkspaceItem = { type: 'app', name: 'VS Code', path: '/Applications/Code.app' };

describe('LaunchItemCard', () => {
  beforeEach(() => {
    getItemIcon.mockReturnValue(new Promise(() => {}));
  });

  it('exposes a native button named after the item', () => {
    render(<LaunchItemCard item={item} index={0} onLaunch={vi.fn()} />);

    const button = screen.getByRole('button', { name: 'Launch VS Code' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('launches with Enter and Space after keyboard focus', async () => {
    const user = userEvent.setup();
    const onLaunch = vi.fn();
    render(<LaunchItemCard item={item} index={0} onLaunch={onLaunch} />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Launch VS Code' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onLaunch).toHaveBeenCalledTimes(2);
    expect(onLaunch).toHaveBeenCalledWith(item);
  });

  it('stays operable while the item icon is loading', async () => {
    const user = userEvent.setup();
    const onLaunch = vi.fn();
    render(<LaunchItemCard item={item} index={0} onLaunch={onLaunch} />);

    await user.click(screen.getByRole('button', { name: 'Launch VS Code' }));

    expect(getItemIcon).toHaveBeenCalled();
    expect(onLaunch).toHaveBeenCalledTimes(1);
  });

  it('does not launch when disabled', async () => {
    const user = userEvent.setup();
    const onLaunch = vi.fn();
    render(<LaunchItemCard item={item} index={0} onLaunch={onLaunch} isDisabled />);

    const button = screen.getByRole('button', { name: 'Launch VS Code' });
    expect(button).toBeDisabled();
    await user.click(button);
    await user.tab();
    await user.keyboard('{Enter}');

    expect(onLaunch).not.toHaveBeenCalled();
  });

  it('is disabled when no launch handler is provided', () => {
    render(<LaunchItemCard item={item} index={0} />);

    expect(screen.getByRole('button', { name: 'Launch VS Code' })).toBeDisabled();
  });
});
