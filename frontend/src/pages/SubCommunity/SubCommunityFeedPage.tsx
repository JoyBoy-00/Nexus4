import {
  FC,
  useEffect,
  useState,
  useCallback,
  lazy,
  MouseEvent,
  ComponentType,
  LazyExoticComponent,
  ReactNode,
  Suspense,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSubCommunity } from '../../contexts/SubCommunityContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePosts } from '../../contexts/PostContext';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Container,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Skeleton,
} from '@mui/material';
import {
  Lock,
  ArrowBack,
  Person,
  Shield,
  Block,
  Edit,
  Delete,
} from '@mui/icons-material';
import { Post as PostType } from '@/types/post';
// Lazy-load heavy components so the page renders a skeleton first
type CreatePostFormProps = {
  subCommunityId?: string;
  subCommunityName?: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onCancel?: () => void;
  profile?: { id?: string; avatarUrl?: string | null };
  userRole?: SubCommunityRole | null;
};

const CreatePostForm = lazy(() =>
  import('../../components/Post/CreatePostForm').then((mod) => {
    return {
      default: (
        mod as unknown as {
          CreatePostForm: ComponentType<CreatePostFormProps>;
        }
      ).CreatePostForm,
    };
  })
) as LazyExoticComponent<ComponentType<CreatePostFormProps>>;

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

const Post = lazy(() =>
  import('../../components/Post/Post').then((mod) => {
    return {
      default: (
        mod as unknown as {
          Post: ComponentType<PostComponentProps>;
        }
      ).Post,
    };
  })
) as LazyExoticComponent<ComponentType<PostComponentProps>>;
import { getErrorMessage } from '@/utils/errorHandler';
import { Link } from 'react-router-dom';
import {
  SubCommunityRole,
  SubCommunityMember,
  SubCommunity,
} from '../../types/subCommunity';
import { Role } from '@/types/profileType';
const SubCommunityEditBox = lazy(() =>
  import('@/components/SubCommunity/SubCommunityEditBox').then((mod) => {
    return {
      default: (
        mod as unknown as {
          SubCommunityEditBox: ComponentType<{
            community: SubCommunity;
            open: boolean;
            onClose: () => void;
            onSave: () => void;
          }>;
        }
      ).SubCommunityEditBox,
    };
  })
);
import { useNotification } from '@/contexts/NotificationContext';
import { SubCommunityPostsList } from './components/SubCommunityPostsList';
import { SubCommunityMembersList } from './components/SubCommunityMembersList';
import { SubCommunityHeaderSection } from './components/SubCommunityHeaderSection';
import { SubCommunityAboutCard } from './components/SubCommunityAboutCard';

