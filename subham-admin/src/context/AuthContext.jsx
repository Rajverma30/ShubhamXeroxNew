/**
 * Admin auth. One account, no registration. The token is verified against
 * /admin/auth/me on boot so a stale token never renders a broken shell.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { tokenStore } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    if (!tokenStore.get()) { setBooting(false); return; }
    api
      .me()
      .then(setAdmin)
      .catch(() => tokenStore.clear())
      .finally(() => setBooting(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await api.login(credentials);
    tokenStore.set(res.token);
    setAdmin(res.admin);
    return res.admin;
  }, []);

  const logout = useCallback(async () => {
    try { await api.logout(); } catch { /* token already gone */ }
    tokenStore.clear();
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({ admin, setAdmin, booting, login, logout, isAuthed: Boolean(admin) }),
    [admin, booting, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
