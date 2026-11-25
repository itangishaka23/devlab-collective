import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import useFetch from '../hooks/useFetch.js';

describe('useFetch', () => {
  it('returns the fetched data', async () => {
    const { result } = renderHook(() => useFetch(() => Promise.resolve(['live']), ['fallback'], []));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(['live']);
    expect(result.current.offline).toBe(false);
  });

  it('falls back to bundled content when the API is unreachable', async () => {
    const offlineError = Object.assign(new Error('offline'), { offline: true });
    const { result } = renderHook(() => useFetch(() => Promise.reject(offlineError), ['fallback'], []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(['fallback']);
    expect(result.current.offline).toBe(true);
    expect(result.current.error).toBe(offlineError);
  });
});
