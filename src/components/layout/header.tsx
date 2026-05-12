'use client';

import { useAppData } from '@/lib/data/store';
import { getGreeting, formatDate } from '@/lib/helpers';
import { MobileHeaderActions } from './mobile-header-actions';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data } = useAppData();
  const router = useRouter();
  const greeting = getGreeting();

  const mainTitle = title || greeting;
  const secondaryTitle = subtitle || (title ? `${greeting}, ${data.userName.split(' ')[0]}` : formatDate(new Date().toISOString()));

  return (
    <header className="flex flex-col gap-1 mb-8 pt-safe lg:pt-0">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.back()}
            className="lg:hidden w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-2 uppercase">
              {mainTitle === greeting ? (
                <>{greeting}, <span className="text-apple-blue">{data.userName.split(' ')[0]}</span></>
              ) : (
                <span className="text-apple-blue">{mainTitle}</span>
              )}
            </h1>
            <p className="text-[10px] lg:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-70">
              {secondaryTitle}
            </p>
          </div>
        </div>
        <div className="lg:hidden">
          <MobileHeaderActions />
        </div>
      </div>
    </header>
  );
}
