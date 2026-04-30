import { createContext, useContext, useState } from 'react';

// Hardcoded credentials — replace with real auth when backend is ready
const USERS = [
  {
    email:    'admin@equilybrio.com',
    password: 'equilybrio2026',
    name:     'Patricia Lara',
    role:     'admin',
  },
  {
    email:    'agente@equilybrio.com',
    password: 'equilybrio2026',
    name:     'Camilo Reyes',
    role:     'agent',
  },
];

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('ticketera_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  function login(email, password) {
    const match = USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!match) return false;
    const session = { email: match.email, name: match.name, role: match.role };
    sessionStorage.setItem('ticketera_user', JSON.stringify(session));
    setUser(session);
    return true;
  }

  function logout() {
    sessionStorage.removeItem('ticketera_user');
    setUser(null);
  }

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
