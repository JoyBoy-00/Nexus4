import { useCallback, useState } from 'react';
import { subCommunityService } from '../../services/subCommunityService';
import {
  ApproveJoinRequestDto,
  CreateSubCommunityRequestDto,
  JoinRequest,
  SubCommunityCreationRequest,
  SubCommunityMember,
  SubCommunityRole,
} from '../../types/subCommunity';
import { getErrorMessage } from '@/utils/errorHandler';

interface UseSubCommunityMembershipOptions {
  userId?: string;
  setError: (message: string) => void;
  setLoading: (value: boolean) => void;
  setActionLoadingFlag: (key: string, value: boolean) => void;
}

export const useSubCommunityMembership = ({
  userId,
  setError,
  setLoading,
  setActionLoadingFlag,
}: UseSubCommunityMembershipOptions) => {
  const [members, setMembers] = useState<SubCommunityMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [creationRequests, setCreationRequests] = useState<
    SubCommunityCreationRequest[]
  >([]);

  const requestToJoin = useCallback(
    async (subCommunityId: string) => {
      const key = `requestToJoin:${subCommunityId}`;
      setActionLoadingFlag(key, true);
      try {
        const joinRequest =
          await subCommunityService.requestToJoin(subCommunityId);
        setJoinRequests((prev) => [...prev, joinRequest]);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setActionLoadingFlag(key, false);
      }
    },
    [setActionLoadingFlag, setError]
  );

  const getPendingJoinRequests = useCallback(
    async (subCommunityId: string) => {
      setLoading(true);
      try {
        const requests =
          await subCommunityService.getPendingJoinRequests(subCommunityId);
        setJoinRequests(requests);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to fetch join requests');
        } else {
          setError('Failed to fetch join requests');
        }
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading]
  );

  const approveJoinRequest = useCallback(
    async (
      subCommunityId: string,
      joinRequestId: string,
      dto: ApproveJoinRequestDto
    ) => {
      setLoading(true);
      try {
        const updated = await subCommunityService.approveJoinRequest(
          subCommunityId,
          joinRequestId,
          dto
        );
        // Preserve nested fields (e.g. user) if backend returns partial updates.
        setJoinRequests((prev) =>
          prev.map((jr) =>
            jr.id === joinRequestId ? { ...jr, ...updated } : jr
          )
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to approve join request');
        } else {
          setError('Failed to approve join request');
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading]
  );

  const leaveSubCommunity = useCallback(
    async (subCommunityId: string) => {
      const key = `leave:${subCommunityId}`;
      setActionLoadingFlag(key, true);
      try {
        await subCommunityService.leaveSubCommunity(subCommunityId);
        setMembers((prev) => prev.filter((member) => member.userId !== userId));
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to leave sub-community');
        } else {
          setError('Failed to leave sub-community');
        }
        throw err;
      } finally {
        setActionLoadingFlag(key, false);
      }
    },
    [setActionLoadingFlag, setError, userId]
  );

  const removeMember = useCallback(
    async (subCommunityId: string, memberId: string) => {
      const key = `removeMember:${memberId}`;
      setActionLoadingFlag(key, true);
      try {
        await subCommunityService.removeMember(subCommunityId, memberId);
        setMembers((prev) =>
          prev.filter((member) => member.userId !== memberId)
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to remove member');
        } else {
          setError('Failed to remove member');
        }
        throw err;
      } finally {
        setActionLoadingFlag(key, false);
      }
    },
    [setActionLoadingFlag, setError]
  );

  const updateMemberRole = useCallback(
    async (
      subCommunityId: string,
      memberId: string,
      role: SubCommunityRole
    ) => {
      const key = `updateMemberRole:${memberId}`;
      setActionLoadingFlag(key, true);
      try {
        const updated = await subCommunityService.updateMemberRole(
          subCommunityId,
          memberId,
          { role }
        );
        setMembers((prev) =>
          prev.map((member) => (member.id === updated.id ? updated : member))
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to update member role');
        } else {
          setError('Failed to update member role');
        }
        throw err;
      } finally {
        setActionLoadingFlag(key, false);
      }
    },
    [setActionLoadingFlag, setError]
  );

  const createSubCommunityRequest = useCallback(
    async (dto: CreateSubCommunityRequestDto) => {
      const key = 'createSubCommunityRequest';
      setActionLoadingFlag(key, true);
      try {
        const request =
          await subCommunityService.createSubCommunityRequest(dto);
        setCreationRequests((prev) => [...prev, request]);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to create sub-community request');
        } else {
          setError('Failed to create sub-community request');
        }
        throw err;
      } finally {
        setActionLoadingFlag(key, false);
      }
    },
    [setActionLoadingFlag, setError]
  );

  const getAllSubCommunityRequests = useCallback(async () => {
    setLoading(true);
    try {
      const requests = await subCommunityService.getAllSubCommunityRequests();
      setCreationRequests(requests);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to fetch sub-community requests');
      } else {
        setError('Failed to fetch sub-community requests');
      }
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  const approveSubCommunityRequest = useCallback(
    async (requestId: string) => {
      const key = `approveSubCommunityRequest:${requestId}`;
      setActionLoadingFlag(key, true);
      try {
        const updated =
          await subCommunityService.approveSubCommunityRequest(requestId);
        setCreationRequests((prev) =>
          prev.map((request) => (request.id === requestId ? updated : request))
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to approve sub-community request');
        } else {
          setError('Failed to approve sub-community request');
        }
        throw err;
      } finally {
        setActionLoadingFlag(key, false);
      }
    },
    [setActionLoadingFlag, setError]
  );

  const rejectSubCommunityRequest = useCallback(
    async (requestId: string) => {
      const key = `rejectSubCommunityRequest:${requestId}`;
      setActionLoadingFlag(key, true);
      try {
        const updated =
          await subCommunityService.rejectSubCommunityRequest(requestId);
        setCreationRequests((prev) =>
          prev.map((request) => (request.id === requestId ? updated : request))
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to reject sub-community request');
        } else {
          setError('Failed to reject sub-community request');
        }
        throw err;
      } finally {
        setActionLoadingFlag(key, false);
      }
    },
    [setActionLoadingFlag, setError]
  );

  return {
    members,
    joinRequests,
    creationRequests,
    requestToJoin,
    getPendingJoinRequests,
    approveJoinRequest,
    leaveSubCommunity,
    removeMember,
    updateMemberRole,
    createSubCommunityRequest,
    getAllSubCommunityRequests,
    approveSubCommunityRequest,
    rejectSubCommunityRequest,
  };
};
