'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Info } from 'lucide-react';

interface InfoPanelProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function InfoPanel({ title, children, defaultOpen = false }: InfoPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors',
          'hover:bg-accent/50'
        )}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          {title}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
          {children}
        </div>
      )}
    </div>
  );
}