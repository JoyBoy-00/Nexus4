import { cloneElement, FC } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  CalendarToday,
  Comment as CommentIcon,
  Favorite,
  FavoriteBorder,
  GitHub,
  Group,
  Handshake,
  Language,
  Person,
  Share,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { ProjectDetailInterface } from '@/types/ShowcaseType';

interface MetricCardProps {
  icon: React.ReactElement;
  value: React.ReactNode;
  label: string;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

interface ProjectOverviewSectionProps {
  project: ProjectDetailInterface;
  currentUserId?: string;
  isOwner: boolean;
  isSupported: boolean;
  isFollowing: boolean;
  statusConfig: Record<
    string,
    {
      label: string;
      gradient: string;
      icon: React.ReactElement;
      color: string;
    }
  >;
  imageProps: {
    src: string;
    alt: string;
    loading: 'lazy';
    style: React.CSSProperties;
  };
  onShare: () => void;
  onSupport: () => void;
  onFollow: () => void;
  onCollaborate: () => void;
}

const MetricCard: FC<MetricCardProps> = ({
  icon,
  value,
  label,
  color = 'primary',
}) => {
  const theme = useTheme();

  return (
    <Card
      variant="outlined"
      sx={{
        textAlign: 'center',
        p: 2,
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.05)} 0%, ${alpha(theme.palette[color].main, 0.02)} 100%)`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${alpha(theme.palette[color].main, 0.15)}`,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
        }}
      >
        {cloneElement(icon, {
          sx: {
            fontSize: 24,
            color: `${color}.main`,
            opacity: 0.8,
          },
        })}
      </Box>
      <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {label}
      </Typography>
    </Card>
  );
};

export const ProjectOverviewSection: FC<ProjectOverviewSectionProps> = ({
  project,
  currentUserId,
  isOwner,
  isSupported,
  isFollowing,
  statusConfig,
  imageProps,
  onShare,
  onSupport,
  onFollow,
  onCollaborate,
}) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={8}>
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <Box sx={{ borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
            {project.imageUrl ? (
              <img {...imageProps} alt={project.title} />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 300,
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px 12px 0 0',
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No Project Image
                </Typography>
              </Box>
            )}
          </Box>

          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="bold"
                  gutterBottom
                >
                  {project.title}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Chip
                    icon={statusConfig[project.status]?.icon}
                    label={statusConfig[project.status]?.label}
                    size="small"
                    sx={{
                      background: statusConfig[project.status]?.gradient,
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2">
                      {project.createdAt &&
                      !isNaN(new Date(project.createdAt).getTime())
                        ? format(new Date(project.createdAt), 'MMM d, yyyy')
                        : 'Unknown date'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Share">
                  <IconButton onClick={onShare}>
                    <Share />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Typography
              variant="body1"
              color="text.primary"
              sx={{
                lineHeight: 1.7,
                mb: 3,
              }}
            >
              {project.description ||
                'No description provided for this project.'}
            </Typography>

            {(project.githubUrl || project.websiteUrl) && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {project.githubUrl && (
                  <Button
                    variant="outlined"
                    startIcon={<GitHub />}
                    onClick={() => window.open(project.githubUrl, '_blank')}
                  >
                    GitHub
                  </Button>
                )}
                {project.websiteUrl && (
                  <Button
                    variant="outlined"
                    startIcon={<Language />}
                    onClick={() => window.open(project.websiteUrl, '_blank')}
                  >
                    Website
                  </Button>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={4}>
        <Box sx={{ position: 'sticky' }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Project Owner
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={project.owner?.profile?.avatarUrl}
                  sx={{
                    width: 56,
                    height: 56,
                  }}
                >
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {project.owner?.name || 'Owner'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.owner?.role || 'Project Lead'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{ mt: 0.5 }}
                  >
                    {project.createdAt &&
                    !isNaN(new Date(project.createdAt).getTime())
                      ? `Created ${formatDistanceToNow(new Date(project.createdAt))} ago`
                      : ''}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Project Metrics
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <MetricCard
                icon={<Favorite />}
                value={project._count?.supporters ?? 0}
                label="Supporters"
                color="error"
              />
            </Grid>
            <Grid item xs={6}>
              <MetricCard
                icon={<Visibility />}
                value={project._count?.followers ?? 0}
                label="Followers"
                color="info"
              />
            </Grid>
            <Grid item xs={6}>
              <MetricCard
                icon={<CommentIcon />}
                value={project._count?.comments ?? 0}
                label="Comments"
                color="warning"
              />
            </Grid>
            <Grid item xs={6}>
              <MetricCard
                icon={<Group />}
                value={project._count?.teamMembers ?? 0}
                label="Team"
                color="success"
              />
            </Grid>
          </Grid>

          {!isOwner && currentUserId && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                  <Button
                    variant={isSupported ? 'contained' : 'outlined'}
                    startIcon={isSupported ? <Favorite /> : <FavoriteBorder />}
                    onClick={onSupport}
                    color="error"
                    fullWidth
                  >
                    {isSupported ? 'Supported' : 'Support'}
                  </Button>
                  <Button
                    variant={isFollowing ? 'contained' : 'outlined'}
                    startIcon={isFollowing ? <VisibilityOff /> : <Visibility />}
                    onClick={onFollow}
                    color="primary"
                    fullWidth
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Handshake />}
                    onClick={onCollaborate}
                    fullWidth
                    sx={{
                      background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    Collaborate
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Grid>

      {project.seeking && project.seeking.length > 0 && (
        <Card
          sx={{
            m: 3,
            border: `1px solid ${theme.palette.info.main}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <Handshake />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Seeking Collaborators
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  This project is actively looking for team members with the
                  following skills:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(project.seeking ?? []).map((skill, idx) => (
                    <Chip
                      key={skill + idx}
                      label={skill}
                      size="small"
                      clickable
                      variant="filled"
                      color="info"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Grid>
  );
};
