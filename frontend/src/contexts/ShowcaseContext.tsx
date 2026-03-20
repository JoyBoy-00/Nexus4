import {
  CollaborationRequestInterface,
  CollaborationStatus,
  CommentPaginationResponse,
  CreateCollaborationRequestInterface,
  CreateProjectInterface,
  CreateProjectUpdateInterface,
  FilterProjectInterface,
  PaginatedProjectsInterface,
  ProjectComment,
  ProjectDetailInterface,
  ProjectTeam,
  ProjectUpdateInterface,
  Tags,
} from '@/types/ShowcaseType';
import { createContext, FC, useCallback, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  useShowcaseLoadingState,
  useShowcaseTypes,
  useShowcaseCollaboration,
  useShowcaseCache,
  useShowcaseEngagement,
  useShowcaseTeamMembers,
  useShowcaseProjectReactions,
  useShowcaseProjectCore,
} from './hooks';

// Cache interfaces
interface ProjectCache {
  project: ProjectDetailInterface;
  lastFetched: number;
  updates: ProjectUpdateInterface[];
}

export interface ShowcaseContextType {
  // States
  projectCounts: {
    total: number;
    owned: number;
    supported: number;
    followed: number;
  };
  allProjects: PaginatedProjectsInterface;
  // projects: ProjectInterface[];
  projectsByUserId: PaginatedProjectsInterface;
  myProjects: PaginatedProjectsInterface;
  supportedProjects: PaginatedProjectsInterface;
  followedProjects: PaginatedProjectsInterface;
  projectsCache: Map<string, ProjectCache>;
  projectById: ProjectDetailInterface | null;
  collaborationRequests: CollaborationRequestInterface[];
  loading: boolean;
  actionLoading: {
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
  comments: Record<
    string,
    {
      data: ProjectComment[];
      pagination: CommentPaginationResponse;
    }
  >;
  updates: Record<string, ProjectUpdateInterface[]>;
  seekingOptions: Record<string, string[]>;
  teamMembers: Record<string, ProjectTeam[]>;
  error: string | null;
  clearError: () => void;

  // Cache info (for debugging/development)
  cacheInfo: {
    projects: number;
    comments: number;
  };

  allTypes: Tags[];
  typeLoading: boolean;

  // Actions
  refreshProjects: (tab: number) => Promise<void>;
  createProject: (data: CreateProjectInterface) => Promise<void>;
  updateProject: (
    projectId: string,
    data: Partial<CreateProjectInterface>
  ) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  getProjectCounts: () => Promise<void>;
  getAllProjects: (
    filterProjectDto?: FilterProjectInterface | undefined,
    loadMore?: boolean
  ) => Promise<void>;
  getProjectById: (
    projectId: string,
    detailed?: boolean,
    forceRefresh?: boolean,
    tab?: number
  ) => Promise<void>;
  getProjectsByUserId: (
    ownerId?: string,
    filterProjectDto?: FilterProjectInterface | undefined,
    loadMore?: boolean
  ) => Promise<void>;
  getSupportedProjects: (
    filterProjectDto?: FilterProjectInterface | undefined,
    loadMore?: boolean
  ) => Promise<void>;
  getFollowedProjects: (
    filterProjectDto?: FilterProjectInterface | undefined,
    loadMore?: boolean
  ) => Promise<void>;
  getProjectForSharing: (
    projectId: string
  ) => Promise<ProjectDetailInterface | null>;
  createProjectUpdate: (
    projectId: string,
    data: CreateProjectUpdateInterface
  ) => Promise<void>;
  getProjectUpdates: (projectId: string) => Promise<void>;
  supportProject: (projectId: string) => Promise<void>;
  unsupportProject: (projectId: string) => Promise<void>;
  followProject: (projectId: string) => Promise<void>;
  unfollowProject: (projectId: string) => Promise<void>;
  requestCollaboration: (
    projectId: string,
    data: CreateCollaborationRequestInterface
  ) => Promise<void>;
  updateStatusCollaboration: (
    requestId: string,
    projectId: string,
    status: CollaborationStatus
  ) => Promise<void>;
  getCollaborationRequests: (projectId: string) => Promise<void>;
  createComment: (projectId: string, comment: string) => Promise<void>;
  getComments: (
    projectId: string,
    page?: number,
    forceRefresh?: boolean
  ) => Promise<void>;
  createProjectTeamMember: (
    projectId: string,
    data: ProjectTeam
  ) => Promise<void>;
  getProjectTeamMembers: (projectId: string) => Promise<void>;
  removeProjectTeamMember: (projectId: string, userId: string) => Promise<void>;
  getSeekingOptions: (projectId: string) => Promise<void>;
  clearProjectsCache: () => void;
  clearSpecificCache: (projectId: string) => void; // New method to clear specific cache
  fetchAllTypes: () => Promise<void>;
}

const ShowcaseContext = createContext<ShowcaseContextType>({
  // Initial states
  projectCounts: { total: 0, owned: 0, supported: 0, followed: 0 },
  allProjects: {
    data: [],
    pagination: { nextCursor: undefined, hasNext: false },
  },
  // projects: [],
  projectsByUserId: {
    data: [],
    pagination: { nextCursor: undefined, hasNext: false },
  },
  myProjects: {
    data: [],
    pagination: { nextCursor: undefined, hasNext: false },
  },
  supportedProjects: {
    data: [],
    pagination: { nextCursor: undefined, hasNext: false },
  },
  followedProjects: {
    data: [],
    pagination: { nextCursor: undefined, hasNext: false },
  },
  projectsCache: new Map(),
  projectById: null,
  collaborationRequests: [],
  loading: false,
  actionLoading: {
    teamMembers: false,
    refresh: false,
    count: false,
    support: new Set<string>(),
    follow: new Set<string>(),
    comment: false,
    updates: false,
    seekingOptions: false,
    projectDetails: new Set<string>(),
  },
  comments: {},
  updates: {},
  cacheInfo: { projects: 0, comments: 0 },
  teamMembers: {},
  seekingOptions: {},
  allTypes: [],
  error: null,
  typeLoading: false,
  clearError: () => {},
  clearSpecificCache: () => {},

  //actions
  refreshProjects: async () => {},
  createProject: async () => {},
  updateProject: async () => {},
  deleteProject: async () => {},
  getProjectCounts: async () => {},
  getAllProjects: async () => {},
  getProjectById: async () => {},
  getProjectsByUserId: async () => {},
  getSupportedProjects: async () => {},
  getFollowedProjects: async () => {},
  getProjectForSharing: async () => null,
  createProjectUpdate: async () => {},
  getProjectUpdates: async () => {},
  supportProject: async () => {},
  unsupportProject: async () => {},
  followProject: async () => {},
  unfollowProject: async () => {},
  requestCollaboration: async () => {},
  updateStatusCollaboration: async () => {},
  getCollaborationRequests: async () => {},
  createComment: async () => {},
  getComments: async () => {},
  createProjectTeamMember: async () => {},
  getProjectTeamMembers: async () => {},
  removeProjectTeamMember: async () => {},
  getSeekingOptions: async () => {},
  clearProjectsCache: () => {},
  fetchAllTypes: async () => {},
});

const ShowcaseProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    loading,
    setLoading,
    actionLoading,
    setActionLoading,
    error,
    setError,
    clearError,
  } = useShowcaseLoadingState();
  const { user } = useAuth();

  // Project core state/actions are composed from a focused hook

  const {
    collaborationRequests,
    requestCollaboration,
    getCollaborationRequests,
    updateStatusCollaboration,
  } = useShowcaseCollaboration(setError, setLoading);
  const {
    teamMembers,
    createProjectTeamMember,
    getProjectTeamMembers,
    removeProjectTeamMember,
  } = useShowcaseTeamMembers({
    setError,
    setLoading,
    setActionLoading,
  });

  const {
    projectsCache,
    getCachedProject,
    setCachedProject,
    getCachedComments,
    setCachedComments,
    clearSpecificCache: clearSpecificCacheFromHook,
    clearProjectsCache: clearProjectsCacheFromHook,
    normalizeFilterForCompare,
    cacheInfo,
  } = useShowcaseCache();

  const {
    projectCounts,
    setProjectCounts,
    allProjects,
    setAllProjects,
    projectsByUserId,
    setProjectsByUserId,
    myProjects,
    supportedProjects,
    setSupportedProjects,
    followedProjects,
    setFollowedProjects,
    projectById,
    setProjectById,
    createProject,
    updateProject,
    deleteProject,
    getProjectCounts,
    getAllProjects,
    getProjectById,
    getProjectsByUserId,
    getSupportedProjects,
    getFollowedProjects,
    getProjectForSharing,
    clearProjectsState,
  } = useShowcaseProjectCore({
    loading,
    setLoading,
    setError,
    setActionLoading,
    normalizeFilterForCompare,
    getCachedProject,
    setCachedProject,
    clearSpecificCacheFromHook,
  });

  const {
    comments,
    updates,
    seekingOptions,
    createComment,
    getComments,
    createProjectUpdate,
    getProjectUpdates,
    getSeekingOptions,
  } = useShowcaseEngagement({
    setError,
    setProjectById,
    setActionLoading,
    getCachedComments,
    setCachedComments,
  });

  const { allTypes, typeLoading, fetchAllTypes } = useShowcaseTypes();

  const { supportProject, unsupportProject, followProject, unfollowProject } =
    useShowcaseProjectReactions({
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
    });

  // Refresh projects based on active tab
  const refreshProjects = useCallback(
    async (tab: number) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      setActionLoading((prev) => ({ ...prev, refresh: true }));
      try {
        console.log('Refreshing projects for tab:', tab);
        getProjectCounts();
        if (tab === 0) await getAllProjects({ pageSize: 12 }, false, true);
        if (tab === 1)
          await getProjectsByUserId(user.id, { pageSize: 12 }, false, true);
        if (tab === 2)
          await getSupportedProjects({ pageSize: 12 }, false, true);
        if (tab === 3) await getFollowedProjects({ pageSize: 12 }, false, true);
      } catch (err) {
        setError(
          `Failed to refresh projects: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setActionLoading((prev) => ({ ...prev, refresh: false }));
      }
    },
    [
      getAllProjects,
      getFollowedProjects,
      getProjectCounts,
      getProjectsByUserId,
      getSupportedProjects,
      setActionLoading,
      setError,
      user,
    ]
  );

  // New method to clear specific project cache
  const clearSpecificCache = useCallback(
    (projectId: string) => {
      clearSpecificCacheFromHook(projectId);
    },
    [clearSpecificCacheFromHook]
  );

  const clearProjectsCache = useCallback(() => {
    clearProjectsState();
    clearProjectsCacheFromHook();
  }, [clearProjectsState, clearProjectsCacheFromHook]);

  const state: ShowcaseContextType = useMemo(
    () => ({
      projectCounts,
      allProjects,
      projectsByUserId,
      myProjects,
      supportedProjects,
      followedProjects,
      projectsCache,
      projectById,
      updates,
      collaborationRequests,
      loading,
      actionLoading,
      error,
      comments,
      teamMembers,
      cacheInfo,
      seekingOptions,
      allTypes,
      typeLoading,

      // Cache management
      clearError,
      clearSpecificCache,

      // Actions (include all the existing ones)
      refreshProjects,
      createProject,
      updateProject,
      deleteProject,
      getProjectCounts,
      getAllProjects,
      getProjectById,
      getProjectsByUserId,
      getSupportedProjects,
      getFollowedProjects,
      getProjectForSharing,
      createProjectUpdate,
      getProjectUpdates,
      supportProject,
      unsupportProject,
      followProject,
      unfollowProject,
      requestCollaboration,
      updateStatusCollaboration,
      getCollaborationRequests,
      createComment,
      getComments,
      createProjectTeamMember,
      getProjectTeamMembers,
      removeProjectTeamMember,
      getSeekingOptions,
      clearProjectsCache,
      fetchAllTypes,
    }),
    [
      projectCounts,
      allProjects,
      projectsByUserId,
      myProjects,
      supportedProjects,
      followedProjects,
      projectsCache,
      projectById,
      updates,
      collaborationRequests,
      loading,
      actionLoading,
      cacheInfo,
      error,
      comments,
      teamMembers,
      seekingOptions,
      allTypes,
      typeLoading,
      clearError,
      refreshProjects,
      createProject,
      updateProject,
      deleteProject,
      getProjectCounts,
      getAllProjects,
      getProjectById,
      getProjectsByUserId,
      getSupportedProjects,
      getFollowedProjects,
      getProjectForSharing,
      createProjectUpdate,
      getProjectUpdates,
      supportProject,
      unsupportProject,
      followProject,
      unfollowProject,
      requestCollaboration,
      updateStatusCollaboration,
      getCollaborationRequests,
      createComment,
      getComments,
      createProjectTeamMember,
      getProjectTeamMembers,
      removeProjectTeamMember,
      getSeekingOptions,
      clearProjectsCache,
      clearSpecificCache,
      fetchAllTypes,
    ]
  );

  return (
    <ShowcaseContext.Provider value={state}>
      {children}
    </ShowcaseContext.Provider>
  );
};

export const useShowcase = (): ShowcaseContextType => {
  const context = useContext(ShowcaseContext);
  if (context === undefined) {
    throw new Error('useShowcase must be used within a ShowcaseProvider');
  }
  return context;
};

export { ShowcaseContext };
export default ShowcaseProvider;
