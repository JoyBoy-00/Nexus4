import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from '@mui/material';
import { Description, School, Visibility } from '@mui/icons-material';

interface ApplicationItem {
  id: string;
  resumeUrl: string;
  coverLetter?: string;
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  applicant: {
    name: string;
    role: string;
  };
}

interface MyApplicationsSectionProps {
  applications: ApplicationItem[];
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
}

export const MyApplicationsSection = ({
  applications,
  getStatusColor,
}: MyApplicationsSectionProps) => {
  if (applications.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        My Applications
      </Typography>
      <Grid container spacing={2}>
        {applications.map((application) => (
          <Grid item xs={12} md={6} key={application.id}>
            <Card sx={{ borderRadius: 3 }}>
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
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Application #{application.id.slice(-8)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Submitted{' '}
                      {new Date(application.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={application.status}
                    color={getStatusColor(application.status)}
                    size="small"
                  />
                </Box>

                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                >
                  <School sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {application.applicant.name} ({application.applicant.role})
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => window.open(application.resumeUrl, '_blank')}
                  >
                    View Resume
                  </Button>
                  {application.coverLetter && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Description />}
                    >
                      View Cover Letter
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
