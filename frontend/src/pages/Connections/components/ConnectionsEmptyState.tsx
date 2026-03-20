import { Box, TableCell, TableRow, Typography } from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';

interface ConnectionsEmptyStateProps {
  tabValue: number;
  colSpan: number;
}

const ConnectionsEmptyState = ({
  tabValue,
  colSpan,
}: ConnectionsEmptyStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center' }}>
          <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {tabValue === 0 && 'No connections yet'}
            {tabValue === 1 && 'No pending requests'}
            {tabValue === 2 && 'No sent requests'}
            {tabValue === 3 && 'No suggestions available'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0 &&
              'Start connecting with others to build your network'}
            {tabValue === 1 && 'You have no pending connection requests'}
            {tabValue === 2 && 'You have not sent any connection requests'}
            {tabValue === 3 &&
              'Try updating your profile to get better suggestions'}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default ConnectionsEmptyState;
