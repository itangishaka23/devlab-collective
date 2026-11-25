import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY } from '../api/client.js';
import { getMe, loginUser, registerUser } from '../api/services.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!localStorage.getItem(TOKEN_KEY)); // nothing to check without a token

  // Restore the session on page load
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    getMe()
      .then(setUser)
      .catch((err) => {
        // Only forget the token if the server says it is invalid, not when it is just offline
        if (err.status === 401) localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setReady(true));
  }, []);

  // Token expired somewhere in the app
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('devlab:auth-expired', onExpired);
    return () => window.removeEventListener('devlab:auth-expired', onExpired);
  }, []);

  const finish = useCallback(({ token, user: u }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    return u;
  }, []);

  const login = useCallback(async (payload) => finish(await loginUser(payload)), [finish]);
  const register = useCallback(async (payload) => finish(await registerUser(payload)), [finish]);
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, isAdmin: user?.role === 'admin', login, register, logout, setUser }),
    [user, ready, login, register, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
