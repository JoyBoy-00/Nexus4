import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Message as MessageIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import type {
  Connection,
  PendingRequest,
  ConnectionSuggestion,
} from '@/types/connections';
import ConnectionsEmptyState from './ConnectionsEmptyState';

export type ConnectionsRow = Connection | PendingRequest | ConnectionSuggestion;

interface ConnectionsTableProps {
  tabValue: number;
  paginatedData: ConnectionsRow[];
  currentDataCount: number;
  rowsPerPage: number;
  page: number;
  loading: boolean;
  getTableHeaders: () => string[];
  getRoleColor: (role: string) => 'primary' | 'secondary' | 'error' | 'default';
  onViewProfile: (userId: string) => void;
  onSendMessage: (userId: string) => void;
  onRemoveConnection: (connectionId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onCancelRequest: (requestId: string) => void;
  onConnect: (userId: string) => void;
  onChangePage: (_event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ConnectionsTable = ({
  tabValue,
  paginatedData,
  currentDataCount,
  rowsPerPage,
  page,
  loading,
  getTableHeaders,
  getRoleColor,
  onViewProfile,
  onSendMessage,
  onRemoveConnection,
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
  onConnect,
  onChangePage,
  onChangeRowsPerPage,
}: ConnectionsTableProps) => {
  return (
    <Paper>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              {getTableHeaders().map((header) => (
                <TableCell key={header} sx={{ fontWeight: 600 }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <ConnectionsEmptyState
                tabValue={tabValue}
                colSpan={getTableHeaders().length}
              />
            ) : (
              paginatedData.map((item: ConnectionsRow) => {
                if (tabValue === 0) {
                  const connection = item as Connection;
                  return (
                    <TableRow key={connection.id} hover>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                        >
                          <Avatar
                            sx={{ bgcolor: 'primary.main', cursor: 'pointer' }}
                            onClick={() =>
                              connection.user?.id &&
                              onViewProfile(connection.user.id)
                            }
                          >
                            {connection.user?.name?.charAt(0) || '?'}
                          </Avatar>
                          <Box>
                            <Link
                              component="button"
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                textDecoration: 'none',
                                cursor: 'pointer',
                              }}
                              onClick={() =>
                                connection.user?.id &&
                                onViewProfile(connection.user.id)
                              }
                            >
                              {connection.user?.name || 'Unknown User'}
                            </Link>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {connection.user?.email || 'No email'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={connection.user?.role || 'Unknown'}
                          color={getRoleColor(connection.user?.role || '')}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={connection.status}
                          color={
                            connection.status === 'ACCEPTED'
                              ? 'success'
                              : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {('connectedAt' in connection
                            ? (
                                connection as Connection & {
                                  connectedAt?: string;
                                }
                              ).connectedAt
                            : null) || connection.createdAt
                            ? new Date(
                                ('connectedAt' in connection
                                  ? (
                                      connection as Connection & {
                                        connectedAt?: string;
                                      }
                                    ).connectedAt
                                  : null) || connection.createdAt
                              ).toLocaleDateString()
                            : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Profile">
                            <IconButton
                              size="small"
                              onClick={() =>
                                connection.user?.id &&
                                onViewProfile(connection.user.id)
                              }
                              sx={{ color: 'primary.main' }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send Message">
                            <IconButton
                              size="small"
                              onClick={() => onSendMessage(connection.user?.id)}
                              sx={{ color: 'primary.main' }}
                            >
                              <MessageIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove Connection">
                            <IconButton
                              size="small"
                              onClick={() => onRemoveConnection(connection.id)}
                              sx={{ color: 'error.main' }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                }

                if (tabValue === 1) {
                  const pendingRequest = item as PendingRequest;
                  return (
                    <TableRow key={pendingRequest.id} hover>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: 'secondary.main',
                              cursor: 'pointer',
                            }}
                            onClick={() =>
                              pendingRequest.requester?.id &&
                              onViewProfile(pendingRequest.requester.id)
                            }
                          >
                            {pendingRequest.requester?.name?.charAt(0) || '?'}
                          </Avatar>
                          <Box>
                            <Link
                              component="button"
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                textDecoration: 'none',
                                cursor: 'pointer',
                              }}
                              onClick={() =>
                                pendingRequest.requester?.id &&
                                onViewProfile(pendingRequest.requester.id)
                              }
                            >
                              {pendingRequest.requester?.name || 'Unknown User'}
                            </Link>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {pendingRequest.requester?.email || 'No email'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pendingRequest.requester?.role || 'Unknown'}
                          color={getRoleColor(
                            pendingRequest.requester?.role || ''
                          )}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {('requestedAt' in pendingRequest
                            ? (
                                pendingRequest as PendingRequest & {
                                  requestedAt?: string;
                                }
                              ).requestedAt
                            : null) || pendingRequest.createdAt
                            ? new Date(
                                ('requestedAt' in pendingRequest
                                  ? (
                                      pendingRequest as PendingRequest & {
                                        requestedAt?: string;
                                      }
                                    ).requestedAt
                                  : null) || pendingRequest.createdAt
                              ).toLocaleDateString()
                            : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<CheckIcon />}
                            onClick={() => onAcceptRequest(pendingRequest.id)}
                            variant="contained"
                            color="success"
                            sx={{
                              minWidth: 'auto',
                              minHeight: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            startIcon={<CloseIcon />}
                            onClick={() => onRejectRequest(pendingRequest.id)}
                            variant="outlined"
                            color="error"
                            sx={{
                              minWidth: 'auto',
                              minHeight: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                }

                if (tabValue === 2) {
                  const pendingSent = item as PendingRequest;
                  return (
                    <TableRow key={pendingSent.id} hover>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                        >
                          <Avatar
                            sx={{ bgcolor: 'info.main', cursor: 'pointer' }}
                            onClick={() =>
                              pendingSent.recipient?.id &&
                              onViewProfile(pendingSent.recipient.id)
                            }
                          >
                            {pendingSent.recipient?.name?.charAt(0) || '?'}
                          </Avatar>
                          <Box>
                            <Link
                              component="button"
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                textDecoration: 'none',
                                cursor: 'pointer',
                              }}
                              onClick={() =>
                                pendingSent.recipient?.id &&
                                onViewProfile(pendingSent.recipient.id)
                              }
                            >
                              {pendingSent.recipient?.name || 'Unknown User'}
                            </Link>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {pendingSent.recipient?.email || 'No email'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pendingSent.recipient?.role || 'Unknown'}
                          color={getRoleColor(
                            pendingSent.recipient?.role || ''
                          )}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {('sentAt' in pendingSent
                            ? (
                                pendingSent as PendingRequest & {
                                  sentAt?: string;
                                }
                              ).sentAt
                            : null) || pendingSent.createdAt
                            ? new Date(
                                ('sentAt' in pendingSent
                                  ? (
                                      pendingSent as PendingRequest & {
                                        sentAt?: string;
                                      }
                                    ).sentAt
                                  : null) || pendingSent.createdAt
                              ).toLocaleDateString()
                            : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label="Pending" color="warning" size="small" />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Cancel Request">
                          <IconButton
                            size="small"
                            onClick={() => onCancelRequest(pendingSent.id)}
                            sx={{ color: 'error.main' }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                }

                const suggestion = item as ConnectionSuggestion;
                return (
                  <TableRow key={suggestion.user.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                      >
                        <Avatar
                          sx={{ bgcolor: 'success.main', cursor: 'pointer' }}
                          onClick={() =>
                            suggestion.user?.id &&
                            onViewProfile(suggestion.user.id)
                          }
                        >
                          {suggestion.user?.name?.charAt(0) || '?'}
                        </Avatar>
                        <Box>
                          <Link
                            component="button"
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              textDecoration: 'none',
                              cursor: 'pointer',
                            }}
                            onClick={() =>
                              suggestion.user?.id &&
                              onViewProfile(suggestion.user.id)
                            }
                          >
                            {suggestion.user?.name || 'Unknown User'}
                          </Link>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {suggestion.user?.email || 'No email'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={suggestion.user?.role || 'Unknown'}
                        color={getRoleColor(suggestion.user?.role || '')}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          <strong>Score: {suggestion.matchScore}%</strong>
                        </Typography>
                        {suggestion.reasons.length > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {suggestion.reasons.slice(0, 3).join(', ')}
                            {suggestion.reasons.length > 3 && '...'}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Profile">
                          <IconButton
                            size="small"
                            onClick={() =>
                              suggestion.user?.id &&
                              onViewProfile(suggestion.user.id)
                            }
                            sx={{ color: 'primary.main' }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Button
                          size="small"
                          startIcon={<PersonAddIcon />}
                          onClick={() => onConnect(suggestion.user.id)}
                          variant="contained"
                          color="primary"
                          disabled={loading}
                          sx={{
                            minHeight: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          Connect
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={currentDataCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
      />
    </Paper>
  );
};

export default ConnectionsTable;
