import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { ShowcaseService } from '@/services/ShowcaseService';
import type { ProjectTeam } from '@/types/ShowcaseType';
import { useAuth } from '../AuthContext';

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

interface UseShowcaseTeamMembersProps {
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  setActionLoading: Dispatch<SetStateAction<ShowcaseActionLoadingState>>;
}

export const useShowcaseTeamMembers = ({
  setError,
  setLoading,
  setActionLoading,
}: UseShowcaseTeamMembersProps) => {
  const [teamMembers, setTeamMembers] = useState<Record<string, ProjectTeam[]>>(
    {}
  );
  const { user } = useAuth();

  const createProjectTeamMember = useCallback(
    async (projectId: string, data: ProjectTeam) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      setLoading(true);
      try {
        await ShowcaseService.createProjectTeamMember(projectId, data);
        setTeamMembers((prev) => ({
          ...prev,
          [projectId]: [...(prev[projectId] ?? []), data],
        }));
      } catch (err) {
        setError(
          `Failed to create team member: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setLoading(false);
      }
    },
    [user, setError, setLoading]
  );

  const getProjectTeamMembers = useCallback(
    async (projectId: string) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      setActionLoading((prev) => ({
        ...prev,
        teamMembers: true,
      }));
      try {
        const response = await ShowcaseService.getProjectTeamMembers(projectId);
        setTeamMembers((prev) => ({ ...prev, [projectId]: response }));
      } catch (err) {
        setError(
          `Failed to get team members: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setActionLoading((prev) => ({
          ...prev,
          teamMembers: false,
        }));
      }
    },
    [user, setError, setActionLoading]
  );

  const removeProjectTeamMember = useCallback(
    async (projectId: string, teamMemberId: string) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      setLoading(true);
      try {
        await ShowcaseService.removeProjectTeamMember(projectId, teamMemberId);
        setTeamMembers((prev) => ({
          ...prev,
          [projectId]: (prev[projectId] ?? []).filter(
            (member) => member.id !== teamMemberId
          ),
        }));
      } catch (err) {
        setError(
          `Failed to remove team member: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setLoading(false);
      }
    },
    [user, setError, setLoading]
  );

  return {
    teamMembers,
    createProjectTeamMember,
    getProjectTeamMembers,
    removeProjectTeamMember,
  };
};
