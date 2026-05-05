'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, User, Settings, LogOut, ChevronDown } from 'lucide-react';

interface MobileHeaderActionsProps {
  variant?: 'light' | 'dark' | 'transparent';
}

export function MobileHeaderActions({ variant = 'transparent' }: MobileHeaderActionsProps) {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const buttonClass = variant === 'dark' 
    ? "p-2 text-white/70 hover:text-white bg-white/10 rounded-full transition-colors"
    : "p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors";

  const profileButtonClass = variant === 'dark'
    ? "w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-white"
    : "w-10 h-10 rounded-full bg-apple-blue/10 flex items-center justify-center border border-apple-blue/20 text-apple-blue";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={buttonClass}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      
      <div className="relative">
        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={profileButtonClass}
        >
          <User className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setShowProfileMenu(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-border/40 py-2 z-[70] overflow-hidden"
              >
                <div className="px-4 py-1 border-b border-border/40 mb-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sua Conta</p>
                </div>
                <button
                  onClick={() => {
                    router.push('/settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-secondary transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Ajustes
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
