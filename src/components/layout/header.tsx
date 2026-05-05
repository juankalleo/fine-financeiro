'use client';

import { useAppData } from '@/lib/data/store';
import { getGreeting, formatDate } from '@/lib/helpers';
import { MobileHeaderActions } from './mobile-header-actions';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data } = useAppData();
  const greeting = getGreeting();

  return (
    <header className="flex flex-col gap-1 mb-8 pt-[env(safe-area-inset-top)] lg:pt-0">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-2">
            {greeting}, <span className="text-apple-blue">{data.userName.split(' ')[0]}</span>
          </h1>
          <p className="text-[10px] lg:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-70">
            {subtitle || formatDate(new Date().toISOString())}
          </p>
        </div>
        <div className="lg:hidden">
          <MobileHeaderActions />
        </div>
      </div>
      {title && title !== greeting && (
        <h2 className="text-lg font-black mt-2 text-foreground/80 uppercase tracking-tight">{title}</h2>
      )}
    </header>
  );
}
