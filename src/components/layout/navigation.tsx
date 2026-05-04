'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useUI } from '@/lib/ui-store';
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Receipt,
  Settings,
  Bell,
  Sun,
  Moon,
  PiggyBank,
  Menu,
  LogOut,
  User,
  Search,
  ChevronDown,
  Plus,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/subscriptions', label: 'Assinaturas', icon: CreditCard },
  { href: '/bills', label: 'Contas', icon: Receipt },
  { href: '/reserves', label: 'Reservas', icon: PiggyBank },
  { href: '/records', label: 'Registros', icon: FileText },
  { href: '/notifications', label: 'Avisos', icon: Bell },
  { href: '/settings', label: 'Ajustes', icon: Settings },
];

export function MobileTopBar() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-14 px-6 flex items-center justify-between z-40 bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-apple-blue flex items-center justify-center">
          <Image src="/icons/icon-192.png" alt="F" width={20} height={20} className="invert brightness-0" />
        </div>
        <span className="text-lg font-black uppercase tracking-tighter">Fine</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-muted-foreground"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 rounded-full bg-apple-blue/10 flex items-center justify-center border border-apple-blue/20"
          >
            <User className="w-5 h-5 text-apple-blue" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-border/40 py-2 z-50 overflow-hidden"
                >
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
    </div>
  );
}

export function TopBar() {
  const { isSidebarCollapsed } = useUI();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const currentPage = navItems.find(item => item.href === pathname)?.label || 'Fine';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header 
      className={`fixed top-0 right-0 h-14 bg-[var(--app-frame)] z-30 lg:flex hidden items-center justify-between px-10 transition-all duration-300 ${
        isSidebarCollapsed ? 'left-14' : 'left-64'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-white/50 uppercase">
          <span>Fine</span>
          <span className="opacity-30">/</span>
          <span className="text-white">{currentPage}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 hover:bg-white/10 rounded-xl group transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
              <User className="w-4 h-4 text-[var(--app-frame)]" />
            </div>
            <ChevronDown className={`w-3 h-3 text-white/50 group-hover:text-white transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-border/40 py-2 z-50 overflow-hidden"
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
                    Sair do Fine
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useUI();

  return (
    <aside 
      className={`fixed top-0 left-0 bottom-0 bg-[var(--app-frame)] z-40 transition-all duration-300 ease-in-out lg:flex hidden flex-col ${
        isSidebarCollapsed ? 'w-14' : 'w-64'
      }`}
    >
      <div className="h-14 flex items-center px-4 gap-3 shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-2xl overflow-hidden">
           <Image src="/icons/icon-192.png" alt="F" width={24} height={24} className="object-contain" />
        </div>
        {!isSidebarCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 min-w-0"
          >
            <p className="text-xl font-black text-white tracking-tighter uppercase leading-none">Fine</p>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 py-6 px-3 overflow-y-auto no-scrollbar">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative block group"
              >
                <div
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-[13px] font-black tracking-tight transition-all ${
                    isActive
                      ? 'bg-white text-[var(--app-frame)] shadow-2xl shadow-black/20 scale-[1.03]'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  
                  {!isSidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                  
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 text-white text-[11px] rounded-xl shadow-2xl shadow-black/40 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto p-3">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center gap-3.5 px-3.5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 hover:text-white transition-all"
        >
          <Menu className="w-5 h-5 shrink-0" />
          {!isSidebarCollapsed && <span>Recolher</span>}
        </button>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--app-frame)] border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <nav className="flex items-center justify-around py-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-1 px-3 min-w-[56px]"
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-white/50'}`} />
              <span className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-white/50'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
