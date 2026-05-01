import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import * as store from "../localStore";

type AuthState = {
  ready: boolean;
  loggedIn: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(async () => {
    setTick((n) => n + 1);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = store.loginUser(email, password);
    if (!r.ok) throw new Error(r.error);
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    store.logoutUser();
    await refresh();
  }, [refresh]);

  const loggedIn = !!store.getCurrentUser();
  const ready = true;

  const v = useMemo(
    () => ({ ready, loggedIn, refresh, login, logout }),
    [ready, loggedIn, refresh, login, logout, tick]
  );

  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const x = useContext(Ctx);
  if (!x) throw new Error("AuthProvider missing");
  return x;
}
