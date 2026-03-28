import { Dispatch, SetStateAction, useState, useCallback } from 'react';
import type {
  ProjectComment,
  ProjectUpdateInterface,
  CreateProjectUpdateInterface,
  CommentPaginationResponse,
} from '@/types/ShowcaseType';
import { ShowcaseService } from '@/services/ShowcaseService';
import { useAuth } from '../AuthContext';
import type { ProjectDetailInterface } from '@/types/ShowcaseType';
import type { CommentsCache } from './showcaseCache.types';

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

interface UseShowcaseEngagementProps {
  setError: (error: string) => void;
  setProjectById: (
    project:
      | ProjectDetailInterface
      | null
      | ((prev: ProjectDetailInterface | null) => ProjectDetailInterface | null)
  ) => void;
  setActionLoading: Dispatch<SetStateAction<ShowcaseActionLoadingState>>;
  getCachedComments: (projectId: string) => CommentsCache | null;
  setCachedComments: (
    projectId: string,
    comments: ProjectComment[],
    pagination: CommentPaginationResponse
  ) => void;
}

/**
 * useShowcaseEngagement
 * Manages project comments, updates, and seeking options
 */
export const useShowcaseEngagement = ({
  setError,
  setProjectById,
  setActionLoading,
  getCachedComments,
  setCachedComments,
}: UseShowcaseEngagementProps) => {
  const [comments, setComments] = useState<
    Record<
      string,
      {
        data: ProjectComment[];
        pagination: CommentPaginationResponse;
      }
    >
  >({});
  const [updates, setUpdates] = useState<
    Record<string, ProjectUpdateInterface[]>
  >({});
  const [seekingOptions, setSeekingOptions] = useState<
    Record<string, string[]>
  >({});
  const { user } = useAuth();

  const createComment = useCallback(
    async (projectId: string, comment: string) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      try {
        const response = await ShowcaseService.createComment(
          projectId,
          comment
        );

        setComments((prev) => ({
          ...prev,
          [projectId]: {
            data: [response, ...(prev[projectId]?.data ?? [])],
            pagination: prev[projectId]?.pagination,
          },
        }));

        setProjectById((prev) =>
          prev
            ? {
                ...prev,
                _count: {
                  ...prev._count,
                  comments: (prev._count.comments || 0) + 1,
                },
              }
            : prev
        );
      } catch (err) {
        setError(
          `Failed to create comment: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    },
    [user, setError, setProjectById]
  );

  const getComments = useCallback(
    async (
      projectId: string,
      page: number = 1,
      forceRefresh: boolean = false
    ) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      if (!forceRefresh && page === 1) {
        const cachedComments = getCachedComments(projectId);
        if (cachedComments) {
          setComments((prev) => ({
            ...prev,
            [projectId]: {
              data: cachedComments.comments,
              pagination: cachedComments.pagination,
            },
          }));
          return;
        }
      }

      if (page === 1) {
        setActionLoading((prev) => ({
          ...prev,
          comment: true,
        }));
      }

      try {
        const response = await ShowcaseService.getComments(projectId, page);

        if (page === 1) {
          setComments((prev) => ({
            ...prev,
            [projectId]: {
              data: response.comments,
              pagination: response.pagination,
            },
          }));
          setCachedComments(projectId, response.comments, response.pagination);
        } else {
          setComments((prev) => ({
            ...prev,
            [projectId]: {
              data: [...(prev[projectId]?.data ?? []), ...response.comments],
              pagination: response.pagination,
            },
          }));
        }
      } catch (err) {
        setError(
          `Failed to get project comments: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setActionLoading((prev) => ({
          ...prev,
          comment: false,
        }));
      }
    },
    [user, setError, setActionLoading, getCachedComments, setCachedComments]
  );

  const createProjectUpdate = useCallback(
    async (projectId: string, data: CreateProjectUpdateInterface) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      try {
        const response = await ShowcaseService.createProjectUpdate(
          projectId,
          data
        );
        setUpdates((prev) => {
          const existingUpdates = prev[projectId] || [];
          return {
            ...prev,
            [projectId]: [response, ...existingUpdates],
          };
        });
      } catch (err) {
        setError(
          `Failed to create project update: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    },
    [user, setError]
  );

  const getProjectUpdates = useCallback(
    async (projectId: string) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      setActionLoading((prev) => ({ ...prev, updates: true }));
      try {
        const response = await ShowcaseService.getProjectUpdates(projectId);
        setUpdates((prev) => {
          return {
            ...prev,
            [projectId]: response,
          };
        });
      } catch (err) {
        setError(
          `Failed to get project updates: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setActionLoading((prev) => ({ ...prev, updates: false }));
      }
    },
    [user, setError, setActionLoading]
  );

  const getSeekingOptions = useCallback(
    async (projectId: string): Promise<void> => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      if (seekingOptions[projectId]) {
        return;
      }
      setActionLoading((prev) => ({ ...prev, seekingOptions: true }));
      try {
        const options = await ShowcaseService.getSeekingOptions(projectId);
        setSeekingOptions((prev) => ({
          ...prev,
          [projectId]: options,
        }));
      } catch (err) {
        console.error('Failed to fetch seeking options:', err);
      } finally {
        setActionLoading((prev) => ({ ...prev, seekingOptions: false }));
      }
    },
    [seekingOptions, user, setError, setActionLoading]
  );

  return {
    comments,
    updates,
    seekingOptions,
    createComment,
    getComments,
    createProjectUpdate,
    getProjectUpdates,
    getSeekingOptions,
  };
};
