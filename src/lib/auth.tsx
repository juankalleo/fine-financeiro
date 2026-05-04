'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'financeapp_auth';
const PASSWORD_KEY = 'financeapp_custom_password';
const DEFAULT_PASSWORD = 'finance2026';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  updatePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  isDefaultPassword: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePassword, setActivePassword] = useState<string | null>(null);

  // Load password from cloud on every app start
  useEffect(() => {
    async function fetchPass() {
      try {
        const res = await fetch('/api/auth/password');
        const data = await res.json();
        if (data.password) {
          setActivePassword(data.password);
          localStorage.setItem(PASSWORD_KEY, data.password);
        }
      } catch (err) {}
    }

    const storedAuth = localStorage.getItem(AUTH_KEY);
    if (storedAuth === 'true') setIsAuthenticated(true);
    
    fetchPass();
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    // Re-check cloud password on login for safety
    let currentPass = activePassword || localStorage.getItem(PASSWORD_KEY) || process.env.NEXT_PUBLIC_APP_PASSWORD || DEFAULT_PASSWORD;
    
    try {
      const res = await fetch('/api/auth/password');
      const data = await res.json();
      if (data.password) currentPass = data.password;
    } catch (err) {}

    if (password === currentPass) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  }, [activePassword]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  const updatePassword = useCallback(async (oldPass: string, newPass: string) => {
    let currentPass = activePassword || localStorage.getItem(PASSWORD_KEY) || process.env.NEXT_PUBLIC_APP_PASSWORD || DEFAULT_PASSWORD;
    
    if (oldPass !== currentPass) return { success: false, message: 'Senha incorreta' };
    
    try {
      await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPass }),
      });
      localStorage.setItem(PASSWORD_KEY, newPass);
      setActivePassword(newPass);
      return { success: true, message: 'Senha atualizada na nuvem!' };
    } catch (err) {
      return { success: false, message: 'Erro de conexão com a nuvem' };
    }
  }, [activePassword]);

  const isDefaultPassword = useCallback(() => {
    return !activePassword && !localStorage.getItem(PASSWORD_KEY);
  }, [activePassword]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, updatePassword, isDefaultPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
