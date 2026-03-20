import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  ProjectDetailInterface,
  ProjectUpdateInterface,
  ProjectComment,
  CommentPaginationResponse,
  FilterProjectInterface,
} from '@/types/ShowcaseType';
import { ProjectCache, CommentsCache } from './showcaseCache.types';
import { CACHE_CONFIG } from './showcaseCache.constants';

/**
 * useShowcaseCache
 * Manages caching of projects and comments with TTL-based expiration
 * and LRU eviction when max size is exceeded
 */
export const useShowcaseCache = () => {
  const [projectsCache, setProjectsCache] = useState<Map<string, ProjectCache>>(
    new Map()
  );
  const [commentsCache, setCommentsCache] = useState<
    Map<string, CommentsCache>
  >(new Map());

  // Refs for better performance
  const projectsCacheRef = useRef(projectsCache);
  const commentsCacheRef = useRef(commentsCache);

  useEffect(() => {
    projectsCacheRef.current = projectsCache;
    commentsCacheRef.current = commentsCache;
  }, [projectsCache, commentsCache]);

  // Helper to normalize filters for equality checks (ignore pagination cursor)
  const normalizeFilterForCompare = useCallback(
    (f?: FilterProjectInterface) => {
      if (!f) return {};
      const copy = { ...f };
      if ('cursor' in copy) delete copy.cursor;
      if ('pageSize' in copy) delete copy.pageSize;
      return copy;
    },
    []
  );

  // Cache management functions
  const getCachedProject = useCallback(
    (projectId: string): ProjectDetailInterface | null => {
      const cache = projectsCacheRef.current.get(projectId);
      if (!cache) return null;

      const isExpired =
        Date.now() - cache.lastFetched > CACHE_CONFIG.PROJECT_TTL;
      if (isExpired) {
        // Remove expired cache
        setProjectsCache((prev) => {
          const newCache = new Map(prev);
          newCache.delete(projectId);
          return newCache;
        });
        return null;
      }

      return cache.project;
    },
    []
  );

  const setCachedProject = useCallback(
    (
      projectId: string,
      project: ProjectDetailInterface,
      updates: ProjectUpdateInterface[] = []
    ) => {
      setProjectsCache((prev) => {
        const newCache = new Map(prev);

        // Enforce max cache size
        if (newCache.size >= CACHE_CONFIG.MAX_CACHE_SIZE) {
          // Remove oldest item (first one)
          const firstKey = newCache.keys().next().value;
          if (typeof firstKey === 'string') {
            newCache.delete(firstKey);
          }
        }

        newCache.set(projectId, { project, updates, lastFetched: Date.now() });
        return newCache;
      });
    },
    []
  );

  const getCachedComments = useCallback((projectId: string) => {
    const cache = commentsCacheRef.current.get(projectId);
    if (!cache) return null;

    const isExpired =
      Date.now() - cache.lastFetched > CACHE_CONFIG.COMMENTS_TTL;
    if (isExpired) {
      setCommentsCache((prev) => {
        const newCache = new Map(prev);
        newCache.delete(projectId);
        return newCache;
      });
      return null;
    }

    return cache;
  }, []);

  const setCachedComments = useCallback(
    (
      projectId: string,
      comments: ProjectComment[],
      pagination: CommentPaginationResponse
    ) => {
      setCommentsCache((prev) => {
        const newCache = new Map(prev);

        if (newCache.size >= CACHE_CONFIG.MAX_CACHE_SIZE) {
          // Remove the first (oldest) entry from Map
          const firstKey = newCache.keys().next().value;
          if (typeof firstKey === 'string') {
            newCache.delete(firstKey);
          }
        }

        // Add new entry (will be at the end)
        newCache.set(projectId, {
          comments,
          pagination,
          lastFetched: Date.now(),
        });
        return newCache;
      });
    },
    []
  );

  const clearSpecificCache = useCallback((projectId: string) => {
    setProjectsCache((prev) => {
      const newCache = new Map(prev);
      newCache.delete(projectId);
      return newCache;
    });
    setCommentsCache((prev) => {
      const newCache = new Map(prev);
      newCache.delete(projectId);
      return newCache;
    });
  }, []);

  const clearProjectsCache = useCallback(() => {
    setProjectsCache(new Map());
    setCommentsCache(new Map());
  }, []);

  const cacheInfo = {
    projects: projectsCache.size,
    comments: commentsCache.size,
  };

  return {
    projectsCache,
    commentsCache,
    getCachedProject,
    setCachedProject,
    getCachedComments,
    setCachedComments,
    clearSpecificCache,
    clearProjectsCache,
    normalizeFilterForCompare,
    cacheInfo,
  };
};
