import { Suspense, ComponentType } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Skeleton,
  Typography,
} from '@mui/material';
import { Add, Article } from '@mui/icons-material';
import { Post as PostType } from '@/types/post';

type PostComponentProps = {
  post: PostType;
  onClick?: () => void;
  onUpdate?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  isAdminView?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
};

interface SubCommunityPostsListProps {
  feedLoading: boolean;
  currentPage: number;
  posts: PostType[];
  onCreateFirstPost: () => void;
  onPostClick: (postId: string) => void;
  PostComponent: ComponentType<PostComponentProps>;
}

export const SubCommunityPostsList = ({
  feedLoading,
  currentPage,
  posts,
  onCreateFirstPost,
  onPostClick,
  PostComponent,
}: SubCommunityPostsListProps) => {
  if (feedLoading && currentPage === 1) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          p: 3,
          mt: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Typography variant="h6">Posts</Typography>
          <Skeleton
            variant="rectangular"
            width={80}
            height={24}
            sx={{ borderRadius: 1 }}
            animation="wave"
          />
        </Box>

        <Box sx={{ display: 'grid', gap: 2 }}>
          {[...Array(3)].map((_, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 2,
                p: 2,
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Skeleton
                variant="circular"
                width={80}
                height={80}
                animation="wave"
              />
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Skeleton
                    variant="text"
                    width="70%"
                    height={24}
                    animation="wave"
                  />
                  <Skeleton
                    variant="rectangular"
                    width={64}
                    height={24}
                    sx={{ borderRadius: 1 }}
                    animation="wave"
                  />
                </Box>
                <Skeleton
                  variant="text"
                  width="100%"
                  height={16}
                  animation="wave"
                />
                <Skeleton
                  variant="text"
                  width="66%"
                  height={16}
                  animation="wave"
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={32}
                    sx={{ borderRadius: 1 }}
                    animation="wave"
                  />
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={32}
                    sx={{ borderRadius: 1 }}
                    animation="wave"
                  />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 6,
          bgcolor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Article sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No posts yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Be the first to share something in this community!
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreateFirstPost}
        >
          Create First Post
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {posts.map((post) => (
        <Suspense
          key={post.id}
          fallback={
            <Card sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2 }}>
                <Skeleton
                  variant="circular"
                  width={48}
                  height={48}
                  animation="wave"
                />
                <Box sx={{ flex: 1 }}>
                  <Skeleton
                    variant="text"
                    width="40%"
                    height={20}
                    animation="wave"
                    sx={{ mb: 0.5 }}
                  />
                  <Skeleton
                    variant="text"
                    width="30%"
                    height={16}
                    animation="wave"
                  />
                </Box>
                <Skeleton
                  variant="circular"
                  width={32}
                  height={32}
                  animation="wave"
                />
              </Box>

              <Box sx={{ px: 2 }}>
                <Skeleton
                  variant="rectangular"
                  width={120}
                  height={28}
                  sx={{ borderRadius: 1, my: 1 }}
                  animation="wave"
                />
              </Box>

              <CardContent>
                <Skeleton
                  variant="text"
                  width="100%"
                  height={16}
                  animation="wave"
                  sx={{ mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={16}
                  animation="wave"
                  sx={{ mb: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={192}
                  sx={{ borderRadius: 1 }}
                  animation="wave"
                />
              </CardContent>

              <Box sx={{ px: 2, pb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={32}
                    sx={{ borderRadius: 1 }}
                    animation="wave"
                  />
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={32}
                    sx={{ borderRadius: 1 }}
                    animation="wave"
                  />
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={32}
                    sx={{ borderRadius: 1 }}
                    animation="wave"
                  />
                </Box>
              </Box>
            </Card>
          }
        >
          <PostComponent post={post} onClick={() => onPostClick(post.id)} />
        </Suspense>
      ))}
    </Box>
  );
};
