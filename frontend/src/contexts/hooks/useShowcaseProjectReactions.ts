import { Dispatch, SetStateAction, useCallback } from 'react';
import { ShowcaseService } from '@/services/ShowcaseService';
import type {
  PaginatedProjectsInterface,
  ProjectDetailInterface,
} from '@/types/ShowcaseType';
import { useAuth } from '../AuthContext';

type ProjectCounts = {
  total: number;
  owned: number;
  supported: number;
  followed: number;
};

type ShowcaseActionLoadingState = {
  teamMembers: boolean;
  refresh: boolean;
  count: boolean;
  support: Set<string>;
  follow: Set<string>;
  comment: boolean;
  updates: boolean;
  seekingOptions: boolean;
  projectDetails: Set<string>;
};

interface UseShowcaseProjectReactionsProps {
  setError: (error: string) => void;
  setActionLoading: Dispatch<SetStateAction<ShowcaseActionLoadingState>>;
  allProjects: PaginatedProjectsInterface;
  setAllProjects: Dispatch<SetStateAction<PaginatedProjectsInterface>>;
  projectsByUserId: PaginatedProjectsInterface;
  setProjectsByUserId: Dispatch<SetStateAction<PaginatedProjectsInterface>>;
  projectById: ProjectDetailInterface | null;
  setProjectById: Dispatch<SetStateAction<ProjectDetailInterface | null>>;
  setProjectCounts: Dispatch<SetStateAction<ProjectCounts>>;
  setSupportedProjects: Dispatch<SetStateAction<PaginatedProjectsInterface>>;
  setFollowedProjects: Dispatch<SetStateAction<PaginatedProjectsInterface>>;
}

