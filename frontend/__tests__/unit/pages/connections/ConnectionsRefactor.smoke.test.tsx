import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ConnectionsHeader from '@/pages/Connections/components/ConnectionsHeader';
import ConnectionsFilters from '@/pages/Connections/components/ConnectionsFilters';
import ConnectionsTable from '@/pages/Connections/components/ConnectionsTable';

describe('Connections refactor smoke', () => {
  it('renders header component', () => {
    render(
      <ConnectionsHeader
        loading={false}
        onRefresh={vi.fn()}
        stats={{
          total: 4,
          byRole: { students: 2, alumni: 2 },
          pendingReceived: 1,
        }}
      />
    );

    expect(screen.getByText('Connections')).toBeInTheDocument();
  });

  it('renders filters component', () => {
    render(
      <ConnectionsFilters
        searchTerm=""
        roleFilter=""
        onSearchTermChange={vi.fn()}
        onRoleFilterChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(
      screen.getByPlaceholderText('Search connections...')
    ).toBeInTheDocument();
  });

  it('renders empty table state', () => {
    render(
      <ConnectionsTable
        tabValue={0}
        paginatedData={[]}
        currentDataCount={0}
        rowsPerPage={10}
        page={0}
        loading={false}
        getTableHeaders={() => [
          'User',
          'Role',
          'Status',
          'Connected',
          'Actions',
        ]}
        getRoleColor={() => 'default'}
        onViewProfile={vi.fn()}
        onSendMessage={vi.fn()}
        onRemoveConnection={vi.fn()}
        onAcceptRequest={vi.fn()}
        onRejectRequest={vi.fn()}
        onCancelRequest={vi.fn()}
        onConnect={vi.fn()}
        onChangePage={vi.fn()}
        onChangeRowsPerPage={vi.fn()}
      />
    );

    expect(screen.getByText('No connections yet')).toBeInTheDocument();
  });
});
