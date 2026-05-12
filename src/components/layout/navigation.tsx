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
  { href: '/lancamentos', label: 'Lançamentos', icon: Plus },
  { href: '/subscriptions', label: 'Assinaturas', icon: CreditCard },
  { href: '/bills', label: 'Contas', icon: Receipt },
  { href: '/reserves', label: 'Reservas', icon: PiggyBank },
  { href: '/records', label: 'Registros', icon: FileText },
  { href: '/notifications', label: 'Avisos', icon: Bell },
  { href: '/settings', label: 'Ajustes', icon: Settings },
];

export function MobileTopBar() {
  return null;
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
      className={`fixed top-0 right-0 h-14 z-30 lg:flex hidden items-center justify-between px-10 transition-all duration-300 ${isSidebarCollapsed ? 'left-14' : 'left-64'
        }`}
      style={{ backgroundColor: 'var(--app-frame)' }}
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
            <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-lg">
              <User className="w-4 h-4 text-app-frame dark:text-apple-blue" />
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
      className={`fixed top-0 left-0 bottom-0 z-40 transition-all duration-300 ease-in-out lg:flex hidden flex-col ${isSidebarCollapsed ? 'w-14' : 'w-64'
        }`}
      style={{ backgroundColor: 'var(--app-frame)' }}
    >
      <div className="h-20 flex items-center px-4 gap-3 shrink-0">
        {!isSidebarCollapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 min-w-0 text-center"
          >
            <p className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Fine</p>
          </motion.div>
        ) : (
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-2xl border border-white/10 mx-auto">
            <span className="text-xl font-black text-white tracking-tighter">F</span>
          </div>
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
                  className={`flex items-center rounded-2xl text-[16px] font-black tracking-tight transition-all ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-4 px-4 py-3.5'
                    } ${isActive
                      ? 'bg-white/20 text-white shadow-2xl shadow-black/20 scale-[1.03] border border-white/10'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <Icon className={`${isSidebarCollapsed ? 'w-5 h-5' : 'w-6 h-6'} shrink-0`} />

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
          className={`w-full flex items-center rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 hover:text-white transition-all ${isSidebarCollapsed ? 'justify-center p-3.5' : 'gap-3.5 px-3.5 py-3.5'
            }`}
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

  // Custom order for mobile to put Lançamentos in the middle
  const mobileItems = [
    navItems[0], // Início
    navItems[2], // Assinaturas
    navItems[1], // Lançamentos (Middle)
    navItems[3], // Contas
    navItems[5], // Registros
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-2xl border-t border-white/[0.05] pb-safe-tight shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
      <nav className="flex items-center justify-around h-12 px-2">
        {mobileItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isMiddle = index === 2;

          if (isMiddle) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center -mt-4"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 ${isActive
                  ? 'bg-apple-blue text-white scale-110 shadow-apple-blue/40'
                  : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-black/20'
                  }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[7px] font-black uppercase tracking-tighter mt-1 ${isActive ? 'text-apple-blue' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 py-1 px-1 min-w-[60px]"
            >
              <Icon className={`w-4.5 h-4.5 transition-all ${isActive ? 'text-apple-blue' : 'text-muted-foreground opacity-60'}`} />
              <span className={`text-[7px] font-black uppercase tracking-tighter ${isActive ? 'text-apple-blue' : 'text-muted-foreground opacity-60'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

