import { useState, useCallback } from 'react';
import type { Tags } from '@/types/ShowcaseType';
import { ShowcaseService } from '@/services/ShowcaseService';

/**
 * useShowcaseTypes
 * Manages fetching and caching of project types/tags
 * with a 10-minute cache TTL
 */
export const useShowcaseTypes = () => {
  const [allTypes, setAllTypes] = useState<Tags[]>([]);
  const [typeLoading, setTypeLoading] = useState<boolean>(false);
  const [typesLastFetched, setTypesLastFetched] = useState<number>(0);

  const fetchAllTypes = useCallback(async (): Promise<void> => {
    if (Date.now() - typesLastFetched < 10 * 60 * 1000) {
      return; // Skip fetching if last fetched within 10 minutes
    }
    setTypeLoading(true);
    try {
      console.log('Fetching project types from API...');
      const types = await ShowcaseService.getAllProjectTypes();
      setAllTypes(types);
      setTypesLastFetched(Date.now());
    } catch (err) {
      console.error('Failed to fetch project types:', err);
    } finally {
      setTypeLoading(false);
    }
  }, [typesLastFetched]);

  return {
    allTypes,
    typeLoading,
    fetchAllTypes,
  };
};
