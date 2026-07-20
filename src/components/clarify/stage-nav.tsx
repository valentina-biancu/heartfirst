'use client';

import { useClarifyStore } from '@/lib/clarify-store';
import { STAGES } from '@/lib/clarify-types';
import { cn } from '@/lib/utils';
import {
  Heart,
  Users,
  ClipboardList,
  HelpCircle,
  MessageSquare,
  CheckSquare,
  FileText,
  ChevronRight,
} from 'lucide-react';

const STAGE_ICONS = [null, Heart, Users, HelpCircle, MessageSquare, CheckSquare, FileText];

export function StageNav() {
  const currentStage = useClarifyStore((s) => s.currentStage);
  const setStage = useClarifyStore((s) => s.setStage);
  const persons = useClarifyStore((s) => s.persons);
  const started = useClarifyStore((s) => s.started);

  if (!started) return null;

  const stages = [
    { number: 1, label: 'Who needs clarity?', shortLabel: 'Who' },
    { number: 2, label: 'What do we know?', shortLabel: 'Known' },
    { number: 3, label: 'Unknown or unclear?', shortLabel: 'Unknowns' },
    { number: 4, label: 'Needs discussion?', shortLabel: 'Discuss' },
    { number: 5, label: 'What happens next?', shortLabel: 'Next' },
    { number: 6, label: 'Outputs', shortLabel: 'Outputs' },
  ];

  return (
    <nav aria-label="Progress through Clarify" className="mb-6">
      {/* Desktop */}
      <ol className="hidden md:flex items-center gap-1" role="list">
        {stages.map((stage, i) => {
          const Icon = STAGE_ICONS[stage.number];
          const isActive = currentStage === stage.number;
          const isPast = currentStage > stage.number;
          const isClickable = isPast || isActive;

          return (
            <li key={stage.number} className="flex items-center flex-1 min-w-0">
              <button
                onClick={() => isClickable && setStage(stage.number)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full min-w-0',
                  isActive && 'bg-primary text-primary-foreground',
                  isPast && 'bg-muted text-muted-foreground hover:bg-accent cursor-pointer',
                  !isPast && !isActive && 'text-muted-foreground/50',
                  isClickable && 'cursor-pointer'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-background"
                  style={{
                    borderColor: isActive ? 'var(--primary-foreground)' : isPast ? 'var(--muted-foreground)' : 'var(--border)',
                    color: isActive ? 'var(--primary)' : isPast ? 'var(--muted-foreground)' : 'var(--border)',
                  }}
                >
                  {isPast ? '✓' : stage.number}
                </span>
                <span className="truncate hidden lg:inline">{stage.label}</span>
                <span className="truncate lg:hidden">{stage.shortLabel}</span>
              </button>
              {i < stages.length - 1 && (
                <ChevronRight className="flex-shrink-0 w-4 h-4 text-muted-foreground/40 mx-1" />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile */}
      <div className="flex md:hidden gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {stages.map((stage) => {
          const isActive = currentStage === stage.number;
          const isPast = currentStage > stage.number;
          const isClickable = isPast || isActive;

          return (
            <button
              key={stage.number}
              onClick={() => isClickable && setStage(stage.number)}
              disabled={!isClickable}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                isActive && 'bg-primary text-primary-foreground',
                isPast && 'bg-muted text-muted-foreground hover:bg-accent cursor-pointer',
                !isPast && !isActive && 'bg-muted/50 text-muted-foreground/50',
                isClickable && 'cursor-pointer'
              )}
            >
              {stage.shortLabel}
            </button>
          );
        })}
      </div>
    </nav>
  );
}