'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'financeapp_auth';
const CREDS_KEY = 'financeapp_local_creds';
const DEFAULT_USER = 'admin';
const DEFAULT_PASS = 'finance2026';

interface Credentials {
  username: string;
  password?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  username: string;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateCredentials: (username: string, oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(DEFAULT_USER);
  const [password, setPassword] = useState(DEFAULT_PASS);

  const fetchCloudCreds = useCallback(async () => {
    try {
      const res = await fetch(`/api/auth/credentials?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.username && data.password) {
        setUsername(data.username);
        setPassword(data.password);
        localStorage.setItem(CREDS_KEY, JSON.stringify({ username: data.username, password: data.password }));
      }
    } catch (err) {}
  }, []);

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_KEY);
    if (storedAuth === 'true') setIsAuthenticated(true);

    const localCreds = localStorage.getItem(CREDS_KEY);
    if (localCreds) {
      const parsed = JSON.parse(localCreds);
      setUsername(parsed.username);
      setPassword(parsed.password);
    }

    fetchCloudCreds();
  }, [fetchCloudCreds]);

  const login = useCallback(async (user: string, pass: string): Promise<boolean> => {
    // Always refresh creds from cloud on login attempt
    try {
      const res = await fetch(`/api/auth/credentials?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.username === user && data.password === pass) {
        setIsAuthenticated(true);
        setUsername(data.username);
        setPassword(data.password);
        localStorage.setItem(AUTH_KEY, 'true');
        localStorage.setItem(CREDS_KEY, JSON.stringify(data));
        return true;
      }
    } catch (err) {}

    // Fallback to state/local
    if (user === username && pass === password) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  }, [username, password]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  const updateCredentials = useCallback(async (newUser: string, oldPass: string, newPass: string) => {
    if (oldPass !== password) return { success: false, message: 'Senha atual incorreta' };
    
    try {
      const res = await fetch('/api/auth/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUser, password: newPass }),
      });
      if (!res.ok) throw new Error();
      
      setUsername(newUser);
      setPassword(newPass);
      localStorage.setItem(CREDS_KEY, JSON.stringify({ username: newUser, password: newPass }));
      return { success: true, message: 'Credenciais atualizadas na nuvem!' };
    } catch (err) {
      return { success: false, message: 'Erro ao sincronizar com a nuvem' };
    }
  }, [password]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout, updateCredentials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
