import {
  Block as BlockIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';

interface ConnectionsHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  stats: {
    total: number;
    byRole: { students: number; alumni: number };
    pendingReceived: number;
  } | null;
}

const ConnectionsHeader = ({
  loading,
  onRefresh,
  stats,
}: ConnectionsHeaderProps) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, md: 2.5 },
        mb: 3,
        borderRadius: 2.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box>
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: 700 }}
          gutterBottom
        >
          Connections
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage and grow your professional network
        </Typography>
      </Box>
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={onRefresh}
        disabled={loading}
        sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
      >
        Refresh
      </Button>

      {stats && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Chip
            size="small"
            icon={<PeopleIcon />}
            label={`${stats.total} Total`}
            variant="outlined"
          />
          <Chip
            size="small"
            icon={<SchoolIcon />}
            label={`${stats.byRole.students} Students`}
            variant="outlined"
          />
          <Chip
            size="small"
            icon={<WorkIcon />}
            label={`${stats.byRole.alumni} Alumni`}
            variant="outlined"
          />
          <Chip
            size="small"
            icon={<BlockIcon />}
            label={`${stats.pendingReceived} Pending`}
            variant="outlined"
          />
        </Stack>
      )}
    </Paper>
  );
};

export default ConnectionsHeader;