// Tab panel component
function TabPanel(props: {
  children?: ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`subcommunity-tabpanel-${index}`}
      aria-labelledby={`subcommunity-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const SubCommunityFeedPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentSubCommunity,
    getSubCommunity,
    loading: subCommunityLoading,
    error: subCommunityError,
    clearError,
    requestToJoin,
    joinRequests,
    getPendingJoinRequests,
    // members,
    leaveSubCommunity,
    removeMember,
    updateMemberRole,
    // banSubCommunity,
    deleteSubCommunity,
  } = useSubCommunity();

  const {
    subCommunityFeed,
    getSubCommunityFeed,
    pagination,
    loading: feedLoading,
    error: feedError,
  } = usePosts();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState<SubCommunityRole | null>(null);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [memberMenuAnchor, setMemberMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [selectedMember, setSelectedMember] =
    useState<SubCommunityMember | null>(null);
  const [communityMenuAnchor, setCommunityMenuAnchor] =
    useState<null | HTMLElement>(null);

  const showSnackbar = useCallback(
    (message: string, severity: 'success' | 'error') => {
      showNotification?.(message, severity);
    },
    [showNotification]
  );

  const isAdmin = user?.role === Role.ADMIN;

  // Load sub-community data
  useEffect(() => {
    if (id) {
      getSubCommunity(id);
      getSubCommunityFeed(id);
    }
  }, [id, getSubCommunity, getSubCommunityFeed]);

  // Check if user is a member and has pending requests
  useEffect(() => {
    if (user && currentSubCommunity) {
      const member = currentSubCommunity.members?.find(
        (m) => m.userId === user.id
      );
      setIsMember(!!member);
      setUserRole(member?.role || null);

      if (currentSubCommunity.isPrivate && !member) {
        getPendingJoinRequests(id!);
      }
    }
  }, [user, currentSubCommunity, id, getPendingJoinRequests]);

  // Check for pending join requests
  useEffect(() => {
    if (user && joinRequests.length > 0) {
      const userRequest = joinRequests.find((req) => req.userId === user.id);
      setHasPendingRequest(!!userRequest);
    }
  }, [user, joinRequests]);

  // Handle errors
  useEffect(() => {
    if (subCommunityError) {
      showSnackbar(subCommunityError, 'error');
      clearError();
    }

    if (feedError) {
      showSnackbar(feedError, 'error');
    }
  }, [subCommunityError, feedError, showSnackbar, clearError]);

  const handleLoadMore = () => {
    const nextPage = Number(pagination.page) + 1;
    if (id && pagination.hasNext) {
      getSubCommunityFeed(id, nextPage);
    }
  };

  const handleCreatePostSuccess = useCallback(() => {
    setOpenForm(false);
    showSnackbar('Post created successfully and sent for approval!', 'success');
    if (id) {
      getSubCommunityFeed(id, 1); // Refresh feed
    }
  }, [getSubCommunityFeed, id, showSnackbar]);

  const handleCreatePostError = useCallback(
    (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      showSnackbar(errorMessage, 'error');
    },
    [showSnackbar]
  );

  const handleJoinRequest = async () => {
    if (!id || !user) return;

    try {
      await requestToJoin(id);
      setHasPendingRequest(true);
      showSnackbar('Join request sent successfully!', 'success');
      // Refresh pending requests
      getPendingJoinRequests(id);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      showSnackbar(errorMessage, 'error');
    } finally {
      // Avoid re-fetching the entire community and feed to keep UX snappy.
      // We already updated local state and refreshed pending requests above.
    }
  };

  const handleLeaveCommunity = async () => {
    if (!id || !user) return;

    try {
      await leaveSubCommunity(id);
      showSnackbar('You have left the community', 'success');
      setIsMember(false);
      setUserRole(null);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!id) return;

    try {
      await removeMember(id, memberId);
      showSnackbar('Member removed successfully', 'success');
      setMemberMenuAnchor(null);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleUpdateMemberRole = async (
    memberId: string,
    newRole: SubCommunityRole
  ) => {
    if (!id) return;

    try {
      await updateMemberRole(id, memberId, newRole);
      showSnackbar('Member role updated successfully', 'success');
      setMemberMenuAnchor(null);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleBanCommunity = async () => {
    if (!isAdmin) {
      showSnackbar('You do not have permission to ban this community', 'error');
      return;
    }
    if (!id) return;

    try {
      // await banSubCommunity(id);
      showSnackbar(
        'Community banned successfully but not functional',
        'success'
      );
      setCommunityMenuAnchor(null);
      navigate('/subcommunities');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleDeleteCommunity = async () => {
    if (userRole !== SubCommunityRole.OWNER || isAdmin) {
      showSnackbar(
        'You do not have permission to delete this community',
        'error'
      );
      return;
    }
    if (!id) return;

    try {
      await deleteSubCommunity(id);
      showSnackbar('Community deleted successfully', 'success');
      setCommunityMenuAnchor(null);
      navigate('/subcommunities');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      showSnackbar(errorMessage, 'error');
    }
  };

  const openMemberMenu = (
    event: MouseEvent<HTMLElement>,
    member: SubCommunityMember
  ) => {
    setSelectedMember(member);
    setMemberMenuAnchor(event.currentTarget);
  };

  const closeMemberMenu = () => {
    setMemberMenuAnchor(null);
    setSelectedMember(null);
  };

  const openCommunityMenu = (event: MouseEvent<HTMLElement>) => {
    setCommunityMenuAnchor(event.currentTarget);
  };

  const closeCommunityMenu = () => {
    setCommunityMenuAnchor(null);
  };

  if (subCommunityLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Box
          sx={{
            bgcolor: 'background.paper',
            rounded: 2,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            p: 4,
            width: '100%',
            maxWidth: '880px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Skeleton variant="text" width="30%" height={24} animation="wave" />
            <Skeleton
              variant="rectangular"
              width={80}
              height={24}
              sx={{ borderRadius: 1 }}
              animation="wave"
            />
          </Box>

          <Box sx={{ display: 'grid', gap: 2 }}>
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
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
                  variant="rectangular"
                  width={80}
                  height={80}
                  sx={{ borderRadius: 1 }}
                  animation="wave"
                />
                <Box sx={{ flex: 1 }}>
                  <Skeleton
                    variant="text"
                    width="75%"
                    height={16}
                    animation="wave"
                  />
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={14}
                    animation="wave"
                  />
                  <Skeleton
                    variant="text"
                    width="50%"
                    height={14}
                    animation="wave"
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  if (!currentSubCommunity) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="error" gutterBottom>
            Community not found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You are not a member of this community or the community you&apos;re
            looking for doesn&apos;t exist or may have been removed.
          </Typography>
          <Button
            component={Link}
            to="/subcommunities"
            variant="contained"
            startIcon={<ArrowBack />}
            size="large"
          >
            Back to Communities
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: { xs: 1, sm: 2 } }}>
        <SubCommunityHeaderSection
          community={currentSubCommunity}
          isMember={isMember}
          userRole={userRole}
          hasPendingRequest={hasPendingRequest}
          onRefresh={() => {
            if (id) {
              getSubCommunity(id);
              getSubCommunityFeed(id, 1);
              showSnackbar('Community refreshed!', 'success');
            }
          }}
          onOpenCommunityMenu={openCommunityMenu}
          onJoinRequest={handleJoinRequest}
          onCreatePost={() => setOpenForm(true)}
          onLeaveCommunity={handleLeaveCommunity}
          onOpenModeration={() =>
            navigate(
              `/moderation/subcommunities/${currentSubCommunity.id}/join-requests`
            )
          }
        />

        {/* Tabs for different views */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_e, newValue) => setActiveTab(newValue)}
          >
            <Tab label="Posts" />
            <Tab label="Members" />
            <Tab label="About" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <TabPanel value={activeTab} index={0}>
          {isMember || !currentSubCommunity.isPrivate ? (
            <>
              <SubCommunityPostsList
                feedLoading={feedLoading}
                currentPage={Number(pagination.page)}
                posts={subCommunityFeed ?? []}
                onCreateFirstPost={() => setOpenForm(true)}
                onPostClick={(postId) =>
                  navigate(`/posts/${postId}`, {
                    state: { from: `/subcommunities/${id}` },
                  })
                }
                PostComponent={Post}
              />

              {pagination.hasNext && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 4,
                    py: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleLoadMore}
                    disabled={feedLoading}
                    size="large"
                    sx={{ borderRadius: 2, minWidth: '200px' }}
                  >
                    {feedLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Load More Posts'
                    )}
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                p: 6,
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: 1,
              }}
            >
              <Lock sx={{ fontSize: 64, color: 'text.secondary', mb: 3 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Private Community
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: '400px', mx: 'auto' }}
              >
                This community is private. You need to be an approved member to
                view and participate in discussions.
              </Typography>
              <Button
                variant="contained"
                onClick={handleJoinRequest}
                disabled={hasPendingRequest}
                size="large"
                startIcon={<Lock />}
                sx={{ borderRadius: 2, fontWeight: 600, px: 4 }}
              >
                {hasPendingRequest ? 'Request Pending' : 'Request to Join'}
              </Button>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <SubCommunityMembersList
            loading={subCommunityLoading}
            currentSubCommunity={currentSubCommunity}
            userId={user?.id}
            userRole={userRole}
            onOpenMemberMenu={openMemberMenu}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <SubCommunityAboutCard community={currentSubCommunity} />
        </TabPanel>

        {/* Create Post Dialog */}
        <Dialog
          open={openForm}
          onClose={() => setOpenForm(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 600,
              fontSize: '1.2rem',
            }}
          >
            Create Post in r/{currentSubCommunity.name}
          </DialogTitle>
          <DialogContent sx={{ p: 3, minHeight: '400px' }}>
            <Suspense
              fallback={
                <Box sx={{ py: 4, display: 'grid', gap: 2 }}>
                  <Skeleton
                    variant="text"
                    width="75%"
                    height={40}
                    animation="wave"
                  />
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={160}
                    sx={{ borderRadius: 1 }}
                    animation="wave"
                  />
                </Box>
              }
            >
              <CreatePostForm
                subCommunityId={currentSubCommunity.id}
                subCommunityName={currentSubCommunity.name}
                onSuccess={handleCreatePostSuccess}
                onError={handleCreatePostError}
                onCancel={() => setOpenForm(false)}
                userRole={userRole}
              />
            </Suspense>
          </DialogContent>
        </Dialog>
      </Box>

      {/* Member Actions Menu */}
      <Menu
        anchorEl={memberMenuAnchor}
        open={Boolean(memberMenuAnchor)}
        onClose={closeMemberMenu}
      >
        <MenuItem
          onClick={() => {
            handleUpdateMemberRole(
              selectedMember!.id,
              SubCommunityRole.MODERATOR
            );
            closeMemberMenu();
          }}
          disabled={selectedMember?.role === SubCommunityRole.MODERATOR}
        >
          <Shield sx={{ mr: 1 }} /> Make Moderator
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateMemberRole(selectedMember!.id, SubCommunityRole.MEMBER);
            closeMemberMenu();
          }}
          disabled={selectedMember?.role === SubCommunityRole.MEMBER}
        >
          <Person sx={{ mr: 1 }} /> Make Member
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleRemoveMember(selectedMember!.user.id);
            closeMemberMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <Block sx={{ mr: 1 }} /> Remove Member
        </MenuItem>
      </Menu>

      {/* Community Actions Menu */}
      <Menu
        anchorEl={communityMenuAnchor}
        open={Boolean(communityMenuAnchor)}
        onClose={closeCommunityMenu}
      >
        <MenuItem
          onClick={() => {
            setEditDialogOpen(true);
            closeCommunityMenu();
          }}
        >
          <Edit sx={{ mr: 1 }} /> Edit Community
        </MenuItem>
        {isAdmin && (
          <MenuItem
            onClick={() => {
              handleBanCommunity();
              closeCommunityMenu();
            }}
            sx={{ color: 'error.main' }}
          >
            <Block sx={{ mr: 1 }} /> Ban Community
          </MenuItem>
        )}
        {(userRole == SubCommunityRole.OWNER || isAdmin) && (
          <MenuItem
            onClick={() => {
              handleDeleteCommunity();
              closeCommunityMenu();
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1 }} /> Delete Community
          </MenuItem>
        )}
      </Menu>
      <Suspense
        fallback={
          <Dialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
          >
            <DialogTitle>
              <Skeleton
                variant="text"
                width="33%"
                height={24}
                animation="wave"
              />
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'grid', gap: 2, py: 2 }}>
                <Skeleton
                  variant="text"
                  width="100%"
                  height={36}
                  animation="wave"
                />
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={160}
                  sx={{ borderRadius: 1 }}
                  animation="wave"
                />
              </Box>
            </DialogContent>
          </Dialog>
        }
      >
        {currentSubCommunity && (
          <SubCommunityEditBox
            community={currentSubCommunity}
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            onSave={() => {
              showSnackbar('Community updated successfully!', 'success');
              getSubCommunity(id!); // Refresh community data
            }}
          />
        )}
      </Suspense>
    </>
  );
};

export default SubCommunityFeedPage;
