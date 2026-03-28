import { ShowcaseService } from '@/services/ShowcaseService';
import type {
  CreateProjectInterface,
  FilterProjectInterface,
  PaginatedProjectsInterface,
  ProjectDetailInterface,
  ProjectUpdateInterface,
} from '@/types/ShowcaseType';
import { getErrorMessage } from '@/utils/errorHandler';
import { useAuth } from '../AuthContext';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

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

interface UseShowcaseProjectCoreProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  setError: (message: string) => void;
  setActionLoading: Dispatch<SetStateAction<ShowcaseActionLoadingState>>;
  normalizeFilterForCompare: (
    f?: FilterProjectInterface
  ) => Record<string, unknown>;
  getCachedProject: (projectId: string) => ProjectDetailInterface | null;
  setCachedProject: (
    projectId: string,
    project: ProjectDetailInterface,
    updates?: ProjectUpdateInterface[]
  ) => void;
  clearSpecificCacheFromHook: (projectId: string) => void;
}

export const useShowcaseProjectCore = ({
  loading,
  setLoading,
  setError,
  setActionLoading,
  normalizeFilterForCompare,
  getCachedProject,
  setCachedProject,
  clearSpecificCacheFromHook,
}: UseShowcaseProjectCoreProps) => {
  const { user } = useAuth();

  const [projectCounts, setProjectCounts] = useState({
    total: 0,
    owned: 0,
    supported: 0,
    followed: 0,
  });

  const [allProjects, setAllProjects] = useState<PaginatedProjectsInterface>({
    data: [],
    pagination: { nextCursor: undefined, hasNext: false },
  });

  const [projectsByUserId, setProjectsByUserId] =
    useState<PaginatedProjectsInterface>({
      data: [],
      pagination: {
        nextCursor: undefined,
        hasNext: false,
      },
    });

  const [myProjects, setMyProjects] = useState<PaginatedProjectsInterface>({
    data: [],
    pagination: { nextCursor: undefined, hasNext: false },
  });

  const [supportedProjects, setSupportedProjects] =
    useState<PaginatedProjectsInterface>({
      data: [],
      pagination: {
        nextCursor: undefined,
        hasNext: false,
      },
    });

  const [followedProjects, setFollowedProjects] =
    useState<PaginatedProjectsInterface>({
      data: [],
      pagination: {
        nextCursor: undefined,
        hasNext: false,
      },
    });

  const [projectById, setProjectById] = useState<ProjectDetailInterface | null>(
    null
  );

  const paginationRef = useRef(allProjects.pagination);
  const loadingRef = useRef(loading);
  const lastAllProjectsFilterRef = useRef<FilterProjectInterface | undefined>(
    undefined
  );
  const lastProjectsByUserFilterRef = useRef<
    FilterProjectInterface | undefined
  >(undefined);
  const lastSupportedProjectsFilterRef = useRef<
    FilterProjectInterface | undefined
  >(undefined);
  const lastFollowedProjectsFilterRef = useRef<
    FilterProjectInterface | undefined
  >(undefined);

  useEffect(() => {
    paginationRef.current = allProjects.pagination;
    loadingRef.current = loading;
  }, [allProjects.pagination, loading]);

  const createProject = useCallback(
    async (data: CreateProjectInterface) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      setLoading(true);
      try {
        const response = await ShowcaseService.createProject(data);
        setProjectCounts((prev) => ({
          ...prev,
          total: prev.total + 1,
          owned: prev.owned + 1,
        }));
        setMyProjects((prev) => ({
          data: [response, ...prev.data],
          pagination: prev.pagination,
        }));
      } catch (err) {
        setError(
          `Failed to create project: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setLoading(false);
      }
    },
    [user, setError, setLoading]
  );

  const updateProject = useCallback(
    async (projectId: string, data: Partial<CreateProjectInterface>) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      setLoading(true);
      try {
        const response = await ShowcaseService.updateProject(projectId, data);

        if (projectById?.id === projectId) {
          setProjectById((prev) => (prev ? { ...prev, ...response } : prev));
        }

        if (getCachedProject(projectId)) {
          setCachedProject(projectId, {
            ...(getCachedProject(projectId) || {}),
            ...response,
          } as ProjectDetailInterface);
        }
      } catch (err) {
        setError(
          `Failed to update project: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setLoading(false);
      }
    },
    [
      user,
      setError,
      setLoading,
      projectById,
      getCachedProject,
      setCachedProject,
    ]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      setLoading(true);
      try {
        await ShowcaseService.deleteProject(projectId);
        setProjectCounts((prev) => ({
          ...prev,
          total: prev.total - 1,
          owned: prev.owned - 1,
        }));
        setMyProjects((prev) => ({
          ...prev,
          data: prev.data.filter((p) => p.id !== projectId),
          pagination: prev.pagination,
        }));

        clearSpecificCacheFromHook(projectId);
        if (projectById?.id === projectId) {
          setProjectById(null);
        }
      } catch (err) {
        setError(
          `Failed to delete project: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setLoading(false);
      }
    },
    [user, setError, setLoading, clearSpecificCacheFromHook, projectById]
  );

  const getProjectCounts = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setActionLoading((prev) => ({ ...prev, count: true }));
    try {
      const counts = await ShowcaseService.getProjectCounts();
      setProjectCounts({
        total: counts.totalProjects || 0,
        owned: counts.myProjects || 0,
        supported: counts.supportedProjects || 0,
        followed: counts.followedProjects || 0,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading((prev) => ({ ...prev, count: false }));
    }
  }, [user, setError, setActionLoading]);

  const getAllProjects = useCallback(
    async (
      filterProjectDto?: FilterProjectInterface | undefined,
      loadMore: boolean = false,
      forceLoad: boolean = false
    ) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const currentPagination = paginationRef.current;
      const isLoading = loadingRef.current;
      const lastFilter = lastAllProjectsFilterRef.current;
      const currentNorm = normalizeFilterForCompare(filterProjectDto);
      const lastNorm = normalizeFilterForCompare(lastFilter);
      const currentFilterKey = JSON.stringify(currentNorm || {});
      const lastFilterKey = JSON.stringify(lastNorm || {});
      const doLoadMore = loadMore && currentFilterKey === lastFilterKey;

      if (!loadMore && !forceLoad) {
        if (allProjects.data.length > 0 && currentFilterKey === lastFilterKey)
          return;
      }
      if (doLoadMore && (isLoading || !currentPagination.hasNext)) {
        return;
      }

      if (!loadMore) setLoading(true);
      try {
        const response = await ShowcaseService.getAllProjects(filterProjectDto);

        if (doLoadMore) {
          setAllProjects((prev) => ({
            data: [...prev.data, ...response.data],
            pagination: response.pagination,
          }));
        } else {
          setAllProjects({
            data: response.data,
            pagination: response.pagination,
          });
          lastAllProjectsFilterRef.current = normalizeFilterForCompare(
            filterProjectDto as FilterProjectInterface
          );
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [
      user,
      setError,
      setLoading,
      normalizeFilterForCompare,
      allProjects.data.length,
    ]
  );

  const getProjectById = useCallback(
    async (
      projectId: string,
      detailed?: boolean,
      forceRefresh: boolean = false,
      tab?: number
    ) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      setActionLoading((prev) => ({
        ...prev,
        projectDetails: new Set(prev.projectDetails).add(projectId),
      }));

      if (!forceRefresh) {
        const cachedProject = getCachedProject(projectId);
        if (cachedProject) {
          setProjectById(cachedProject);
          setActionLoading((prev) => {
            const next = new Set(prev.projectDetails);
            next.delete(projectId);
            return { ...prev, projectDetails: next };
          });
          return;
        }
      }
      try {
        const existingProject =
          tab === 0
            ? allProjects.data.find((proj) => proj.id === projectId)
            : tab === 1
              ? myProjects.data.find((proj) => proj.id === projectId)
              : tab === 2
                ? supportedProjects.data.find((proj) => proj.id === projectId)
                : followedProjects.data.find((proj) => proj.id === projectId);

        const details = await ShowcaseService.getProjectById(
          projectId,
          detailed
        );

        const fullProject: ProjectDetailInterface = {
          ...(existingProject || {}),
          ...details,
          id: projectId,
          title: existingProject?.title || details.title || '',
          tags: existingProject?.tags || details.tags || [],
          status: existingProject?.status || details.status,
          createdAt: existingProject?.createdAt || details.createdAt,
          owner: existingProject?.owner || details.owner,
          _count: {
            supporters:
              existingProject?._count?.supporters ||
              details._count?.supporters ||
              0,
            followers:
              existingProject?._count?.followers ||
              details._count?.followers ||
              0,
            comments: details._count?.comments || 0,
            teamMembers: details._count?.teamMembers || 0,
            updates: details._count?.updates || 0,
          },
          seeking: details.seeking || [],
          skills: details.skills || [],
          description: details.description || '',
          teamMembers: details.teamMembers || [],
          updates: details.updates || [],
        };

        setProjectById(fullProject);
        setCachedProject(projectId, fullProject, details.updates || []);
      } catch (err) {
        setError(
          `Failed to get project by ID: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setActionLoading((prev) => {
          const next = new Set(prev.projectDetails);
          next.delete(projectId);
          return { ...prev, projectDetails: next };
        });
      }
    },
    [
      user,
      setError,
      setActionLoading,
      getCachedProject,
      allProjects.data,
      myProjects.data,
      supportedProjects.data,
      followedProjects.data,
      setCachedProject,
    ]
  );

  const getProjectsByUserId = useCallback(
    async (
      ownerId?: string,
      filterProjectDto?: FilterProjectInterface,
      loadMore: boolean = false,
      forceLoad: boolean = false
    ) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const targetOwnerId = ownerId ?? user.id;
      const lastFilter = lastProjectsByUserFilterRef.current;
      const currentNorm = normalizeFilterForCompare(filterProjectDto);
      const lastNorm = normalizeFilterForCompare(lastFilter);
      const currentFilterKey = JSON.stringify(currentNorm || {});
      const lastFilterKey = JSON.stringify(lastNorm || {});
      const doLoadMore = loadMore && currentFilterKey === lastFilterKey;

      if (!loadMore && !forceLoad) {
        if (
          myProjects.data.length > 0 &&
          myProjects.data[0]?.owner?.id === targetOwnerId &&
          currentFilterKey === lastFilterKey
        ) {
          return;
        }
      }

      setLoading(true);
      try {
        if (targetOwnerId === user.id) {
          const response =
            await ShowcaseService.getMyProjects(filterProjectDto);
          if (doLoadMore) {
            setMyProjects((prev) => ({
              data: [...prev.data, ...response.data],
              pagination: response.pagination,
            }));
          } else {
            setMyProjects({
              data: response.data,
              pagination: response.pagination,
            });
            lastProjectsByUserFilterRef.current = normalizeFilterForCompare(
              filterProjectDto as FilterProjectInterface
            );
          }
        } else {
          const response = await ShowcaseService.getProjectsByOwner(
            targetOwnerId,
            filterProjectDto
          );
          if (doLoadMore) {
            setProjectsByUserId((prev) => ({
              data: [...prev.data, ...response.data],
              pagination: response.pagination,
            }));
          } else {
            setProjectsByUserId({
              data: response.data,
              pagination: response.pagination,
            });
            lastProjectsByUserFilterRef.current = normalizeFilterForCompare(
              filterProjectDto as FilterProjectInterface
            );
          }
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [user, setError, setLoading, normalizeFilterForCompare, myProjects.data]
  );

  const getSupportedProjects = useCallback(
    async (
      filterProjectDto?: FilterProjectInterface,
      loadMore: boolean = false,
      forceLoad: boolean = false
    ) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const lastFilter = lastSupportedProjectsFilterRef.current;
      const currentNorm = normalizeFilterForCompare(filterProjectDto);
      const lastNorm = normalizeFilterForCompare(lastFilter);
      const currentFilterKey = JSON.stringify(currentNorm || {});
      const lastFilterKey = JSON.stringify(lastNorm || {});
      const doLoadMore = loadMore && currentFilterKey === lastFilterKey;

      if (!loadMore && !forceLoad) {
        if (
          supportedProjects.data.length > 0 &&
          currentFilterKey === lastFilterKey
        )
          return;
      }
      if (doLoadMore && !supportedProjects.pagination.hasNext) {
        return;
      }

      setLoading(true);
      try {
        const response =
          await ShowcaseService.getSupportedProjects(filterProjectDto);
        if (doLoadMore) {
          setSupportedProjects((prev: PaginatedProjectsInterface) => ({
            data: [
              ...prev.data,
              ...response.data.map((p: ProjectDetailInterface) => ({
                ...p,
                supporters: Array.isArray(p.supporters)
                  ? [...p.supporters, { userId: user.id }]
                  : [{ userId: user.id }],
              })),
            ],
            pagination: response.pagination,
          }));
        } else {
          setSupportedProjects({
            data: response.data.map((p: ProjectDetailInterface) => ({
              ...p,
              supporters: Array.isArray(p.supporters)
                ? [...p.supporters, { userId: user.id }]
                : [{ userId: user.id }],
            })),
            pagination: response.pagination,
          });
          lastSupportedProjectsFilterRef.current = normalizeFilterForCompare(
            filterProjectDto as FilterProjectInterface
          );
        }
      } catch (err) {
        setError(
          `Failed to get supported projects: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setLoading(false);
      }
    },
    [
      user,
      setError,
      setLoading,
      normalizeFilterForCompare,
      supportedProjects.pagination.hasNext,
      supportedProjects.data.length,
    ]
  );

  const getFollowedProjects = useCallback(
    async (
      filterProjectDto?: FilterProjectInterface,
      loadMore: boolean = false,
      forceLoad: boolean = false
    ) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const lastFilter = lastFollowedProjectsFilterRef.current;
      const currentNorm = normalizeFilterForCompare(filterProjectDto);
      const lastNorm = normalizeFilterForCompare(lastFilter);
      const currentFilterKey = JSON.stringify(currentNorm || {});
      const lastFilterKey = JSON.stringify(lastNorm || {});
      const doLoadMore = loadMore && currentFilterKey === lastFilterKey;

      if (!loadMore && !forceLoad) {
        if (
          followedProjects.data.length > 0 &&
          currentFilterKey === lastFilterKey
        )
          return;
      }

      if (doLoadMore && !followedProjects.pagination.hasNext) {
        return;
      }

      setLoading(true);
      try {
        const response =
          await ShowcaseService.getFollowedProjects(filterProjectDto);
        if (doLoadMore) {
          setFollowedProjects((prev) => ({
            data: [
              ...prev.data,
              ...response.data.map((p: ProjectDetailInterface) => ({
                ...p,
                followers: Array.isArray(p.followers)
                  ? [...p.followers, { userId: user.id }]
                  : [{ userId: user.id }],
              })),
            ],
            pagination: response.pagination,
          }));
        } else {
          setFollowedProjects({
            data: response.data.map((p: ProjectDetailInterface) => ({
              ...p,
              followers: Array.isArray(p.followers)
                ? [...p.followers, { userId: user.id }]
                : [{ userId: user.id }],
            })),
            pagination: response.pagination,
          });
          lastFollowedProjectsFilterRef.current = normalizeFilterForCompare(
            filterProjectDto as FilterProjectInterface
          );
        }
      } catch (err) {
        setError(
          `Failed to get followed projects: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setLoading(false);
      }
    },
    [
      user,
      setError,
      setLoading,
      normalizeFilterForCompare,
      followedProjects.pagination.hasNext,
      followedProjects.data.length,
    ]
  );

  const getProjectForSharing = useCallback(
    async (projectId: string): Promise<ProjectDetailInterface | null> => {
      try {
        if (projectById?.id === projectId) {
          return projectById;
        }

        const existingProject = allProjects.data.find(
          (p) => p.id === projectId
        );

        if (existingProject) {
          try {
            const details = await ShowcaseService.getProjectById(projectId);
            return { ...existingProject, ...details } as ProjectDetailInterface;
          } catch (error) {
            setError(
              `Failed to get project by ID: ${error instanceof Error ? error.message : String(error)}`
            );
            return existingProject as ProjectDetailInterface;
          }
        }

        return await ShowcaseService.getProjectById(projectId);
      } catch (error) {
        console.error('Failed to get project for sharing:', error);
        return null;
      }
    },
    [allProjects.data, projectById, setError]
  );

  const clearProjectsState = useCallback(() => {
    setAllProjects({
      data: [],
      pagination: {
        nextCursor: undefined,
        hasNext: false,
      },
    });
    setProjectById(null);
  }, []);

  return {
    projectCounts,
    setProjectCounts,
    allProjects,
    setAllProjects,
    projectsByUserId,
    setProjectsByUserId,
    myProjects,
    setMyProjects,
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
  };
};
