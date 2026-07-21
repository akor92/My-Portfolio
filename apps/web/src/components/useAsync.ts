import { useCallback, useEffect, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Run an async loader on mount and expose {data, loading, error, reload}. */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(() => {
    setLoading(true);
    setError(null);
    loader()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);

  return { data, loading, error, reload: run };
}
