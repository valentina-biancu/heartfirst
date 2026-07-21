'use client';

import { useClarifyStore } from '@/lib/clarify-store';
import { personLabel } from '@/lib/clarify-utils';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PersonSelector({ showAdd = true }: { showAdd?: boolean }) {
  const persons = useClarifyStore((s) => s.persons);
  const activePersonId = useClarifyStore((s) => s.activePersonId);
  const setActivePersonId = useClarifyStore((s) => s.setActivePersonId);
  const addPerson = useClarifyStore((s) => s.addPerson);
  const removePerson = useClarifyStore((s) => s.removePerson);
  const currentStage = useClarifyStore((s) => s.currentStage);

  if (persons.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">Working on:</span>
        {showAdd && currentStage === 1 && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => addPerson('self')}
            >
              <Plus className="w-3 h-3 mr-1" />
              Self
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => addPerson('loved-one')}
            >
              <Plus className="w-3 h-3 mr-1" />
              Loved one
            </Button>
          </div>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        {persons.map((p) => {
          const isActive = p.id === activePersonId;
          return (
            <div
              key={p.id}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border cursor-pointer',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-accent'
              )}
              onClick={() => setActivePersonId(p.id)}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActivePersonId(p.id)}
            >
              <span>{personLabel(p)}</span>
              {persons.length > 1 && currentStage === 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePerson(p.id);
                  }}
                  className="ml-1 w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20"
                  aria-label={`Remove ${personLabel(p)}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}