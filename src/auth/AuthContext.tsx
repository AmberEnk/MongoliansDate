import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as forum from "../forum/api";
import type { ForumUser } from "../forum/types";

type AuthState = {
  ready: boolean;
  loggedIn: boolean;
  user: ForumUser | null;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; displayName: string; birthdate: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<ForumUser | null>(null);

  const refresh = useCallback(async () => {
    try {
      if (!forum.getToken()) {
        setUser(null);
        return;
      }
      setUser(await forum.fetchMe());
    } catch {
      forum.setToken(null);
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const r = await forum.login(email, password);
    forum.setToken(r.token);
    setUser(r.user);
  }, []);

  const register = useCallback(
    async (input: { email: string; password: string; displayName: string; birthdate: string }) => {
      const r = await forum.register(input);
      forum.setToken(r.token);
      setUser(r.user);
    },
    []
  );

  const logout = useCallback(async () => {
    await forum.logout();
    setUser(null);
  }, []);

  const v = useMemo(
    () => ({ ready, loggedIn: !!user, user, refresh, login, register, logout }),
    [ready, user, refresh, login, register, logout]
  );

  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const x = useContext(Ctx);
  if (!x) throw new Error("AuthProvider missing");
  return x;
}
