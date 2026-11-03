import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as forum from "../forum/api";
import type { ForumUser } from "../forum/types";

type AuthState = {
  ready: boolean;
  loggedIn: boolean;
  user: ForumUser | null;
  unreadNotifications: number;
  unreadMessages: number;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; displayName: string; birthdate: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<ForumUser | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const refresh = useCallback(async () => {
    try {
      if (!forum.getToken()) {
        setUser(null);
        setUnreadNotifications(0);
        setUnreadMessages(0);
        return;
      }
      const me = await forum.fetchMe();
      setUser(me.user);
      setUnreadNotifications(me.unreadNotifications);
      setUnreadMessages(me.unreadMessages);
    } catch {
      forum.setToken(null);
      setUser(null);
      setUnreadNotifications(0);
      setUnreadMessages(0);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const t = window.setInterval(() => void refresh(), 45000);
    return () => window.clearInterval(t);
  }, [user, refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const r = await forum.login(email, password);
    forum.setToken(r.token);
    setUser(r.user);
    const me = await forum.fetchMe();
    setUser(me.user);
    setUnreadNotifications(me.unreadNotifications);
    setUnreadMessages(me.unreadMessages);
  }, []);

  const register = useCallback(
    async (input: { email: string; password: string; displayName: string; birthdate: string }) => {
      const r = await forum.register(input);
      forum.setToken(r.token);
      setUser(r.user);
      const me = await forum.fetchMe();
      setUser(me.user);
      setUnreadNotifications(me.unreadNotifications);
      setUnreadMessages(me.unreadMessages);
    },
    []
  );

  const logout = useCallback(async () => {
    await forum.logout();
    setUser(null);
    setUnreadNotifications(0);
    setUnreadMessages(0);
  }, []);

  const v = useMemo(
    () => ({
      ready,
      loggedIn: !!user,
      user,
      unreadNotifications,
      unreadMessages,
      refresh,
      login,
      register,
      logout,
    }),
    [ready, user, unreadNotifications, unreadMessages, refresh, login, register, logout]
  );

  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const x = useContext(Ctx);
  if (!x) throw new Error("AuthProvider missing");
  return x;
}
