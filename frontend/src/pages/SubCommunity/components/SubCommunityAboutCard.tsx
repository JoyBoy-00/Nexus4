import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { Article, Lock, People, Public } from '@mui/icons-material';
import { SubCommunity } from '../../../types/subCommunity';

interface SubCommunityAboutCardProps {
  community: SubCommunity;
}

export const SubCommunityAboutCard = ({
  community,
}: SubCommunityAboutCardProps) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          About r/{community.name}
        </Typography>
        <Typography variant="body1" paragraph>
          {community.description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Created on {new Date(community.createdAt).toLocaleDateString()}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Chip
            icon={community.isPrivate ? <Lock /> : <Public />}
            label={community.isPrivate ? 'Private' : 'Public'}
            sx={{ mr: 1 }}
          />
          <Chip
            icon={<People />}
            label={`${community._count?.members || 0} members`}
            sx={{ mr: 1 }}
          />
          <Chip
            icon={<Article />}
            label={`${community._count?.posts || 0} posts`}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
