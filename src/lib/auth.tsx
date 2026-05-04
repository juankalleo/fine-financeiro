'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'financeapp_auth';
const PASSWORD_KEY = 'financeapp_custom_password';
const DEFAULT_PASSWORD = 'finance2026';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  updatePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  isDefaultPassword: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cloudPassword, setCloudPassword] = useState<string | null>(null);

  // Sync password from cloud on initialization
  useEffect(() => {
    async function syncPassword() {
      try {
        const res = await fetch('/api/auth/password');
        if (res.ok) {
          const data = await res.json();
          if (data.password) {
            setCloudPassword(data.password);
            localStorage.setItem(PASSWORD_KEY, data.password);
          }
        }
      } catch (err) {
        console.warn('Could not sync password from cloud');
      }
    }
    
    const storedAuth = localStorage.getItem(AUTH_KEY);
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    
    syncPassword();
  }, []);

  const getActivePassword = useCallback(() => {
    // Priority: Cloud State > Local Storage > ENV/Default
    if (cloudPassword) return cloudPassword;
    const local = localStorage.getItem(PASSWORD_KEY);
    if (local) return local;
    return process.env.NEXT_PUBLIC_APP_PASSWORD || DEFAULT_PASSWORD;
  }, [cloudPassword]);

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

  const updatePassword = useCallback(async (oldPass: string, newPass: string) => {
    const activePassword = getActivePassword();
    if (oldPass !== activePassword) {
      return { success: false, message: 'Senha atual incorreta' };
    }
    if (newPass.length < 4) {
      return { success: false, message: 'A nova senha deve ter pelo menos 4 caracteres' };
    }
    
    try {
      // Save to Cloud
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPass }),
      });
      
      if (!res.ok) throw new Error('Cloud sync failed');
      
      // Save Locally
      localStorage.setItem(PASSWORD_KEY, newPass);
      setCloudPassword(newPass);
      
      return { success: true, message: 'Senha alterada e sincronizada na nuvem!' };
    } catch (err) {
      return { success: false, message: 'Erro ao sincronizar nova senha com a nuvem' };
    }
  }, [getActivePassword]);

  const isDefaultPassword = useCallback(() => {
    return !localStorage.getItem(PASSWORD_KEY) && !cloudPassword;
  }, [cloudPassword]);

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
