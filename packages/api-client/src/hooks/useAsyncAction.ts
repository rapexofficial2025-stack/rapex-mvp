import { useCallback, useState } from "react";
import { toErrorMessage } from "../core/errors";

export type AsyncActionState<Args extends unknown[], T> = {
  execute: (...args: Args) => Promise<T>;
  loading: boolean;
  error: string | null;
};

/** Companion to useAsync for imperative calls (login, place order, accept order) that shouldn't auto-fire on mount. */
export function useAsyncAction<Args extends unknown[], T>(fn: (...args: Args) => Promise<T>): AsyncActionState<Args, T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        setLoading(false);
        return result;
      } catch (err) {
        setError(toErrorMessage(err));
        setLoading(false);
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn],
  );

  return { execute, loading, error };
}
