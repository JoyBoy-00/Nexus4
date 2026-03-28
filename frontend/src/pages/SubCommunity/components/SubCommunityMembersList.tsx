import { Fragment, MouseEvent } from 'react';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Typography,
} from '@mui/material';
import {
  AdminPanelSettings,
  Group,
  MoreVert,
  Person,
  Shield,
} from '@mui/icons-material';
import { ProfileNameLink } from '@/utils/ProfileNameLink';
import {
  SubCommunity,
  SubCommunityMember,
  SubCommunityRole,
} from '../../../types/subCommunity';

interface SubCommunityMembersListProps {
  loading: boolean;
  currentSubCommunity: SubCommunity | null;
  userId?: string;
  userRole: SubCommunityRole | null;
  onOpenMemberMenu: (
    event: MouseEvent<HTMLElement>,
    member: SubCommunityMember
  ) => void;
}

const renderRoleIcon = (role: SubCommunityRole) => {
  switch (role) {
    case SubCommunityRole.OWNER:
      return <AdminPanelSettings color="primary" />;
    case SubCommunityRole.MODERATOR:
      return <Shield color="secondary" />;
    default:
      return <Person color="action" />;
  }
};

export const SubCommunityMembersList = ({
  loading,
  currentSubCommunity,
  userId,
  userRole,
  onOpenMemberMenu,
}: SubCommunityMembersListProps) => {
  if (loading) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          p: 3,
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
          <Typography variant="h6">Members</Typography>
          <Skeleton
            variant="rectangular"
            width={64}
            height={16}
            sx={{ borderRadius: 1 }}
            animation="wave"
          />
        </Box>

        <Box sx={{ display: 'grid', gap: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Skeleton
                variant="circular"
                width={40}
                height={40}
                animation="wave"
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton
                  variant="text"
                  width="35%"
                  height={16}
                  animation="wave"
                  sx={{ mb: 0.5 }}
                />
                <Skeleton
                  variant="text"
                  width="25%"
                  height={14}
                  animation="wave"
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  if (
    !currentSubCommunity?.members ||
    currentSubCommunity.members.length === 0
  ) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Group sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No members yet
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {currentSubCommunity.members.map((member) => (
        <Fragment key={member.id}>
          <ListItem
            secondaryAction={
              (userRole === SubCommunityRole.OWNER ||
                (userRole === SubCommunityRole.MODERATOR &&
                  member.role === SubCommunityRole.MEMBER)) &&
              member.userId !== userId && (
                <IconButton
                  edge="end"
                  aria-label="member actions"
                  onClick={(event) => onOpenMemberMenu(event, member)}
                >
                  <MoreVert />
                </IconButton>
              )
            }
          >
            <ListItemAvatar>
              <Avatar src={member.user?.profile?.avatarUrl || undefined}>
                {member.user.name.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ProfileNameLink
                    user={{
                      id: member.user.id,
                      name: member.user.name,
                      role: member.user.role,
                      profile: {
                        avatarUrl: member.user?.profile?.avatarUrl || undefined,
                      },
                    }}
                    showRoleBadge={true}
                    linkToProfile={true}
                  />
                  {renderRoleIcon(member.role)}
                </Box>
              }
              secondary={member.role}
            />
          </ListItem>
          <Divider variant="inset" component="li" />
        </Fragment>
      ))}
    </List>
  );
};
