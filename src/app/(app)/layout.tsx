'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppProvider } from '@/lib/data/store';
import { Sidebar, BottomNav, TopBar, MobileTopBar } from '@/components/layout/navigation';
import { useUI } from '@/lib/ui-store';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, username, themeColor } = useAuth();
  const router = useRouter();
  const { isSidebarCollapsed } = useUI();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
    
    // Apply theme to document root for global CSS variable override
    if (themeColor) {
      document.documentElement.setAttribute('data-theme-color', themeColor);
    }
  }, [isAuthenticated, isLoading, router, themeColor]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-zinc-950">
        <div className="w-16 h-16 rounded-3xl bg-white dark:bg-zinc-900 flex items-center justify-center shadow-2xl animate-pulse">
          <div className="w-8 h-8 border-4 border-apple-blue/30 border-t-apple-blue rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <AppProvider username={username} key={username}>
      <div 
        data-theme-color={themeColor}
        className="fixed inset-0 bg-background dark:bg-zinc-950 text-foreground transition-all duration-500 overflow-hidden flex flex-col"
      >
        <Sidebar />
        <div
          className={`flex-1 transition-all duration-300 flex flex-col min-h-0 relative ${isSidebarCollapsed ? 'lg:ml-14' : 'lg:ml-64'
            }`}
          style={{ backgroundColor: 'var(--app-frame)' }}
        >
          <TopBar />

          {/* Inverted Corners for Premium Frame Look */}
          <div className={`fixed top-14 transition-all duration-300 z-50 lg:block hidden pointer-events-none ${isSidebarCollapsed ? 'left-14' : 'left-64'}`}>
            <div className="absolute top-0 left-0 w-10 h-10" style={{ backgroundColor: 'var(--app-frame)' }}>
              <div className="w-full h-full bg-background dark:bg-zinc-950 rounded-tl-[40px]" />
            </div>
          </div>
          <div className={`fixed bottom-0 transition-all duration-300 z-50 lg:block hidden pointer-events-none ${isSidebarCollapsed ? 'left-14' : 'left-64'}`}>
            <div className="absolute bottom-0 left-0 w-10 h-10" style={{ backgroundColor: 'var(--app-frame)' }}>
              <div className="w-full h-full bg-background dark:bg-zinc-950 rounded-bl-[40px]" />
            </div>
          </div>

          {/* Main Content Frame */}
          <div className="flex-1 lg:mt-14 bg-background dark:bg-zinc-950 lg:rounded-tl-[40px] lg:rounded-bl-[40px] relative overflow-hidden shadow-2xl">
            <main className="absolute inset-0 overflow-y-auto no-scrollbar scroll-smooth">
              <div className="w-full px-6 sm:px-12 lg:px-16 pt-0 lg:py-12 pb-24 lg:pb-12">
                {children}
              </div>
            </main>
          </div>
          <BottomNav />
        </div>
      </div>
    </AppProvider>
  );
}
