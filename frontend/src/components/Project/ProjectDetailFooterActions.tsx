import { Box, Button, DialogActions, useTheme } from '@mui/material';
import { Delete, TrendingUp, Update } from '@mui/icons-material';

interface ProjectDetailFooterActionsProps {
  isOwner: boolean;
  onRefresh: () => void;
  onOpenUpdate: () => void;
  onOpenDeleteConfirm: () => void;
  onClose: () => void;
}

export const ProjectDetailFooterActions = ({
  isOwner,
  onRefresh,
  onOpenUpdate,
  onOpenDeleteConfirm,
  onClose,
}: ProjectDetailFooterActionsProps) => {
  const theme = useTheme();

  return (
    <DialogActions
      sx={{
        justifyContent: 'space-between',
        p: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Button onClick={onRefresh} variant="outlined" startIcon={<TrendingUp />}>
        Refresh
      </Button>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {isOwner && (
          <>
            <Button
              onClick={onOpenUpdate}
              variant="contained"
              startIcon={<Update />}
            >
              Update Project
            </Button>
            <Button
              onClick={onOpenDeleteConfirm}
              variant="outlined"
              color="error"
              startIcon={<Delete />}
            >
              Delete
            </Button>
          </>
        )}
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </Box>
    </DialogActions>
  );
};
