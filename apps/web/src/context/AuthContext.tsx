import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../api/resources.js';
import { tokenStore } from '../api/client.js';
import type { User } from '../api/types.js';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on load if a token exists.
  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { token, user } = await authApi.login(email, password);
    tokenStore.set(token);
    setUser(user);
  }

  function logout() {
    tokenStore.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
