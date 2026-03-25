import type { ChangeEvent, ReactNode } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
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
  useMediaQuery,
  useTheme,
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
import { ProfileNameLink } from '@/utils/ProfileNameLink';

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
  onViewProfile: (userId: string, userName?: string) => void;
  onSendMessage: (userId: string) => void;
  onRemoveConnection: (connectionId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onCancelRequest: (requestId: string) => void;
  onConnect: (userId: string) => void;
  onChangePage: (_event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => void;
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const renderUserCell = (
    user?: {
      id?: string;
      name?: string;
      profile?: { avatarUrl?: string };
    },
    meta?: ReactNode
  ) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ProfileNameLink
          user={{
            id: user?.id,
            name: user?.name,
            profile: { avatarUrl: user?.profile?.avatarUrl },
          }}
          showAvatar
          showRoleBadge={false}
          showYouBadge={false}
          variant="subtitle2"
        />
      </Box>
      {isMobile ? meta : null}
    </Box>
  );

  const getConnectionDate = (connection: Connection) => {
    const connectedAt =
      'connectedAt' in connection
        ? (connection as Connection & { connectedAt?: string }).connectedAt
        : undefined;

    return connectedAt || connection.createdAt
      ? new Date(connectedAt || connection.createdAt).toLocaleDateString()
      : 'N/A';
  };

  const getRequestedDate = (request: PendingRequest) => {
    const requestedAt =
      'requestedAt' in request
        ? (request as PendingRequest & { requestedAt?: string }).requestedAt
        : undefined;

    return requestedAt || request.createdAt
      ? new Date(requestedAt || request.createdAt).toLocaleDateString()
      : 'N/A';
  };

  const getSentDate = (request: PendingRequest) => {
    const sentAt =
      'sentAt' in request
        ? (request as PendingRequest & { sentAt?: string }).sentAt
        : undefined;

    return sentAt || request.createdAt
      ? new Date(sentAt || request.createdAt).toLocaleDateString()
      : 'N/A';
  };

  return (
    <Paper>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              {getTableHeaders().map((header, index) => (
                <TableCell
                  key={header}
                  sx={{
                    fontWeight: 600,
                    display:
                      isMobile &&
                      ((tabValue === 0 && [1, 2, 3].includes(index)) ||
                        (tabValue === 1 && [1, 2].includes(index)) ||
                        (tabValue === 2 && [1, 2, 3].includes(index)) ||
                        (tabValue === 3 && [1, 2].includes(index)))
                        ? 'none'
                        : 'table-cell',
                  }}
                >
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
                        {renderUserCell(
                          connection.user,
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 0.75,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Chip
                              label={connection.user?.role || 'Unknown'}
                              color={getRoleColor(connection.user?.role || '')}
                              size="small"
                            />
                            <Chip
                              label={connection.status}
                              color={
                                connection.status === 'ACCEPTED'
                                  ? 'success'
                                  : 'default'
                              }
                              size="small"
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Connected: {getConnectionDate(connection)}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                      >
                        <Chip
                          label={connection.user?.role || 'Unknown'}
                          color={getRoleColor(connection.user?.role || '')}
                          size="small"
                        />
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                      >
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
                      <TableCell
                        sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {getConnectionDate(connection)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            justifyContent: {
                              xs: 'flex-end',
                              sm: 'flex-start',
                            },
                          }}
                        >
                          <Tooltip title="View Profile">
                            <IconButton
                              size="small"
                              onClick={() =>
                                connection.user?.id &&
                                onViewProfile(
                                  connection.user.id,
                                  connection.user?.name
                                )
                              }
                              sx={{ color: 'primary.main' }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send Message">
                            <IconButton
                              size="small"
                              onClick={() => {
                                if (connection.user?.id) {
                                  onSendMessage(connection.user.id);
                                }
                              }}
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
                        {renderUserCell(
                          pendingRequest.requester,
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 0.75,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Chip
                              label={
                                pendingRequest.requester?.role || 'Unknown'
                              }
                              color={getRoleColor(
                                pendingRequest.requester?.role || ''
                              )}
                              size="small"
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Requested: {getRequestedDate(pendingRequest)}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                      >
                        <Chip
                          label={pendingRequest.requester?.role || 'Unknown'}
                          color={getRoleColor(
                            pendingRequest.requester?.role || ''
                          )}
                          size="small"
                        />
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {getRequestedDate(pendingRequest)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            flexDirection: { xs: 'column', sm: 'row' },
                            width: { xs: '100%', sm: 'auto' },
                          }}
                        >
                          <Button
                            size="small"
                            startIcon={<CheckIcon />}
                            onClick={() => onAcceptRequest(pendingRequest.id)}
                            variant="contained"
                            color="success"
                            sx={{
                              minWidth: { xs: '100%', sm: 'auto' },
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
                              minWidth: { xs: '100%', sm: 'auto' },
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
                        {renderUserCell(
                          pendingSent.recipient,
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 0.75,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Chip
                              label={pendingSent.recipient?.role || 'Unknown'}
                              color={getRoleColor(
                                pendingSent.recipient?.role || ''
                              )}
                              size="small"
                            />
                            <Chip
                              label="Pending"
                              color="warning"
                              size="small"
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Sent: {getSentDate(pendingSent)}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                      >
                        <Chip
                          label={pendingSent.recipient?.role || 'Unknown'}
                          color={getRoleColor(
                            pendingSent.recipient?.role || ''
                          )}
                          size="small"
                        />
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {getSentDate(pendingSent)}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                      >
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
                      {renderUserCell(
                        suggestion.user,
                        <Box
                          sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}
                        >
                          <Chip
                            label={suggestion.user?.role || 'Unknown'}
                            color={getRoleColor(suggestion.user?.role || '')}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Score: {suggestion.matchScore}%
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                    >
                      <Chip
                        label={suggestion.user?.role || 'Unknown'}
                        color={getRoleColor(suggestion.user?.role || '')}
                        size="small"
                      />
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                    >
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
                        <Button
                          size="small"
                          startIcon={<PersonAddIcon />}
                          onClick={() => onConnect(suggestion.user.id)}
                          variant="contained"
                          color="primary"
                          disabled={loading}
                          sx={{
                            minHeight: '32px',
                            minWidth: { xs: '100%', sm: 'auto' },
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
        sx={{
          '& .MuiTablePagination-toolbar': {
            flexWrap: 'wrap',
            gap: { xs: 1, sm: 0 },
            justifyContent: { xs: 'center', sm: 'space-between' },
          },
        }}
      />
    </Paper>
  );
};

export default ConnectionsTable;
