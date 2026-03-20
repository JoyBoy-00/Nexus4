import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  Email,
  LocationOn,
  School,
} from '@mui/icons-material';

export interface ProfilePreviewData {
  name?: string;
  email?: string;
  role?: string;
  bio?: string;
  location?: string;
  dept?: string;
  interests?: string;
  avatarUrl?: string;
  skills?: Array<{ name: string } | string>;
  user?: {
    name?: string;
    email?: string;
    role?: string;
    profile?: {
      bio?: string;
      location?: string;
      dept?: string;
      interests?: string;
      avatarUrl?: string;
      skills?: Array<{ name: string } | string>;
    };
  };
}

interface ProfilePreviewDialogProps {
  open: boolean;
  userId: string | null;
  loading: boolean;
  profile: ProfilePreviewData | null;
  onClose: () => void;
  onViewFullProfile: (userId: string) => void;
  getRoleColor: (role: string) => 'primary' | 'secondary' | 'error' | 'default';
}

const ProfilePreviewDialog = ({
  open,
  userId,
  loading,
  profile,
  onClose,
  onViewFullProfile,
  getRoleColor,
}: ProfilePreviewDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Profile</Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={4}
          >
            <CircularProgress />
          </Box>
        ) : profile ? (
          <Box>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mb={3}
            >
              <Avatar
                src={profile.avatarUrl || profile.user?.profile?.avatarUrl}
                sx={{
                  width: 100,
                  height: 100,
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                }}
              >
                {profile.name?.charAt(0) ||
                  profile.user?.name?.charAt(0) ||
                  '?'}
              </Avatar>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {profile.name || profile.user?.name || 'Unknown User'}
              </Typography>
              <Chip
                label={profile.role || profile.user?.role || 'Unknown'}
                color={getRoleColor(profile.role || profile.user?.role || '')}
                size="small"
                sx={{ mb: 1 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={2}>
              {profile.email || profile.user?.email ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2">
                    {profile.email || profile.user?.email}
                  </Typography>
                </Box>
              ) : null}

              {profile.bio || profile.user?.profile?.bio ? (
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Bio
                  </Typography>
                  <Typography variant="body2">
                    {profile.bio || profile.user?.profile?.bio}
                  </Typography>
                </Box>
              ) : null}

              {profile.location || profile.user?.profile?.location ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2">
                    {profile.location || profile.user?.profile?.location}
                  </Typography>
                </Box>
              ) : null}

              {profile.dept || profile.user?.profile?.dept ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <School fontSize="small" color="action" />
                  <Typography variant="body2">
                    {profile.dept || profile.user?.profile?.dept}
                  </Typography>
                </Box>
              ) : null}

              {profile.user?.profile?.skills &&
              profile.user.profile.skills.length > 0 ? (
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Skills
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {profile.user.profile.skills.map((skill, index: number) => (
                      <Chip
                        key={index}
                        label={typeof skill === 'string' ? skill : skill.name}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              ) : profile.skills && profile.skills.length > 0 ? (
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Skills
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {profile.skills.map((skill, index: number) => (
                      <Chip
                        key={index}
                        label={typeof skill === 'string' ? skill : skill.name}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              ) : null}

              {profile.interests || profile.user?.profile?.interests ? (
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Interests
                  </Typography>
                  <Typography variant="body2">
                    {profile.interests || profile.user?.profile?.interests}
                  </Typography>
                </Box>
              ) : null}
            </Stack>
          </Box>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              Failed to load profile information
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={() => userId && onViewFullProfile(userId)}
          variant="outlined"
          fullWidth
        >
          View Full Profile
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfilePreviewDialog;
