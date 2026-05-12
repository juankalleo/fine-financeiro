'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'fine_v3_auth_active';
const CREDS_KEY = 'fine_v3_user_identity';
const TOKEN_KEY = 'fine_v3_auth_token';
const DEFAULT_USER = 'admin';
const DEFAULT_PASS = 'finance2026';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string;
  themeColor: 'blue' | 'pink';
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateCredentials: (username: string, oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [themeColor, setThemeColor] = useState<'blue' | 'pink'>('blue');

  const USERS = [
    { username: 'admin', password: 'finance2026', theme: 'blue' },
    { username: 'mica', password: '123456', theme: 'pink' }
  ];

  // 1. Initial Load (Synchronous/Offline-first)
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const localCreds = localStorage.getItem(CREDS_KEY);
    
    console.log('[Auth] Initializing session...', { hasToken: !!storedToken, localCreds });

    if (storedToken && localCreds) {
      try {
        const parsed = JSON.parse(localCreds);
        const user = parsed.username;
        const theme = user === 'mica' ? 'pink' : 'blue';
        setUsername(user);
        setThemeColor(theme);
        setIsAuthenticated(true);
        document.documentElement.setAttribute('data-theme-color', theme);
      } catch (e) {
        console.error('[Auth] Failed to parse local creds', e);
      }
    }
    
    // Initial load complete (even if not authenticated)
    // This allows the app to "open" immediately
    setIsLoading(false);

    // 2. Background Validation (Online check)
    async function validateSession() {
      try {
        const res = await fetch('/api/auth/validate', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUsername(data.username);
            setThemeColor(data.theme === 'pink' ? 'pink' : 'blue');
            setIsAuthenticated(true);
            localStorage.setItem(CREDS_KEY, JSON.stringify({ username: data.username }));
          }
        } else if (res.status === 401) {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        // Network error (Offline) - Keep the local session
        console.warn('Authentication server unreachable, staying in offline mode');
      }
    }

    if (storedToken) {
      validateSession();
    }
  }, []);

  const login = useCallback(async (user: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[Auth] Login successful', data);
        const theme = data.theme === 'pink' ? 'pink' : 'blue';
        setIsAuthenticated(true);
        setUsername(data.username);
        setThemeColor(theme);
        document.documentElement.setAttribute('data-theme-color', theme);
        localStorage.setItem(AUTH_KEY, 'true');
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(CREDS_KEY, JSON.stringify({ username: data.username }));
        return true;
      }
    } catch (err) {
      // Fallback for offline login if credentials were previously cached? 
      // For now, just return false for new logins while offline.
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUsername('');
    setThemeColor('blue');
    document.documentElement.setAttribute('data-theme-color', 'blue');
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CREDS_KEY);
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  }, []);

  const updateCredentials = useCallback(async (newUser: string, oldPass: string, newPass: string) => {
    try {
      const res = await fetch('/api/auth/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUser, password: newPass }),
      });
      if (res.ok) {
        setUsername(newUser);
        localStorage.setItem(CREDS_KEY, JSON.stringify({ username: newUser }));
        return { success: true, message: 'Acesso atualizado!' };
      }
      return { success: false, message: 'Erro ao atualizar' };
    } catch (err) {
      return { success: false, message: 'Erro ao sincronizar (Offline)' };
    }
  }, []);

  // Inject dynamic CSS to override compiled Tailwind classes
  useEffect(() => {
    const PINK = '#FFC0CB';
    const PINK_DARK = '#FF9EAF';
    const BLUE = '#007AFF';
    const BLUE_DARK = '#0056B3';

    const color = themeColor === 'pink' ? PINK : BLUE;
    const colorDark = themeColor === 'pink' ? PINK_DARK : BLUE_DARK;

    // Set CSS variables on :root
    document.documentElement.style.setProperty('--apple-blue', color);
    document.documentElement.style.setProperty('--apple-blue-dark', colorDark);
    document.documentElement.style.setProperty('--app-frame', color);

    // Also inject a <style> tag to override compiled Tailwind classes
    let styleEl = document.getElementById('fine-theme-override');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'fine-theme-override';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      .bg-apple-blue { background-color: ${color} !important; }
      .bg-apple-blue-dark { background-color: ${colorDark} !important; }
      .bg-app-frame { background-color: ${color} !important; }
      .text-apple-blue { color: ${color} !important; }
      .text-app-frame { color: ${color} !important; }
      .border-apple-blue { border-color: ${color} !important; }
      .hover\\:bg-apple-blue-dark:hover { background-color: ${colorDark} !important; }
      .shadow-apple-blue\\/20 { --tw-shadow-color: ${color}33 !important; }
      .shadow-apple-blue\\/30 { --tw-shadow-color: ${color}4d !important; }
      .shadow-apple-blue\\/40 { --tw-shadow-color: ${color}66 !important; }
      .focus-visible\\:ring-apple-blue\\/50:focus-visible { --tw-ring-color: ${color}80 !important; }
    `;
  }, [themeColor]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, username, themeColor, login, logout, updateCredentials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
