import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  FC,
  ReactNode,
} from 'react';
import { subCommunityService } from '../services/subCommunityService';
import { useSubCommunityMembership } from './hooks/useSubCommunityMembership';
import { useSubCommunityMyCommunities } from './hooks/useSubCommunityMyCommunities';
import { useSubCommunityTypeListing } from './hooks/useSubCommunityTypeListing';
import {
  SubCommunity,
  SubCommunityMember,
  JoinRequest,
  SubCommunityCreationRequest,
  SubCommunityRole,
  CreateSubCommunityRequestDto,
  ApproveJoinRequestDto,
  SubCommunityTypeResponse,
  SubCommunityType,
  UpdateSubCommunityDto,
  SubCommunityFilterParams,
} from '../types/subCommunity';
import { useAuth } from './AuthContext';

interface SubCommunityContextType {
  // State
  subCommunities: SubCommunity[];
  subCommunitiesByType: SubCommunity[];
  types: SubCommunityType[];
  currentSubCommunity: SubCommunity | null;
  subCommunityCache: Record<string, SubCommunityTypeResponse>;
  members: SubCommunityMember[];
  joinRequests: JoinRequest[];
  creationRequests: SubCommunityCreationRequest[];
  loading: boolean;
  error: string;

  // Actions - All return Promise<void>
  getAllSubCommunities: () => Promise<void>;
  // Ensure helpers - idempotent loaders to avoid duplicate requests
  ensureAllSubCommunities: (forceRefresh?: boolean) => Promise<void>;
  getSubCommunity: (id: string) => Promise<void>;
  getSubCommunityByType: (
    type: string,
    page?: number,
    limit?: number,
    q?: string,
    forceRefresh?: boolean,
    filters?: SubCommunityFilterParams
  ) => Promise<SubCommunityTypeResponse>;
  // Per-type paging helpers
  ensureTypeLoaded: (
    type: string,
    limit?: number,
    q?: string,
    filters?: SubCommunityFilterParams
  ) => Promise<void>;
  loadMoreForType: (
    type: string,
    limit?: number,
    q?: string,
    filters?: SubCommunityFilterParams
  ) => Promise<void>;
  // Active filters
  activeFilters: SubCommunityFilterParams;
  setActiveFilters: (filters: SubCommunityFilterParams) => void;
  createSubCommunity: (data: {
    name: string;
    description: string;
    isPrivate: boolean;
    ownerId: string;
  }) => Promise<void>;
  updateSubCommunity: (
    id: string,
    data: UpdateSubCommunityDto
  ) => Promise<void>;
  deleteSubCommunity: (id: string) => Promise<void>;
  requestToJoin: (subCommunityId: string) => Promise<void>;
  getPendingJoinRequests: (subCommunityId: string) => Promise<void>;
  approveJoinRequest: (
    subCommunityId: string,
    joinRequestId: string,
    dto: ApproveJoinRequestDto
  ) => Promise<void>;
  leaveSubCommunity: (subCommunityId: string) => Promise<void>;
  removeMember: (subCommunityId: string, memberId: string) => Promise<void>;
  updateMemberRole: (
    subCommunityId: string,
    memberId: string,
    role: SubCommunityRole
  ) => Promise<void>;
  createSubCommunityRequest: (
    dto: CreateSubCommunityRequestDto,
    documents?: File[]
  ) => Promise<void>;
  getAllSubCommunityRequests: () => Promise<void>;
  approveSubCommunityRequest: (requestId: string) => Promise<void>;
  rejectSubCommunityRequest: (requestId: string) => Promise<void>;

  // Utilities
  setError: (error: string) => void;
  clearError: () => void;
  ensureTypes: () => Promise<SubCommunityType[]>;
  // helpers
  isLoadingForType: (type: string) => boolean;
  hasMoreForType: (
    type: string,
    limit?: number,
    q?: string,
    filters?: SubCommunityFilterParams
  ) => boolean;
  getRemainingForType: (
    type: string,
    limit?: number,
    q?: string,
    filters?: SubCommunityFilterParams
  ) => number | undefined;
  // Whether any per-section load is currently in progress
  isAnySectionLoading: () => boolean;
  // Whether a section-level load is currently in progress (useful for UI)
  sectionLoadInProgress: boolean;
  // My communities (owned/moderated/member) with pagination
  mySubCommunities: {
    owned: SubCommunityTypeResponse;
    moderated: SubCommunityTypeResponse;
    member: SubCommunityTypeResponse;
  } | null;
  fetchMySubCommunities: (opts?: {
    ownedPage?: number;
    ownedLimit?: number;
    moderatedPage?: number;
    moderatedLimit?: number;
    memberPage?: number;
    memberLimit?: number;
  }) => Promise<{
    owned: SubCommunityTypeResponse;
    moderated: SubCommunityTypeResponse;
    member: SubCommunityTypeResponse;
  }>;
  // Enqueue a type (or 'all') for scheduled loading. LazySection calls this
  // to ensure its type will be fetched eventually.
  scheduleTypeLoad: (
    type: string,
    limit?: number,
    q?: string,
    filters?: SubCommunityFilterParams
  ) => Promise<void>;
}

