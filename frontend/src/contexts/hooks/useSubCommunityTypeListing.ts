import { useCallback, useRef, useState } from 'react';
import { subCommunityService } from '../../services/subCommunityService';
import {
  SubCommunity,
  SubCommunityFilterParams,
  SubCommunityType,
  SubCommunityTypeResponse,
} from '../../types/subCommunity';

interface UseSubCommunityTypeListingOptions {
  setLoading: (value: boolean) => void;
  setError: (message: string) => void;
  sectionLoadInProgress: boolean;
  setSectionLoadInProgress: (value: boolean) => void;
  acquireSectionLoadPermit: () => Promise<() => void>;
}

export const useSubCommunityTypeListing = ({
  setLoading,
  setError,
  sectionLoadInProgress,
  setSectionLoadInProgress,
  acquireSectionLoadPermit,
}: UseSubCommunityTypeListingOptions) => {
  const [subCommunities, setSubCommunities] = useState<SubCommunity[]>([]);
  const [subCommunityCache, setSubCommunityCache] = useState<
    Record<string, SubCommunityTypeResponse>
  >({});
  const [subCommunitiesByType, setSubCommunitiesByType] = useState<
    SubCommunity[]
  >([]);
  const [types, setTypes] = useState<SubCommunityType[]>([]);
  const [activeFilters, setActiveFiltersState] =
    useState<SubCommunityFilterParams>({});
  const [allLoaded, setAllLoaded] = useState(false);
  const [subCommunityPages, setSubCommunityPages] = useState<
    Record<string, number>
  >({});
  const [subCommunityLoadingByType, setSubCommunityLoadingByType] = useState<
    Record<string, boolean>
  >({});

  const typesFetchPromiseRef = useRef<Promise<SubCommunityType[]> | null>(null);
  const typesFailureAtRef = useRef<number | null>(null);
  const allFetchPromiseRef = useRef<Promise<void> | null>(null);
  const allFailureAtRef = useRef<number | null>(null);
  const inFlightTypePage = useRef<Record<string, Promise<unknown> | null>>({});
  const activeFilterKeyRef = useRef<string>('');
  const scheduledQueueRef = useRef<string[]>([]);
  const queueProcessingRef = useRef(false);

  const TYPES_RETRY_BACKOFF_MS = 30_000;
  const ALL_RETRY_BACKOFF_MS = 30_000;

  const normalizeFilters = useCallback((filters?: SubCommunityFilterParams) => {
    return {
      privacy:
        filters?.privacy && filters.privacy !== 'all'
          ? filters.privacy
          : undefined,
      membership:
        filters?.membership && filters.membership !== 'all'
          ? filters.membership
          : undefined,
      sort: filters?.sort || undefined,
      minMembers:
        typeof filters?.minMembers === 'number' && filters.minMembers > 0
          ? Math.floor(filters.minMembers)
          : undefined,
    } as SubCommunityFilterParams;
  }, []);

  const buildFilterKey = useCallback(
    (filters?: SubCommunityFilterParams) => {
      const normalized = normalizeFilters(filters);
      return `${normalized.privacy || ''}-${normalized.membership || ''}-${normalized.sort || ''}-${normalized.minMembers || ''}`;
    },
    [normalizeFilters]
  );
  activeFilterKeyRef.current = buildFilterKey(activeFilters);

  const resetTypeListingState = useCallback(() => {
    setSubCommunitiesByType([]);
    setSubCommunityPages({});
    setSubCommunityLoadingByType({});
    setSubCommunityCache({});
    inFlightTypePage.current = {};
    scheduledQueueRef.current = [];
  }, []);

  const setActiveFilters = useCallback(
    (filters: SubCommunityFilterParams) => {
      const normalized = normalizeFilters(filters);
      if (buildFilterKey(activeFilters) === buildFilterKey(normalized)) return;
      setActiveFiltersState(normalized);
      resetTypeListingState();
    },
    [activeFilters, buildFilterKey, normalizeFilters, resetTypeListingState]
  );

  const isAnySectionLoading = useCallback(() => {
    return (
      sectionLoadInProgress ||
      Object.values(subCommunityLoadingByType).some((value) => !!value)
    );
  }, [sectionLoadInProgress, subCommunityLoadingByType]);

  const safeGetSubCommunityByType = useCallback(
    async (
      type: string,
      page: number,
      limit: number,
      q?: string,
      filters?: SubCommunityFilterParams
    ) => {
      const release = await acquireSectionLoadPermit();
      setSectionLoadInProgress(true);
      try {
        return await subCommunityService.getSubCommunityByType(
          type,
          page,
          limit,
          q,
          filters
        );
      } finally {
        release();
        setSectionLoadInProgress(false);
      }
    },
    [acquireSectionLoadPermit, setSectionLoadInProgress]
  );

  const ensureAllSubCommunities = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh && allLoaded) return;

      if (
        allFailureAtRef.current &&
        Date.now() - allFailureAtRef.current < ALL_RETRY_BACKOFF_MS
      ) {
        return Promise.reject(
          new Error(
            'Previous all-subcommunities load failed recently; retry later'
          )
        );
      }

      if (allFetchPromiseRef.current) return allFetchPromiseRef.current;
      const p = (async () => {
        setLoading(true);
        const release = await acquireSectionLoadPermit();
        try {
          const data = await subCommunityService.getAllSubCommunities({
            compact: true,
            page: 1,
            limit: 6,
          });
          setSubCommunities(data as SubCommunity[]);
          setAllLoaded(true);
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message || 'Failed to fetch sub-communities');
            allFailureAtRef.current = Date.now();
          } else {
            setError('An unexpected error occurred');
            console.error('Unexpected error:', err);
          }
          throw err;
        } finally {
          release();
          setLoading(false);
          allFetchPromiseRef.current = null;
        }
      })();

      allFetchPromiseRef.current = p;
      return p;
    },
    [acquireSectionLoadPermit, allLoaded, setError, setLoading]
  );

  const getAllSubCommunities = useCallback(async () => {
    return ensureAllSubCommunities(false);
  }, [ensureAllSubCommunities]);

  const ensureTypes = useCallback(async () => {
    if (types.length > 0) return types;

    if (
      typesFailureAtRef.current &&
      Date.now() - typesFailureAtRef.current < TYPES_RETRY_BACKOFF_MS
    ) {
      return Promise.reject(
        new Error('Previous types load failed recently; retry later')
      );
    }

    if (typesFetchPromiseRef.current) return typesFetchPromiseRef.current;

    const p = (async () => {
      try {
        const loadedTypes = await subCommunityService.getTypes();
        setTypes(loadedTypes);
        typesFailureAtRef.current = null;
        return loadedTypes;
      } catch (err) {
        console.warn('Failed to load sub-community types', err);
        typesFailureAtRef.current = Date.now();
        throw err;
      } finally {
        typesFetchPromiseRef.current = null;
      }
    })();

    typesFetchPromiseRef.current = p;
    return p;
  }, [types]);

  const getSubCommunityByType = useCallback(
    async (
      type: string,
      page: number = 1,
      limit: number = 20,
      q?: string,
      forceRefresh = false,
      filters?: SubCommunityFilterParams
    ) => {
      const filterKey = buildFilterKey(filters);
      const cacheKey = `${type}-${page}-${limit}-${q || ''}-${filterKey}`;
      const isCurrentFilter = () =>
        type === 'all' || filterKey === activeFilterKeyRef.current;

      if (!forceRefresh && subCommunityCache[cacheKey]) {
        const cachedData = subCommunityCache[cacheKey];
        if (type !== 'all' && isCurrentFilter()) {
          setSubCommunitiesByType((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const uniqueNewData = cachedData.data.filter(
              (item) => !existingIds.has(item.id)
            );
            return [...prev, ...uniqueNewData];
          });
        }
        return cachedData;
      }

      setLoading(true);
      try {
        const response = await safeGetSubCommunityByType(
          type,
          page,
          limit,
          q,
          filters
        );

        setSubCommunityCache((prev) => ({
          ...prev,
          [cacheKey]: response,
        }));

        if (!isCurrentFilter()) {
          return response;
        }

        if (type === 'all') {
          setSubCommunities((prev) => {
            const items = Array.isArray(response)
              ? response
              : response.data || [];
            const existingIds = new Set(prev.map((item) => item.id));
            const uniqueNewData = items.filter(
              (item) => !existingIds.has(item.id)
            );
            return [...prev, ...uniqueNewData];
          });
        } else {
          setSubCommunitiesByType((prev) => {
            const items = Array.isArray(response)
              ? response
              : response.data || [];
            const existingIds = new Set(prev.map((item) => item.id));
            const uniqueNewData = items.filter(
              (item) => !existingIds.has(item.id)
            );
            return [...prev, ...uniqueNewData];
          });
        }

        return response;
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to fetch sub-communities by type');
        } else {
          setError('An unexpected error occurred');
          console.error('Unexpected error:', err);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      buildFilterKey,
      setError,
      setLoading,
      subCommunityCache,
      safeGetSubCommunityByType,
    ]
  );

  const ensureTypeLoaded = useCallback(
    async (
      type: string,
      limit: number = 6,
      q?: string,
      filters?: SubCommunityFilterParams
    ): Promise<void> => {
      const resolvedFilters = filters ?? activeFilters;
      const filterKey = buildFilterKey(resolvedFilters);
      const key = `${type}-1-${limit}-${q || ''}-${filterKey}`;
      if (subCommunityCache[key]) {
        setSubCommunityPages((prev) => ({ ...prev, [type]: 1 }));
        return;
      }
      if (inFlightTypePage.current[key]) {
        return inFlightTypePage.current[key] as Promise<void>;
      }

      setSubCommunityLoadingByType((prev) => ({ ...prev, [type]: true }));

      const p: Promise<void> = (async () => {
        try {
          const response = await getSubCommunityByType(
            type,
            1,
            limit,
            q,
            false,
            resolvedFilters
          );
          if (response?.data) {
            setSubCommunityPages((prev) => ({ ...prev, [type]: 1 }));
          }
        } finally {
          inFlightTypePage.current[key] = null;
          setSubCommunityLoadingByType((prev) => ({ ...prev, [type]: false }));
        }
      })();

      inFlightTypePage.current[key] = p;
      return p;
    },
    [activeFilters, buildFilterKey, getSubCommunityByType, subCommunityCache]
  );

  const loadMoreForType = useCallback(
    async (
      type: string,
      limit: number = 6,
      q?: string,
      filters?: SubCommunityFilterParams
    ): Promise<void> => {
      const resolvedFilters = filters ?? activeFilters;
      const current = subCommunityPages[type] ?? 1;
      const next = current + 1;
      const filterKey = buildFilterKey(resolvedFilters);
      const key = `${type}-${next}-${limit}-${q || ''}-${filterKey}`;
      if (subCommunityCache[key]) {
        setSubCommunityPages((prev) => ({ ...prev, [type]: next }));
        return;
      }
      if (inFlightTypePage.current[key]) {
        return inFlightTypePage.current[key] as Promise<void>;
      }

      setSubCommunityLoadingByType((prev) => ({ ...prev, [type]: true }));

      const p: Promise<void> = (async () => {
        try {
          const response = await getSubCommunityByType(
            type,
            next,
            limit,
            q,
            false,
            resolvedFilters
          );
          if (response?.data) {
            setSubCommunityPages((prev) => ({ ...prev, [type]: next }));
          }
        } finally {
          inFlightTypePage.current[key] = null;
          setSubCommunityLoadingByType((prev) => ({ ...prev, [type]: false }));
        }
      })();

      inFlightTypePage.current[key] = p;
      return p;
    },
    [
      activeFilters,
      buildFilterKey,
      getSubCommunityByType,
      subCommunityPages,
      subCommunityCache,
    ]
  );

  const isLoadingForType = useCallback(
    (type: string) => {
      return !!subCommunityLoadingByType[type];
    },
    [subCommunityLoadingByType]
  );

  const hasMoreForType = useCallback(
    (
      type: string,
      limit: number = 6,
      q: string = '',
      filters?: SubCommunityFilterParams
    ) => {
      const resolvedFilters = filters ?? activeFilters;
      const filterKey = buildFilterKey(resolvedFilters);
      const page = subCommunityPages[type] ?? 1;
      const key = `${type}-${page}-${limit}-${q || ''}-${filterKey}`;
      const response = subCommunityCache[key];
      return !!response?.pagination?.hasNext;
    },
    [activeFilters, buildFilterKey, subCommunityPages, subCommunityCache]
  );

  const getRemainingForType = useCallback(
    (
      type: string,
      limit: number = 6,
      q: string = '',
      filters?: SubCommunityFilterParams
    ): number | undefined => {
      const resolvedFilters = filters ?? activeFilters;
      const filterKey = buildFilterKey(resolvedFilters);
      const loadedKeys = Object.keys(subCommunityCache).filter(
        (key) =>
          key.startsWith(`${type}-`) && key.endsWith(`-${q || ''}-${filterKey}`)
      );
      const loadedCount = loadedKeys.reduce((acc, key) => {
        const response = subCommunityCache[key];
        return acc + (response?.data?.length ?? 0);
      }, 0);

      const currentPage = subCommunityPages[type] ?? 1;
      const currentKey = `${type}-${currentPage}-${limit}-${q || ''}-${filterKey}`;
      const fallbackKey = loadedKeys[loadedKeys.length - 1];
      const currentResponse =
        subCommunityCache[currentKey] ?? subCommunityCache[fallbackKey];

      const total = currentResponse?.pagination?.total;
      if (typeof total === 'number') {
        return Math.max(0, total - loadedCount);
      }
      return undefined;
    },
    [activeFilters, buildFilterKey, subCommunityCache, subCommunityPages]
  );

  const scheduleTypeLoad = useCallback(
    async (
      type: string,
      limit = 6,
      q?: string,
      filters?: SubCommunityFilterParams
    ) => {
      const resolvedFilters = filters ?? activeFilters;
      if (scheduledQueueRef.current.includes(type)) return;

      scheduledQueueRef.current.push(type);

      if (queueProcessingRef.current) return;

      queueProcessingRef.current = true;
      try {
        while (scheduledQueueRef.current.length > 0) {
          const next = scheduledQueueRef.current.shift()!;
          try {
            if (next === 'all') {
              await ensureAllSubCommunities();
            } else {
              await ensureTypeLoaded(next, limit, q, resolvedFilters);
            }
          } catch (err) {
            console.warn('Scheduled load failed for', next, err);
          }

          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } finally {
        queueProcessingRef.current = false;
      }
    },
    [activeFilters, ensureAllSubCommunities, ensureTypeLoaded]
  );

  const resetTypeCache = useCallback(() => {
    setSubCommunityCache({});
    setSubCommunities([]);
    setSubCommunitiesByType([]);
    setSubCommunityPages({});
    inFlightTypePage.current = {};
    scheduledQueueRef.current = [];
    queueProcessingRef.current = false;
  }, []);

  return {
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
  };
};
