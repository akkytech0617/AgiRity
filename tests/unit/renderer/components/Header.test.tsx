import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@/renderer/components/Header';

describe('Header', () => {
  it('renders title', () => {
    render(<Header title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<Header title="Test Title" subtitle="Test Subtitle" />);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<Header title="Test Title" />);
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
  });

  it('renders tags when provided', () => {
    render(<Header title="Test Title" tags={['tag1', 'tag2']} />);
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  it('renders edit button when showEditButton is true', () => {
    const onEdit = vi.fn();
    render(<Header title="Test Title" showEditButton={true} onEdit={onEdit} />);
    expect(screen.getByTitle('Edit')).toBeInTheDocument();
  });

  it('does not render edit button when showEditButton is false', () => {
    const onEdit = vi.fn();
    render(<Header title="Test Title" showEditButton={false} onEdit={onEdit} />);
    expect(screen.queryByTitle('Edit')).not.toBeInTheDocument();
  });

  it('does not render edit button when onEdit is not provided', () => {
    render(<Header title="Test Title" showEditButton={true} />);
    expect(screen.queryByTitle('Edit')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Header title="Test Title" showEditButton={true} onEdit={onEdit} />);

    const editButton = screen.getByTitle('Edit');
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
