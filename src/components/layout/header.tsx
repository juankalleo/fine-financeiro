'use client';

import { useAppData } from '@/lib/data/store';
import { getGreeting } from '@/lib/helpers';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data } = useAppData();

  return (
    <header className="flex flex-col gap-1 mb-8">
      <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground">
        {title || `${getGreeting()}, ${data.userName}`}
      </h1>
      {subtitle && (
        <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
      )}
      {!title && (
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      )}
    </header>
  );
}
