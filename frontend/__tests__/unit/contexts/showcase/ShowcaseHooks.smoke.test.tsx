import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useShowcaseCache } from '@/contexts/hooks/useShowcaseCache';
import { useShowcaseLoadingState } from '@/contexts/hooks/useShowcaseLoadingState';
import { useShowcaseTypes } from '@/contexts/hooks/useShowcaseTypes';

describe('Showcase hooks smoke', () => {
  it('initializes useShowcaseLoadingState', () => {
    const { result } = renderHook(() => useShowcaseLoadingState());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.clearError).toBe('function');
  });

  it('initializes useShowcaseCache', () => {
    const { result } = renderHook(() => useShowcaseCache());

    expect(result.current.projectsCache).toBeInstanceOf(Map);
    expect(result.current.commentsCache).toBeInstanceOf(Map);
    expect(result.current.cacheInfo.projects).toBe(0);
    expect(result.current.cacheInfo.comments).toBe(0);
  });

  it('initializes useShowcaseTypes', () => {
    const { result } = renderHook(() => useShowcaseTypes());

    expect(result.current.allTypes).toEqual([]);
    expect(result.current.typeLoading).toBe(false);
    expect(typeof result.current.fetchAllTypes).toBe('function');
  });
});