export const useShowcaseProjectReactions = ({
  setError,
  setActionLoading,
  allProjects,
  setAllProjects,
  projectsByUserId,
  setProjectsByUserId,
  projectById,
  setProjectById,
  setProjectCounts,
  setSupportedProjects,
  setFollowedProjects,
}: UseShowcaseProjectReactionsProps) => {
  const { user } = useAuth();

  const supportProject = useCallback(
    async (projectId: string) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      setActionLoading((prev) => ({
        ...prev,
        support: new Set(prev.support).add(projectId),
      }));
      try {
        await ShowcaseService.supportProject(projectId);

        setAllProjects((prev) => ({
          ...prev,
          data: prev.data.map((proj) =>
            proj.id === projectId
              ? {
                  ...proj,
                  _count: {
                    ...proj._count,
                    supporters: (proj._count.supporters || 0) + 1,
                  },
                  supporters: Array.isArray(proj.supporters)
                    ? [...proj.supporters, { userId: user.id }]
                    : [{ userId: user.id }],
                }
              : proj
          ),
        }));

        setProjectsByUserId((prev) => ({
          ...prev,
          data: prev.data.map((proj) =>
            proj.id === projectId
              ? {
                  ...proj,
                  _count: {
                    ...proj._count,
                    supporters: (proj._count.supporters || 0) + 1,
                  },
                  supporters: Array.isArray(proj.supporters)
                    ? [...proj.supporters, { userId: user.id }]
                    : [{ userId: user.id }],
                }
              : proj
          ),
        }));

        if (projectById?.id === projectId) {
          setProjectById((prev) =>
            prev
              ? {
                  ...prev,
                  _count: {
                    ...prev._count,
                    supporters: (prev._count.supporters || 0) + 1,
                  },
                  supporters: Array.isArray(prev.supporters)
                    ? [...prev.supporters, { userId: user.id }]
                    : [{ userId: user.id }],
                }
              : prev
          );
        }
        setProjectCounts((prev) => ({
          ...prev,
          supported: prev.supported + 1,
        }));

        const projToAdd =
          allProjects.data.find((p) => p.id === projectId) ||
          projectsByUserId.data.find((p) => p.id === projectId) ||
          (projectById?.id === projectId ? projectById : null);

        if (projToAdd) {
          setSupportedProjects((prev) => ({
            data: [
              { ...projToAdd, supporters: [{ userId: user.id }] },
              ...prev.data.filter((p) => p.id !== projectId),
            ],
            pagination: prev.pagination,
          }));
        }
      } catch (err) {
        setError(
          `Failed to support project: ${err instanceof Error ? err.message : String(err)}`
        );
        throw err;
      } finally {
        setActionLoading((prev) => {
          const next = new Set(prev.support);
          next.delete(projectId);
          return { ...prev, support: next };
        });
      }
    },
    [
      user,
      setError,
      setActionLoading,
      setAllProjects,
      setProjectsByUserId,
      projectById,
      setProjectById,
      setProjectCounts,
      setSupportedProjects,
      allProjects.data,
      projectsByUserId.data,
    ]
  );

  const unsupportProject = useCallback(
    async (projectId: string) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      setActionLoading((prev) => ({
        ...prev,
        support: new Set(prev.support).add(projectId),
      }));
      try {
        await ShowcaseService.unsupportProject(projectId);
        setAllProjects((prev) => ({
          ...prev,
          data: prev.data.map((proj) =>
            proj.id === projectId
              ? {
                  ...proj,
                  _count: {
                    ...proj._count,
                    supporters: Math.max((proj._count.supporters || 1) - 1, 0),
                  },
                  supporters: proj.supporters
                    ? proj.supporters.filter((s) => s.userId !== user.id)
                    : [],
                }
              : proj
          ),
        }));

        setProjectsByUserId((prev) => ({
          ...prev,
          data: prev.data.map((proj) =>
            proj.id === projectId
              ? {
                  ...proj,
                  _count: {
                    ...proj._count,
                    supporters: Math.max((proj._count.supporters || 1) - 1, 0),
                  },
                  supporters: proj.supporters
                    ? proj.supporters.filter((s) => s.userId !== user.id)
                    : [],
                }
              : proj
          ),
        }));

        if (projectById?.id === projectId) {
          setProjectById((prev) =>
            prev
              ? {
                  ...prev,
                  _count: {
                    ...prev._count,
                    supporters: Math.max((prev._count.supporters || 1) - 1, 0),
                  },
                  supporters: prev.supporters
                    ? prev.supporters.filter((s) => s.userId !== user.id)
                    : [],
                }
              : prev
          );
        }
        setProjectCounts((prev) => ({
          ...prev,
          supported: Math.max(prev.supported - 1, 0),
        }));
        setSupportedProjects((prev) => ({
          data: prev.data.filter((p) => p.id !== projectId),
          pagination: prev.pagination,
        }));
      } catch (err) {
        setError(
          `Failed to unsupport project: ${err instanceof Error ? err.message : String(err)}`
        );
        throw err;
      } finally {
        setActionLoading((prev) => {
          const next = new Set(prev.support);
          next.delete(projectId);
          return { ...prev, support: next };
        });
      }
    },
    [
      user,
      setError,
      setActionLoading,
      setAllProjects,
      setProjectsByUserId,
      projectById,
      setProjectById,
      setProjectCounts,
      setSupportedProjects,
    ]
  );

  const followProject = useCallback(
    async (projectId: string) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      setActionLoading((prev) => ({
        ...prev,
        follow: new Set(prev.follow).add(projectId),
      }));
      try {
        await ShowcaseService.followProject(projectId);

        setAllProjects((prev) => ({
          ...prev,
          data: prev.data.map((proj) =>
            proj.id === projectId
              ? {
                  ...proj,
                  _count: {
                    ...proj._count,
                    followers: (proj._count.followers || 0) + 1,
                  },
                  followers: Array.isArray(proj.followers)
                    ? [...proj.followers, { userId: user.id }]
                    : [{ userId: user.id }],
                }
              : proj
          ),
        }));

        setProjectsByUserId((prev) => ({
          ...prev,
          data: prev.data.map((proj) =>
            proj.id === projectId
              ? {
                  ...proj,
                  _count: {
                    ...proj._count,
                    followers: (proj._count.followers || 0) + 1,
                  },
                  followers: Array.isArray(proj.followers)
                    ? [...proj.followers, { userId: user.id }]
                    : [{ userId: user.id }],
                }
              : proj
          ),
        }));

        if (projectById?.id === projectId) {
          setProjectById((prev) =>
            prev
              ? {
                  ...prev,
                  _count: {
                    ...prev._count,
                    followers: (prev._count.followers || 0) + 1,
                  },
                  followers: Array.isArray(prev.followers)
                    ? [...prev.followers, { userId: user.id }]
                    : [{ userId: user.id }],
                }
              : prev
          );
        }
        setProjectCounts((prev) => ({
          ...prev,
          followed: prev.followed + 1,
        }));

        const projToAdd =
          allProjects.data.find((p) => p.id === projectId) ||
          projectsByUserId.data.find((p) => p.id === projectId) ||
          (projectById?.id === projectId ? projectById : null);

        if (projToAdd) {
          setFollowedProjects((prev) => ({
            data: [
              { ...projToAdd, followers: [{ userId: user.id }] },
              ...prev.data.filter((p) => p.id !== projectId),
            ],
            pagination: prev.pagination,
          }));
        }
      } catch (err) {
        setError(
          `Failed to follow project: ${err instanceof Error ? err.message : String(err)}`
        );
        throw err;
      } finally {
        setActionLoading((prev) => {
          const next = new Set(prev.follow);
          next.delete(projectId);
          return { ...prev, follow: next };
        });
      }
    },
    [
      user,
      setError,
      setActionLoading,
      setAllProjects,
      setProjectsByUserId,
      projectById,
      setProjectById,
      setProjectCounts,
      setFollowedProjects,
      allProjects.data,
      projectsByUserId.data,
    ]
  );

  const unfollowProject = useCallback(
    async (projectId: string) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      setActionLoading((prev) => ({
        ...prev,
        follow: new Set(prev.follow).add(projectId),
      }));
      try {
        await ShowcaseService.unfollowProject(projectId);
        setAllProjects((prev) => ({
          ...prev,
          data: prev.data.map((proj) =>
            proj.id === projectId
              ? {
                  ...proj,
                  _count: {
                    ...proj._count,
                    followers: Math.max((proj._count.followers || 1) - 1, 0),
                  },
                  followers: proj.followers
                    ? proj.followers.filter((f) => f.userId !== user.id)
                    : [],
                }
              : proj
          ),
        }));

        setProjectsByUserId((prev) => ({
          ...prev,
          data: prev.data.map((proj) =>
            proj.id === projectId
              ? {
                  ...proj,
                  _count: {
                    ...proj._count,
                    followers: Math.max((proj._count.followers || 1) - 1, 0),
                  },
                  followers: proj.followers
                    ? proj.followers.filter((f) => f.userId !== user.id)
                    : [],
                }
              : proj
          ),
        }));

        if (projectById?.id === projectId) {
          setProjectById((prev) =>
            prev
              ? {
                  ...prev,
                  _count: {
                    ...prev._count,
                    followers: Math.max((prev._count.followers || 1) - 1, 0),
                  },
                  followers: prev.followers
                    ? prev.followers.filter((f) => f.userId !== user.id)
                    : [],
                }
              : prev
          );
        }
        setProjectCounts((prev) => ({
          ...prev,
          followed: Math.max(prev.followed - 1, 0),
        }));
        setFollowedProjects((prev) => ({
          data: prev.data.filter((p) => p.id !== projectId),
          pagination: prev.pagination,
        }));
      } catch (err) {
        setError(
          `Failed to unfollow project: ${err instanceof Error ? err.message : String(err)}`
        );
        throw err;
      } finally {
        setActionLoading((prev) => {
          const next = new Set(prev.follow);
          next.delete(projectId);
          return { ...prev, follow: next };
        });
      }
    },
    [
      user,
      setError,
      setActionLoading,
      setAllProjects,
      setProjectsByUserId,
      projectById,
      setProjectById,
      setProjectCounts,
      setFollowedProjects,
    ]
  );

  return {
    supportProject,
    unsupportProject,
    followProject,
    unfollowProject,
  };
};
