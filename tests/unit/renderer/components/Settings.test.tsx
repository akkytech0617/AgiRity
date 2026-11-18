import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Settings } from '@/renderer/components/Settings';
import { findLightOnlyElements } from '../theme-helpers';

describe('Settings', () => {
  it('renders the settings heading', () => {
    render(<Settings />);
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });

  it('uses dark theme surfaces and text', () => {
    const { container } = render(<Settings />);
    expect(findLightOnlyElements(container)).toEqual([]);
  });
});
