"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { errorMessage } from "./api-client";
/** Stale responses never replace a newer screen. */
export function useResource<T>(key: string, loader: () => Promise<T>, enabled = true) {
  const loadRef = useRef(loader);
  useEffect(() => {
    loadRef.current = loader;
  }, [loader]);
  const [attempt, setAttempt] = useState(0);
  const request = useMemo(() => ({ key, attempt, enabled }), [key, attempt, enabled]);
  const [state, setState] = useState<{
    request: typeof request | null;
    data?: T;
    error: string;
    loading: boolean;
  }>({ request: null, error: "", loading: false });
  useEffect(() => {
    if (!request.enabled) return;
    let active = true;
    const load = loadRef.current;
    void Promise.resolve().then(load).then(
      (data) => {
        if (active) setState({ request, data, error: "", loading: false });
      },
      (error) => {
        if (active) setState({ request, error: errorMessage(error), loading: false });
      },
    );
    return () => {
      active = false;
    };
  }, [request]);
  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  return {
    ...(enabled && state.request === request
      ? state
      : { data: undefined, error: "", loading: enabled }),
    reload,
  };
}
