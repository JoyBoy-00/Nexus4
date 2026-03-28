import { describe, expect, it } from 'vitest';
import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PageAnnouncer from '@/components/a11y/PageAnnouncer';

describe('a11y: PageAnnouncer', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <PageAnnouncer routeTitleMap={{ '/': 'Home' }} />
      </MemoryRouter>
    );

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
