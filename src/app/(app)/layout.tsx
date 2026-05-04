'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppProvider } from '@/lib/data/store';
import { Sidebar, BottomNav, TopBar } from '@/components/layout/navigation';
import { useUI } from '@/lib/ui-store';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { isSidebarCollapsed } = useUI();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-apple-blue">
        <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-2xl animate-pulse">
           <div className="w-8 h-8 border-4 border-apple-blue/30 border-t-apple-blue rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <div className="fixed inset-0 bg-[var(--app-frame)] text-foreground transition-all duration-500 overflow-hidden flex flex-col">
        <Sidebar />
        <div 
          className={`flex-1 transition-all duration-300 flex flex-col h-full ${
            isSidebarCollapsed ? 'lg:ml-14' : 'lg:ml-64'
          }`}
        >
          <TopBar />
          
          {/* Main Content Frame - Full Width, rounded only on the left side */}
          <div className="flex-1 mt-14 bg-background dark:bg-zinc-950 rounded-tl-[40px] rounded-bl-[40px] relative overflow-hidden shadow-2xl">
             <main className="absolute inset-0 overflow-y-auto no-scrollbar scroll-smooth">
                <div className="w-full px-8 sm:px-12 lg:px-16 py-12">
                  {children}
                </div>
             </main>
          </div>
        </div>
        <BottomNav />
      </div>
    </AppProvider>
  );
}
