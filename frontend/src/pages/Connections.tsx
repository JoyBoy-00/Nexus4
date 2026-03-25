import { FC, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';
import useConnections from '../hooks/useConnections';
import { useNotification } from '@/contexts/NotificationContext';
import ConnectionsTable from './Connections/components/ConnectionsTable';
import ConnectionsHeader from './Connections/components/ConnectionsHeader';
import ConnectionsFilters from './Connections/components/ConnectionsFilters';
import { buildProfilePath } from '@/utils/profileRoute';

const Connections: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  const {
    connections,
    pendingReceived,
    pendingSent,
    suggestions,
    stats,
    loading: connectionsLoading,
    error: connectionsError,
    fetchAll,
    respondToRequest,
    sendRequest,
    removeConnection,
    cancelConnection,
  } = useConnections();

  useEffect(() => {
    const filters = {
      page: page + 1,
      limit: rowsPerPage,
      role:
        roleFilter && roleFilter !== ''
          ? (roleFilter as 'STUDENT' | 'ALUM' | 'ADMIN')
          : undefined,
      search: searchTerm || undefined,
    };

    fetchAll(filters);
  }, [page, rowsPerPage, roleFilter, searchTerm, fetchAll]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0); // Reset pagination when switching tabs
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(0); // Reset to first page when searching
  };

  const handleRoleFilterChange = (event: SelectChangeEvent<string>) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return 'primary';
      case 'ALUM':
        return 'secondary';
      case 'ADMIN':
        return 'error';
      default:
        return 'default';
    }
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' = 'success'
  ) => {
    showNotification?.(message, severity);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const success = await respondToRequest(requestId, 'ACCEPTED');
      if (success) {
        showSnackbar('Connection request accepted successfully!', 'success');
        await fetchAll({
          page: page + 1,
          limit: rowsPerPage,
          role: roleFilter
            ? (roleFilter as 'STUDENT' | 'ALUM' | 'ADMIN')
            : undefined,
          search: searchTerm,
        });
      }
    } catch {
      showSnackbar('Failed to accept connection request', 'error');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const success = await respondToRequest(requestId, 'REJECTED');
      if (success) {
        showSnackbar('Connection request rejected', 'info');
        await fetchAll({
          page: page + 1,
          limit: rowsPerPage,
          role: roleFilter
            ? (roleFilter as 'STUDENT' | 'ALUM' | 'ADMIN')
            : undefined,
          search: searchTerm,
        });
      }
    } catch {
      showSnackbar('Failed to reject connection request', 'error');
    }
  };

  const handleCancelRequest = async (connectionId: string) => {
    try {
      const success = await cancelConnection(connectionId);
      if (success) {
        showSnackbar('Connection request cancelled', 'info');
        await fetchAll({
          page: page + 1,
          limit: rowsPerPage,
          role: roleFilter
            ? (roleFilter as 'STUDENT' | 'ALUM' | 'ADMIN')
            : undefined,
          search: searchTerm,
        });
      }
    } catch {
      showSnackbar('Failed to cancel connection request', 'error');
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      const success = await sendRequest(userId);
      if (success) {
        showSnackbar('Connection request sent!', 'success');
        // Remove from suggestions and refresh data
        await fetchAll({
          page: page + 1,
          limit: rowsPerPage,
          role: roleFilter
            ? (roleFilter as 'STUDENT' | 'ALUM' | 'ADMIN')
            : undefined,
          search: searchTerm,
        });
      }
    } catch (err: unknown) {
      // Extract user-friendly error message from axios error response
      let errorMessage = 'Failed to send connection request';

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      // Handle specific error cases with appropriate messages
      if (
        errorMessage.toLowerCase().includes('already pending') ||
        errorMessage.toLowerCase().includes('pending')
      ) {
        showSnackbar('Connection request is already pending', 'info');
        // Refresh to update the UI
        await fetchAll({
          page: page + 1,
          limit: rowsPerPage,
          role: roleFilter
            ? (roleFilter as 'STUDENT' | 'ALUM' | 'ADMIN')
            : undefined,
          search: searchTerm,
        });
      } else if (
        errorMessage.toLowerCase().includes('already connected') ||
        errorMessage.toLowerCase().includes('connected')
      ) {
        showSnackbar('You are already connected with this user', 'info');
        // Refresh to update the UI
        await fetchAll({
          page: page + 1,
          limit: rowsPerPage,
          role: roleFilter
            ? (roleFilter as 'STUDENT' | 'ALUM' | 'ADMIN')
            : undefined,
          search: searchTerm,
        });
      } else if (errorMessage.toLowerCase().includes('blocked')) {
        showSnackbar('This connection is blocked', 'error');
      } else if (errorMessage.toLowerCase().includes('yourself')) {
        showSnackbar('Cannot connect to yourself', 'error');
      } else {
        showSnackbar(errorMessage, 'error');
      }
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Remove Connection',
      message:
        'Are you sure you want to remove this connection? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        try {
          const success = await removeConnection(connectionId);
          if (success) {
            showSnackbar('Connection removed successfully', 'info');
            await fetchAll({
              page: page + 1,
              limit: rowsPerPage,
              role: roleFilter
                ? (roleFilter as 'STUDENT' | 'ALUM' | 'ADMIN')
                : undefined,
              search: searchTerm,
            });
          }
        } catch {
          showSnackbar('Failed to remove connection', 'error');
        }
      },
    });
  };

  const handleRefresh = async () => {
    await fetchAll({
      page: page + 1,
      limit: rowsPerPage,
      role: roleFilter
        ? (roleFilter as 'STUDENT' | 'ALUM' | 'ADMIN')
        : undefined,
      search: searchTerm,
    });
    showSnackbar('Connections refreshed', 'success');
  };

  const handleSendMessage = (userId: string) => {
    // Navigate to messages page with user ID to auto-start conversation
    if (userId) {
      navigate(`/messages?user=${userId}`);
    }
  };

  const handleViewProfile = (userId: string, userName?: string) => {
    navigate(
      buildProfilePath({
        id: userId,
        name: userName,
      })
    );
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCurrentData = () => {
    switch (tabValue) {
      case 0:
        return connections;
      case 1:
        return pendingReceived;
      case 2:
        return pendingSent;
      case 3:
        return suggestions;
      default:
        return [];
    }
  };

  const getTableHeaders = () => {
    switch (tabValue) {
      case 0:
        return ['User', 'Role', 'Status', 'Connected', 'Actions'];
      case 1:
        return ['Requester', 'Role', 'Requested', 'Actions'];
      case 2:
        return ['Recipient', 'Role', 'Sent', 'Status', 'Actions'];
      case 3:
        return ['User', 'Role', 'Match Details', 'Actions'];
      default:
        return [];
    }
  };

  if (connectionsLoading) {
    return (
      <Box
        className="w-full mx-auto"
        sx={{ py: 3, maxWidth: '1280px', px: { xs: 2, md: 3 } }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  if (connectionsError) {
    return (
      <Box
        className="w-full mx-auto"
        sx={{ py: 3, maxWidth: '1280px', px: { xs: 2, md: 3 } }}
      >
        <Alert severity="error" sx={{ mb: 3 }}>
          {connectionsError}
        </Alert>
      </Box>
    );
  }

  const currentData = getCurrentData();
  const paginatedData = currentData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box
      className="w-full mx-auto"
      sx={{ py: 4, maxWidth: '1280px', px: { xs: 2, md: 3 } }}
    >
      <ConnectionsHeader
        loading={connectionsLoading}
        onRefresh={handleRefresh}
        stats={stats}
      />

      <Divider sx={{ mb: 3 }} />

      <ConnectionsFilters
        searchTerm={searchTerm}
        roleFilter={roleFilter}
        onSearchTermChange={setSearchTerm}
        onRoleFilterChange={handleRoleFilterChange}
        onSubmit={handleSearch}
      />

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label={
              isMobile
                ? `All (${connections.length})`
                : `Connections (${connections.length})`
            }
          />
          <Tab
            label={
              isMobile
                ? `Incoming (${pendingReceived.length})`
                : `Pending Received (${pendingReceived.length})`
            }
          />
          <Tab
            label={
              isMobile
                ? `Sent (${pendingSent.length})`
                : `Pending Sent (${pendingSent.length})`
            }
          />
          <Tab
            label={
              isMobile
                ? `Suggestions (${suggestions.length})`
                : `Suggestions (${suggestions.length})`
            }
          />
        </Tabs>
      </Paper>

      <ConnectionsTable
        tabValue={tabValue}
        paginatedData={paginatedData}
        currentDataCount={currentData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        loading={connectionsLoading}
        getTableHeaders={getTableHeaders}
        getRoleColor={getRoleColor}
        onViewProfile={handleViewProfile}
        onSendMessage={handleSendMessage}
        onRemoveConnection={handleRemoveConnection}
        onAcceptRequest={handleAcceptRequest}
        onRejectRequest={handleRejectRequest}
        onCancelRequest={handleCancelRequest}
        onConnect={handleConnect}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            color="error"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Connections;
