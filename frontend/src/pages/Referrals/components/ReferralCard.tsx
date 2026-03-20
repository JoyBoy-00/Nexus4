import {
  Card,
  CardActions,
  CardContent,
  IconButton,
  Stack,
  Typography,
  Box,
  Chip,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Delete,
  Description,
  Edit,
  LocationOn,
  Person,
  Send,
} from '@mui/icons-material';

interface ReferralApplicationLite {
  referralId: string;
  applicantId: string;
}

interface ReferralCardProps {
  referral: {
    id: string;
    company: string;
    jobTitle: string;
    description: string;
    location: string;
    deadline: string;
    referralLink?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    alumniId: string;
    createdAt: string;
    postedBy: { name: string };
    applications: Array<{ id: string }>;
  };
  userRole?: string;
  userId?: string;
  applications: ReferralApplicationLite[];
  getStatusColor: (
    status: string
  ) =>
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
  onView: () => void;
  onApply: () => void;
  onApprove: () => void;
  onReject: () => void;
  onOpenApplications: () => void;
  onDelete: () => void;
}

export const ReferralCard = ({
  referral,
  userRole,
  userId,
  applications,
  getStatusColor,
  onView,
  onApply,
  onApprove,
  onReject,
  onOpenApplications,
  onDelete,
}: ReferralCardProps) => {
  const alreadyApplied = applications.some(
    (app) => app.referralId === referral.id && app.applicantId === userId
  );

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          width: '100%',
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: 4,
          },
        }}
      >
        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: 350, md: 380 },
            p: 2.25,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 1,
              mb: 1.5,
            }}
          >
            <Box sx={{ minWidth: 0, pr: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.4 }}
              >
                {referral.company}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 0.6,
                  fontSize: '1.05rem',
                  lineHeight: 1.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {referral.jobTitle}
              </Typography>
            </Box>
            <Chip
              label={referral.status}
              color={getStatusColor(referral.status)}
              size="small"
            />
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 1.5 }}
            useFlexGap
            flexWrap="wrap"
          >
            <Chip
              size="small"
              variant="outlined"
              label={`Applications: ${referral.applications?.length ?? 0}`}
            />
            <Chip
              size="small"
              variant="outlined"
              label={new Date(referral.createdAt).toLocaleDateString()}
            />
          </Stack>

          <Stack spacing={1} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {referral.location}
              </Typography>
            </Box>
            {referral.deadline && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Apply by: {new Date(referral.deadline).toLocaleDateString()}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Posted by {referral.postedBy.name}
              </Typography>
            </Box>
          </Stack>

          <Typography
            variant="body2"
            sx={{
              mb: 2,
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              minHeight: 60,
            }}
          >
            {referral.description.length > 100
              ? `${referral.description.substring(0, 100)}...`
              : referral.description}
          </Typography>

          <CardActions
            sx={{
              pt: 1,
              mt: 'auto',
              px: 0,
              borderTop: '1px solid',
              borderColor: 'divider',
              justifyContent: 'flex-end',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              justifyContent="flex-end"
              sx={{ rowGap: 0.8, width: '100%' }}
            >
              {referral.referralLink && (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => window.open(referral.referralLink, '_blank')}
                  sx={{ textTransform: 'none' }}
                >
                  Job Link
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                onClick={onView}
                sx={{ textTransform: 'none' }}
              >
                View
              </Button>
              {(userRole === 'STUDENT' || userRole === 'ALUM') &&
                referral.status === 'APPROVED' && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Send />}
                    disabled={alreadyApplied}
                    onClick={onApply}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      minWidth: { xs: '100%', sm: 118 },
                    }}
                  >
                    {alreadyApplied ? 'Already Applied' : 'Apply'}
                  </Button>
                )}
              {userRole === 'ADMIN' && referral.status === 'PENDING' && (
                <>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={onApprove}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={onReject}
                  >
                    Reject
                  </Button>
                </>
              )}
              {userId === referral.alumniId && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={onOpenApplications}
                    sx={{ textTransform: 'none' }}
                  >
                    Applications ({referral.applications?.length ?? 0})
                  </Button>
                  <IconButton size="small" color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={onDelete}>
                    <Delete />
                  </IconButton>
                </>
              )}
            </Stack>
          </CardActions>
        </CardContent>
      </Card>
    </motion.div>
  );
};
