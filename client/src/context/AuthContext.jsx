import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/client';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export const HOME_BY_ROLE = { planner: '/planner', nominee: '/nominee', provider: '/provider', admin: '/admin' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    if (!storage.get('lc_token')) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      storage.remove('lc_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const handleAuth = (data) => {
    storage.set('lc_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => handleAuth((await api.post('/auth/login', { email, password })).data);
  const register = async (payload) => handleAuth((await api.post('/auth/register', payload)).data);
  const logout = () => {
    storage.remove('lc_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, refresh: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
