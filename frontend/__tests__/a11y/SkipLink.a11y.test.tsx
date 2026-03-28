import { describe, expect, it } from 'vitest';
import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SkipLink from '@/components/a11y/SkipLink';

describe('a11y: SkipLink', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <SkipLink />
      </MemoryRouter>
    );

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