const SubCommunityContext = createContext<SubCommunityContextType>({
  // Default state
  subCommunities: [],
  subCommunitiesByType: [],
  types: [],
  currentSubCommunity: null,
  subCommunityCache: {},
  members: [],
  joinRequests: [],
  creationRequests: [],
  loading: false,
  error: '',
  mySubCommunities: null,
  fetchMySubCommunities: async () => ({
    owned: {
      data: [],
      pagination: {
        page: 1,
        limit: 0,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
    moderated: {
      data: [],
      pagination: {
        page: 1,
        limit: 0,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
    member: {
      data: [],
      pagination: {
        page: 1,
        limit: 0,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
  }),

  // Default actions - all return void
  getAllSubCommunities: async () => {},
  ensureAllSubCommunities: async () => {},
  getSubCommunity: async () => {},
  getSubCommunityByType: async () => ({
    data: [],
    pagination: {
      page: 1,
      limit: 0,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  }),
  ensureTypeLoaded: async () => {},
  loadMoreForType: async () => {},
  scheduleTypeLoad: async () => {},
  activeFilters: {},
  setActiveFilters: () => {},
  createSubCommunity: async () => {},
  updateSubCommunity: async () => {},
  deleteSubCommunity: async () => {},
  requestToJoin: async () => {},
  getPendingJoinRequests: async () => {},
  approveJoinRequest: async () => {},
  leaveSubCommunity: async () => {},
  removeMember: async () => {},
  updateMemberRole: async () => {},
  createSubCommunityRequest: async () => {},
  getAllSubCommunityRequests: async () => {},
  approveSubCommunityRequest: async () => {},
  rejectSubCommunityRequest: async () => {},

  // Default utilities
  setError: () => {},
  clearError: () => {},
  ensureTypes: async () => [],
  isLoadingForType: () => false,
  hasMoreForType: () => false,
  getRemainingForType: () => undefined,
  isAnySectionLoading: () => false,
  sectionLoadInProgress: false,
});

// When any section-level load is in progress (one at a time due to semaphore)
// this flag is true. Consumers can use it to block scrolling or show a
// global skeleton indicator.
export const SubCommunityProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentSubCommunity, setCurrentSubCommunity] =
    useState<SubCommunity | null>(null);
  const [loading, setLoading] = useState(false);
  // Per-action loading flags to avoid global page reloads when mutating
  // specific entities (e.g. removing a member, requesting to join).
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );

  const setActionLoadingFlag = useCallback((key: string, value: boolean) => {
    setActionLoading((prev) => ({ ...prev, [key]: value }));
  }, []);

  const isActionLoading = useCallback(
    (key: string) => !!actionLoading[key],
    [actionLoading]
  );
  // When any section-level load is in progress (one at a time due to semaphore)
  // this flag is true. Consumers can use it to block scrolling or show a
  // global skeleton indicator.
  const [sectionLoadInProgress, setSectionLoadInProgress] = useState(false);
  const [error, setErrorState] = useState('');

  const { user } = useAuth();

  const setError = useCallback((errorMessage: string) => {
    setErrorState(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setErrorState('');
  }, []);

  // Simple semaphore to limit concurrent network loads for section fetching.
  // Allows one concurrent load at a time to avoid bursts when many
  // IntersectionObservers fire together.
  const semaphoreRef = useRef({ permits: 1, queue: [] as Array<() => void> });

  const acquireSectionLoadPermit = useCallback((): Promise<() => void> => {
    return new Promise((resolve) => {
      const tryAcquire = () => {
        if (semaphoreRef.current.permits > 0) {
          semaphoreRef.current.permits--;
          resolve(() => {
            semaphoreRef.current.permits++;
            const next = semaphoreRef.current.queue.shift();
            if (next) next();
          });
        } else {
          semaphoreRef.current.queue.push(tryAcquire);
        }
      };
      tryAcquire();
    });
  }, []);

  const {
    subCommunities,
    setSubCommunities,
    subCommunityCache,
    subCommunitiesByType,
    types,
    activeFilters,
    setActiveFilters,
    getAllSubCommunities,
    ensureAllSubCommunities,
    ensureTypes,
    getSubCommunityByType,
    ensureTypeLoaded,
    loadMoreForType,
    isLoadingForType,
    hasMoreForType,
    getRemainingForType,
    isAnySectionLoading,
    scheduleTypeLoad,
    resetTypeCache,
  } = useSubCommunityTypeListing({
    setLoading,
    setError,
    sectionLoadInProgress,
    setSectionLoadInProgress,
    acquireSectionLoadPermit,
  });

  const getSubCommunity = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const data = await subCommunityService.getSubCommunity(id);
        setCurrentSubCommunity(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to fetch sub-community');
        } else {
          setError('An unexpected error occurred');
          console.error('Unexpected error:', err);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setError]
  );

  const createSubCommunity = useCallback(
    async (data: {
      name: string;
      description: string;
      isPrivate: boolean;
      ownerId: string;
    }) => {
      const key = `createSubCommunity`;
      setActionLoadingFlag(key, true);
      try {
        const newSubCommunity =
          await subCommunityService.createSubCommunity(data);
        setSubCommunities((prev: SubCommunity[]) => [...prev, newSubCommunity]);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to create sub-community');
        } else {
          setError('Failed to create sub-community');
        }
        throw err;
      } finally {
        setActionLoadingFlag(key, false);
      }
    },
    [setError, setActionLoadingFlag, setSubCommunities]
  );

  const updateSubCommunity = useCallback(
    async (id: string, data: UpdateSubCommunityDto) => {
      setLoading(true);
      try {
        const updated = await subCommunityService.updateSubCommunity(id, data);
        setSubCommunities((prev: SubCommunity[]) =>
          prev.map((sc: SubCommunity) => (sc.id === id ? updated : sc))
        );
        setCurrentSubCommunity((prev: SubCommunity | null) =>
          prev?.id === id ? updated : prev
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to update sub-community');
        } else {
          setError('Failed to update sub-community');
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setError, setSubCommunities]
  );

  const deleteSubCommunity = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await subCommunityService.deleteSubCommunity(id);
        setSubCommunities((prev: SubCommunity[]) =>
          prev.filter((sc: SubCommunity) => sc.id !== id)
        );
        setCurrentSubCommunity((prev: SubCommunity | null) =>
          prev?.id === id ? null : prev
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to delete sub-community');
        } else {
          setError('Failed to delete sub-community');
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setError, setSubCommunities]
  );

  const {
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
  } = useSubCommunityMembership({
    userId: user?.id,
    setError,
    setLoading,
    setActionLoadingFlag,
  });

  const { mySubCommunities, fetchMySubCommunities } =
    useSubCommunityMyCommunities({
      acquireSectionLoadPermit,
      setLoading,
      setSectionLoadInProgress,
      setError,
    });

  // Load initial data moved to consumers; use `ensureAllSubCommunities()` instead

  const contextValue = useMemo(
    () => ({
      // State
      subCommunities,
      subCommunitiesByType,
      subCommunityCache,
      currentSubCommunity,
      members,
      joinRequests,
      creationRequests,
      loading,
      // Per-action loading map and helper
      actionLoading,
      isActionLoading,
      error,

      // Actions
      getAllSubCommunities,
      getSubCommunity,
      getSubCommunityByType,
      createSubCommunity,
      updateSubCommunity,
      deleteSubCommunity,
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

      // types
      types,
      // idempotent loaders
      ensureAllSubCommunities,
      ensureTypes,
      ensureTypeLoaded,
      loadMoreForType,
      isLoadingForType,
      hasMoreForType,
      getRemainingForType,

      sectionLoadInProgress,
      isAnySectionLoading,

      // my communities
      mySubCommunities,
      fetchMySubCommunities,
      // scheduling
      scheduleTypeLoad,
      resetTypeCache,

      // filters
      activeFilters,
      setActiveFilters,

      // Utilities
      setError,
      clearError,
    }),
    [
      subCommunities,
      subCommunitiesByType,
      subCommunityCache,
      currentSubCommunity,
      members,
      joinRequests,
      creationRequests,
      loading,
      error,
      getAllSubCommunities,
      getSubCommunity,
      getSubCommunityByType,
      createSubCommunity,
      updateSubCommunity,
      deleteSubCommunity,
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
      types,
      ensureAllSubCommunities,
      ensureTypes,
      ensureTypeLoaded,
      loadMoreForType,
      isLoadingForType,
      isAnySectionLoading,
      hasMoreForType,
      getRemainingForType,
      sectionLoadInProgress,
      mySubCommunities,
      fetchMySubCommunities,
      scheduleTypeLoad,
      resetTypeCache,
      actionLoading,
      isActionLoading,
      activeFilters,
      setActiveFilters,
      setError,
      clearError,
    ]
  );

  return (
    <SubCommunityContext.Provider value={contextValue}>
      {children}
    </SubCommunityContext.Provider>
  );
};

export const useSubCommunity = () => {
  const context = useContext(SubCommunityContext);
  if (!context) {
    throw new Error(
      'useSubCommunity must be used within a SubCommunityProvider'
    );
  }
  return context;
};
