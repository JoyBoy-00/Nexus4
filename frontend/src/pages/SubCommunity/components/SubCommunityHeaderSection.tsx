import { MouseEvent } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add,
  Article,
  ArrowBack,
  ExitToApp,
  Lock,
  People,
  Public,
  Refresh,
  Settings,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { ProfileNameLink } from '@/utils/ProfileNameLink';
import { SubCommunity, SubCommunityRole } from '../../../types/subCommunity';

interface SubCommunityHeaderSectionProps {
  community: SubCommunity;
  isMember: boolean;
  userRole: SubCommunityRole | null;
  hasPendingRequest: boolean;
  onRefresh: () => void;
  onOpenCommunityMenu: (event: MouseEvent<HTMLElement>) => void;
  onJoinRequest: () => void;
  onCreatePost: () => void;
  onLeaveCommunity: () => void;
  onOpenModeration: () => void;
}

export const SubCommunityHeaderSection = ({
  community,
  isMember,
  userRole,
  hasPendingRequest,
  onRefresh,
  onOpenCommunityMenu,
  onJoinRequest,
  onCreatePost,
  onLeaveCommunity,
  onOpenModeration,
}: SubCommunityHeaderSectionProps) => {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
        }}
      >
        <Button
          component={Link}
          to="/subcommunities"
          startIcon={<ArrowBack />}
          sx={{ mt: 2, mb: 2, mr: 2 }}
        >
          Back to Communities
        </Button>

        <Tooltip title="Refresh community">
          <IconButton
            onClick={onRefresh}
            size="large"
            sx={{
              borderRadius: '50%',
              bgcolor: 'background.green',
              boxShadow: 1,
              '&:hover': { bgcolor: 'primary.light' },
            }}
            aria-label="Refresh Community"
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{
          mb: 4,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: 2,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            height: { xs: 120, md: 160 },
            backgroundImage: community.bannerUrl
              ? `url(${community.bannerUrl}), linear-gradient(to bottom, rgba(27,228,9,0.3), rgba(149,240,129,0.7))`
              : 'linear-gradient(to bottom, rgba(27,228,9,0.3), rgba(149,240,129,0.7))',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        />

        <Box
          sx={{
            p: 3,
            bgcolor: 'background.paper',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}
              >
                <Avatar
                  src={community.iconUrl ?? undefined}
                  sx={{
                    width: 64,
                    height: 64,
                    border: (theme) =>
                      `3px solid ${theme.palette.background.paper}`,
                    boxShadow: 2,
                  }}
                />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="h3"
                      component="h1"
                      sx={{ fontWeight: 700, mb: 1 }}
                    >
                      r/{community.name}
                    </Typography>
                    {(userRole === SubCommunityRole.OWNER ||
                      userRole === SubCommunityRole.MODERATOR) && (
                      <IconButton onClick={onOpenCommunityMenu} size="small">
                        <Settings />
                      </IconButton>
                    )}
                  </Box>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {community.description}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={community.isPrivate ? <Lock /> : <Public />}
                  label={
                    community.isPrivate
                      ? 'Private Community'
                      : 'Public Community'
                  }
                  size="medium"
                  color={community.isPrivate ? 'default' : 'primary'}
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  icon={<People />}
                  label={`${community._count?.members?.toLocaleString() || 0} members`}
                  size="medium"
                  variant="outlined"
                />
                <Chip
                  icon={<Article />}
                  label={`${community._count?.posts?.toLocaleString() || 0} posts`}
                  size="medium"
                  variant="outlined"
                />
                {userRole === SubCommunityRole.OWNER && (
                  <Button
                    variant="outlined"
                    onClick={onOpenModeration}
                    size="medium"
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    Moderation
                  </Button>
                )}
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                minWidth: '200px',
              }}
            >
              {community.owner && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32 }} />
                  <Typography variant="body2" color="text.secondary">
                    Owned by
                    <ProfileNameLink
                      user={{
                        id: community.owner.id,
                        name: community.owner.name,
                      }}
                      onlyFirstName={true}
                    />
                  </Typography>
                </Box>
              )}

              {!isMember && community.isPrivate && (
                <Button
                  variant="contained"
                  onClick={onJoinRequest}
                  disabled={hasPendingRequest}
                  size="large"
                  startIcon={<Lock />}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  {hasPendingRequest ? 'Request Pending' : 'Request to Join'}
                </Button>
              )}

              {!isMember && !community.isPrivate && (
                <Button
                  variant="contained"
                  onClick={onJoinRequest}
                  disabled={hasPendingRequest}
                  size="large"
                  startIcon={<People />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  Join Community
                </Button>
              )}

              {isMember && (
                <Button
                  variant="contained"
                  onClick={onCreatePost}
                  size="large"
                  startIcon={<Add />}
                  sx={{
                    background: 'primary.main',
                    borderRadius: 2,
                    fontWeight: 600,
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  Create Post
                </Button>
              )}

              {isMember && userRole !== SubCommunityRole.OWNER && (
                <Button
                  variant="outlined"
                  onClick={onLeaveCommunity}
                  size="small"
                  startIcon={<ExitToApp />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    mt: 1,
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  Leave Community
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};
