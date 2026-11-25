import { useEffect, useState } from 'react';

/**
 * Loads data through `fetcher()` on mount (and whenever `deps` change).
 * If the request fails, `fallback` (the bundled sample content) is returned
 * instead, so the site still works while the API is offline.
 *
 * Returns { data, loading, error, offline }.
 */
export default function useFetch(fetcher, fallback, deps = []) {
  const [state, setState] = useState({ data: fallback, loading: true, error: null, offline: false });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => alive && setState({ data, loading: false, error: null, offline: false }))
      .catch((error) => alive && setState({ data: fallback, loading: false, error, offline: !!error.offline }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
