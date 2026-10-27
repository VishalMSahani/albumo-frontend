"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError, errorMessage } from "@/lib/api-client";
import type { User } from "./types";

type Session = { user: User | null; loading: boolean; error: string };
type AuthContextValue = Session & {
  restore: () => Promise<User | null>;
  signIn: (user: User) => void;
  updateUser: (userId: string, patch: Partial<User>) => void;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({
    user: null,
    loading: true,
    error: "",
  });
  const version = useRef(0);
  const pending = useRef<{ version: number; promise: Promise<User | null> } | null>(null);
  const signIn = useCallback((user: User) => {
    version.current += 1;
    api.identityChanged();
    setSession({ user, loading: false, error: "" });
    void api.post("/api/legal/consents/claim").catch(() => undefined);
  }, []);
  const updateUser = useCallback((userId: string, patch: Partial<User>) => {
    version.current += 1;
    setSession((current) =>
      current.user?.id === userId
        ? { ...current, user: { ...current.user, ...patch } }
        : current,
    );
  }, []);
  const restore = useCallback(async () => {
    const currentVersion = version.current;
    if (pending.current?.version === currentVersion) return pending.current.promise;
    const promise = (async () => {
      try {
        const user = await api.get<User>("/api/auth/me");
        if (currentVersion === version.current)
          setSession({ user, loading: false, error: "" });
        return currentVersion === version.current ? user : null;
      } catch (error) {
        if (currentVersion === version.current) {
          if (error instanceof ApiError && error.status === 401)
            setSession({ user: null, loading: false, error: "" });
          else
            setSession((value) => ({
              ...value,
              loading: false,
              error: errorMessage(error),
            }));
        }
        return null;
      }
    })().finally(() => {
      if (pending.current?.promise === promise) pending.current = null;
    });
    pending.current = { version: currentVersion, promise };
    return promise;
  }, []);
  const signOut = useCallback(async () => {
    version.current += 1;
    api.identityChanged();
    await api.post("/api/auth/logout");
    setSession({ user: null, loading: false, error: "" });
  }, []);
  useEffect(() => {
    void restore();
    const expired = () => {
      version.current += 1;
      api.identityChanged();
      setSession({ user: null, loading: false, error: "" });
    };
    const visible = () => {
      if (document.visibilityState === "visible") void restore();
    };
    window.addEventListener("albumo-session-expired", expired);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.removeEventListener("albumo-session-expired", expired);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [restore]);
  return (
    <AuthContext.Provider value={{ ...session, restore, signIn, updateUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth requires AuthProvider");
  return context;
}
