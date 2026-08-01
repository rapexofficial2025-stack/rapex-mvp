import { useCallback, useEffect, useRef, useState } from "react";
import { toErrorMessage } from "../core/errors";

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

/**
 * Generic data-fetching hook every domain hook (useStores, useOrders, etc.)
 * is built on. Pure React -- no RN or DOM API -- so it's shared between
 * ui-native and ui-web consumers alike.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const run = useCallback(() => {
    const currentRequestId = ++requestId.current;
    setLoading(true);
    setError(null);

    fn()
      .then((result) => {
        if (requestId.current === currentRequestId) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (requestId.current === currentRequestId) {
          setError(toErrorMessage(err));
          setLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return { data, loading, error, refetch: run };
}
