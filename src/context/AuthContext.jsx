import { createContext, useContext, useState } from 'react';
import { apiFetch } from '../services/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ticketera_session'))?.user ?? null; }
    catch { return null; }
  });

  async function login(email, password) {
    const data = await apiFetch('POST', '/auth/login', { email, password });
    sessionStorage.setItem('ticketera_session', JSON.stringify({ token: data.token, user: data.user }));
    setUser(data.user);
  }

  function logout() {
    sessionStorage.removeItem('ticketera_session');
    setUser(null);
  }

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() { return useContext(AuthCtx); }
