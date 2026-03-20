import { useState, useCallback } from 'react';

/**
 * useShowcaseLoadingState
 * Manages global loading state, per-action loading flags, and error state
 * for the Showcase context
 */
export const useShowcaseLoadingState = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState({
    teamMembers: false,
    refresh: false,
    count: false,
    support: new Set<string>(),
    follow: new Set<string>(),
    comment: false,
    updates: false,
    seekingOptions: false,
    projectDetails: new Set<string>(),
  });
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    setLoading,
    actionLoading,
    setActionLoading,
    error,
    setError,
    clearError,
  };
};
