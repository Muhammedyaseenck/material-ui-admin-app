import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as api from '../api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!api.tokenStore.get());

  // Restore session on refresh
  useEffect(() => {
    if (!api.tokenStore.get()) return;
    api.getProfile()
      .then(setUser)
      .catch(() => api.tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { access_token } = await api.login(email, password);
    api.tokenStore.set(access_token);
    setUser(await api.getProfile());
  }, []);

  const signOut = useCallback(() => {
    api.tokenStore.clear();
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
}