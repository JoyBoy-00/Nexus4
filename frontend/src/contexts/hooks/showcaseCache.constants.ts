export const CACHE_CONFIG = {
  PROJECT_TTL: 5 * 60 * 1000, // 5 minutes
  COMMENTS_TTL: 3 * 60 * 1000, // 3 minutes
  MAX_CACHE_SIZE: 50, // Maximum number of items to cache
} as const;
