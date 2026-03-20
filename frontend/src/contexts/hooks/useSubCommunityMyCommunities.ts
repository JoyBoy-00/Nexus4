import { useCallback, useState } from 'react';
import { subCommunityService } from '../../services/subCommunityService';
import { SubCommunityTypeResponse } from '../../types/subCommunity';

interface FetchMySubCommunitiesOptions {
  ownedPage?: number;
  ownedLimit?: number;
  moderatedPage?: number;
  moderatedLimit?: number;
  memberPage?: number;
  memberLimit?: number;
}

interface UseSubCommunityMyCommunitiesOptions {
  acquireSectionLoadPermit: () => Promise<() => void>;
  setLoading: (value: boolean) => void;
  setSectionLoadInProgress: (value: boolean) => void;
  setError: (message: string) => void;
}

export const useSubCommunityMyCommunities = ({
  acquireSectionLoadPermit,
  setLoading,
  setSectionLoadInProgress,
  setError,
}: UseSubCommunityMyCommunitiesOptions) => {
  const [mySubCommunities, setMySubCommunities] = useState<{
    owned: SubCommunityTypeResponse;
    moderated: SubCommunityTypeResponse;
    member: SubCommunityTypeResponse;
  } | null>(null);

  const fetchMySubCommunities = useCallback(
    async (opts?: FetchMySubCommunitiesOptions) => {
      setLoading(true);
      const release = await acquireSectionLoadPermit();
      setSectionLoadInProgress(true);
      try {
        const defaultEmpty = {
          data: [],
          pagination: {
            page: 1,
            limit: 0,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        } as SubCommunityTypeResponse;

        let ownedResp: SubCommunityTypeResponse | undefined;
        let moderatedResp: SubCommunityTypeResponse | undefined;
        let memberResp: SubCommunityTypeResponse | undefined;

        const shouldFetchOwned =
          !opts ||
          opts.ownedPage !== undefined ||
          opts.ownedLimit !== undefined;
        const shouldFetchModerated =
          opts?.moderatedPage !== undefined ||
          opts?.moderatedLimit !== undefined;
        const shouldFetchMember =
          opts?.memberPage !== undefined || opts?.memberLimit !== undefined;

        if (shouldFetchOwned) {
          ownedResp = await subCommunityService.getMyOwnedSubCommunities(
            opts?.ownedPage ?? 1,
            opts?.ownedLimit ?? 6
          );
        }

        if (shouldFetchModerated) {
          moderatedResp =
            await subCommunityService.getMyModeratedSubCommunities(
              opts?.moderatedPage ?? 1,
              opts?.moderatedLimit ?? 6
            );
        }

        if (shouldFetchMember) {
          memberResp = await subCommunityService.getMyMemberSubCommunities(
            opts?.memberPage ?? 1,
            opts?.memberLimit ?? 6
          );
        }

        const combined = ((prev) => {
          const existing = prev ?? {
            owned: defaultEmpty,
            moderated: defaultEmpty,
            member: defaultEmpty,
          };
          return {
            owned: ownedResp ?? existing.owned ?? defaultEmpty,
            moderated: moderatedResp ?? existing.moderated ?? defaultEmpty,
            member: memberResp ?? existing.member ?? defaultEmpty,
          };
        })(mySubCommunities);

        setMySubCommunities(combined);
        return combined;
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to fetch my sub-communities');
        } else {
          setError('Failed to fetch my sub-communities');
        }
        throw err;
      } finally {
        release();
        setLoading(false);
        setSectionLoadInProgress(false);
      }
    },
    [
      acquireSectionLoadPermit,
      mySubCommunities,
      setError,
      setLoading,
      setSectionLoadInProgress,
    ]
  );

  return {
    mySubCommunities,
    fetchMySubCommunities,
  };
};
