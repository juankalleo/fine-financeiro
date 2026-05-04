'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'financeapp_auth';
const PASSWORD_KEY = 'financeapp_custom_password';
const DEFAULT_PASSWORD = 'finance2026';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  updatePassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  isDefaultPassword: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const getActivePassword = useCallback(() => {
    const custom = localStorage.getItem(PASSWORD_KEY);
    if (custom) return custom;
    return process.env.NEXT_PUBLIC_APP_PASSWORD || DEFAULT_PASSWORD;
  }, []);

  const login = useCallback((password: string): boolean => {
    const activePassword = getActivePassword();
    if (password === activePassword) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  }, [getActivePassword]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  const updatePassword = useCallback((oldPass: string, newPass: string) => {
    const activePassword = getActivePassword();
    if (oldPass !== activePassword) {
      return { success: false, message: 'Senha atual incorreta' };
    }
    if (newPass.length < 4) {
      return { success: false, message: 'A nova senha deve ter pelo menos 4 caracteres' };
    }
    localStorage.setItem(PASSWORD_KEY, newPass);
    return { success: true, message: 'Senha alterada com sucesso' };
  }, [getActivePassword]);

  const isDefaultPassword = useCallback(() => {
    return !localStorage.getItem(PASSWORD_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, updatePassword, isDefaultPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
