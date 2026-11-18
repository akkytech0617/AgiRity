import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LaunchButton } from '@/renderer/components/workspace/LaunchButton';

describe('LaunchButton', () => {
  const defaultProps = {
    onLaunch: vi.fn(),
    isLaunching: false,
  };

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders "Launch →" text when idle', () => {
    render(<LaunchButton {...defaultProps} />);
    expect(screen.getByText('Launch →')).toBeInTheDocument();
  });

  it('calls onLaunch when clicked', async () => {
    const user = userEvent.setup();
    const onLaunch = vi.fn();
    render(<LaunchButton {...defaultProps} onLaunch={onLaunch} />);

    await user.click(screen.getByRole('button'));
    expect(onLaunch).toHaveBeenCalledTimes(1);
  });

  it('renders "Launching" when isLaunching is true', () => {
    const { rerender } = render(<LaunchButton {...defaultProps} />);
    expect(screen.getByText('Launch →')).toBeInTheDocument();

    rerender(<LaunchButton onLaunch={vi.fn()} isLaunching={true} />);

    expect(screen.getByText('Launching')).toBeInTheDocument();
  });

  it('returns to idle 2 seconds after each completed launch', () => {
    vi.useFakeTimers();
    const onLaunch = vi.fn();
    const { rerender } = render(<LaunchButton onLaunch={onLaunch} isLaunching={false} />);

    for (let cycle = 0; cycle < 2; cycle++) {
      rerender(<LaunchButton onLaunch={onLaunch} isLaunching={true} />);
      expect(screen.getByRole('button')).toHaveTextContent('Launching');
      expect(screen.getByRole('button')).toBeDisabled();

      rerender(<LaunchButton onLaunch={onLaunch} isLaunching={false} />);
      expect(screen.getByRole('button')).toHaveTextContent('Done');
      expect(screen.getByRole('button')).toBeDisabled();

      act(() => {
        vi.advanceTimersByTime(1999);
      });
      expect(screen.getByRole('button')).toHaveTextContent('Done');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByRole('button')).toHaveTextContent('Launch →');
      expect(screen.getByRole('button')).toBeEnabled();
    }
  });

  it('restarts the reset delay when a new launch finishes during the done state', () => {
    vi.useFakeTimers();
    const onLaunch = vi.fn();
    const { rerender } = render(<LaunchButton onLaunch={onLaunch} isLaunching={true} />);
    rerender(<LaunchButton onLaunch={onLaunch} isLaunching={false} />);
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    rerender(<LaunchButton onLaunch={onLaunch} isLaunching={true} />);
    rerender(<LaunchButton onLaunch={onLaunch} isLaunching={false} />);
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(screen.getByRole('button')).toHaveTextContent('Done');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole('button')).toHaveTextContent('Launch →');
  });
});
