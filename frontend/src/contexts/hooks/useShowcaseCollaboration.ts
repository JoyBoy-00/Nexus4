import { useState, useCallback } from 'react';
import type {
  CollaborationRequestInterface,
  CollaborationStatus,
  CreateCollaborationRequestInterface,
} from '@/types/ShowcaseType';
import { ShowcaseService } from '@/services/ShowcaseService';
import { useAuth } from '../AuthContext';

/**
 * useShowcaseCollaboration
 * Manages collaboration requests for projects
 */
export const useShowcaseCollaboration = (
  setError: (error: string) => void,
  setLoading: (loading: boolean) => void
) => {
  const [collaborationRequests, setCollaborationRequests] = useState<
    CollaborationRequestInterface[]
  >([]);
  const { user } = useAuth();

  const getCollaborationRequests = useCallback(
    async (projectId: string) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      setLoading(true);
      try {
        const response =
          await ShowcaseService.getCollaborationRequests(projectId);
        setCollaborationRequests(response);
      } catch (err) {
        setError(
          `Failed to get collaboration requests: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setLoading(false);
      }
    },
    [user, setError, setLoading]
  );

  const requestCollaboration = useCallback(
    async (projectId: string, data: CreateCollaborationRequestInterface) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      setLoading(true);
      try {
        await ShowcaseService.requestCollaboration(projectId, data);
      } catch (err) {
        setError(
          `Failed to request collaboration: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setLoading(false);
      }
    },
    [user, setError, setLoading]
  );

  const updateStatusCollaboration = useCallback(
    async (
      requestId: string,
      projectId: string,
      status: CollaborationStatus
    ) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      setLoading(true);
      try {
        await ShowcaseService.updateStatusCollaboration(requestId, status);
        // Refresh collaboration requests for the project
        await getCollaborationRequests(projectId);
      } catch (err) {
        setError(
          `Failed to update collaboration status: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setLoading(false);
      }
    },
    [user, setError, setLoading, getCollaborationRequests]
  );

  return {
    collaborationRequests,
    requestCollaboration,
    getCollaborationRequests,
    updateStatusCollaboration,
  };
};
