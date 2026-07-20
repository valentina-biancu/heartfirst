'use client';
import { useClarifyStore } from '@/lib/clarify-store';
import { STAGES } from '@/lib/clarify-types';
import type { Priority } from '@/lib/clarify-types';
import { InfoPanel } from './info-panel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Link2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────

const URGENCY_CONFIG: Record<
  Priority,
  { label: string; activeClasses: string; dotClasses: string }
> = {
  high: {
    label: 'High',
    activeClasses:
      'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    dotClasses: 'bg-red-500',
  },
  medium: {
    label: 'Medium',
    activeClasses:
      'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    dotClasses: 'bg-amber-500',
  },
  low: {
    label: 'Low',
    activeClasses:
      'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    dotClasses: 'bg-green-500',
  },
};

const ALL_URGENCIES: Priority[] = ['low', 'medium', 'high'];

// ─── Component ────────────────────────────────────────────────────────

export function Stage4Discuss() {
  const getActivePerson = useClarifyStore((s) => s.getActivePerson);
  const addDiscussionPoint = useClarifyStore((s) => s.addDiscussionPoint);
  const updateDiscussionPoint = useClarifyStore((s) => s.updateDiscussionPoint);
  const removeDiscussionPoint = useClarifyStore((s) => s.removeDiscussionPoint);

  // Subscribe to the active person for reactivity
  const person = useClarifyStore((s) => {
    const id = s.activePersonId;
    return id ? s.persons.find((p) => p.id === id) : undefined;
  });

  const stage = STAGES[3]; // Stage 4

  // ─── Handlers ─────────────────────────────────────────────────

  const handleAdd = () => {
    const p = getActivePerson();
    if (!p) return;
    addDiscussionPoint(p.id);
  };

  const handleUpdate = (pointId: string, updates: Partial<Parameters<typeof updateDiscussionPoint>[2]>) => {
    const p = getActivePerson();
    if (!p) return;
    updateDiscussionPoint(p.id, pointId, updates);
  };

  const handleRemove = (pointId: string) => {
    const p = getActivePerson();
    if (!p) return;
    removeDiscussionPoint(p.id, pointId);
  };

  // ─── Render ───────────────────────────────────────────────────

  if (!person) {
    return null;
  }

  const unknowns = person.unknowns;
  const points = person.discussionPoints;

  return (
    <div className="space-y-6">
      {/* Stage header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{stage.title}</h2>
        <p className="text-muted-foreground mt-1">{stage.subtitle}</p>
        <p className="text-sm text-muted-foreground mt-2">{stage.description}</p>
      </div>

      {/* Info panel */}
      <InfoPanel title="How to prepare for a health team conversation" defaultOpen>
        <p>
          Write down the specific questions or concerns you want to raise, rather than relying on memory during the
          appointment. Bringing a printed copy of your Heart Risk Audit and Missing-Information Summary can help your
          health team give you focused, relevant advice.
        </p>
        <p className="mt-2">
          Note which topics matter most to you and who you would like present at the conversation — for example, a
          partner, family member, or a specialist. Even two or three well-prepared questions can make a significant
          difference.
        </p>
      </InfoPanel>

      {/* Discussion points */}
      {points.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">No discussion points yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Add your first question or concern to start building your Health Team Discussion Brief. Think about
                what you most want to ask your doctor, nurse, or specialist.
              </p>
            </div>
            <Button variant="outline" onClick={handleAdd} className="mt-1">
              <Plus className="w-4 h-4 mr-2" />
              Add discussion point
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {points.map((point, index) => (
              <DiscussionPointCard
                key={point.id}
                index={index}
                point={point}
                unknowns={unknowns}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleAdd}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add discussion point
          </Button>
        </>
      )}
    </div>
  );
}

// ─── DiscussionPointCard sub-component ────────────────────────────────

interface DiscussionPointCardProps {
  index: number;
  point: {
    id: string;
    question: string;
    linkedUnknownId: string | null;
    urgency: Priority;
    whoShouldBePresent: string | null;
    notes: string | null;
  };
  unknowns: { id: string; description: string }[];
  onUpdate: (id: string, updates: { question?: string; linkedUnknownId?: string | null; urgency?: Priority; whoShouldBePresent?: string | null; notes?: string | null }) => void;
  onRemove: (id: string) => void;
}

function DiscussionPointCard({
  index,
  point,
  unknowns,
  onUpdate,
  onRemove,
}: DiscussionPointCardProps) {
  const truncatedUnknowns = unknowns.filter((u) => u.description.trim().length > 0);

  return (
    <Card className="group relative">
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Numbered header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
              {index + 1}
            </span>
            <span className="text-sm font-medium text-muted-foreground truncate">
              Discussion point
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(point.id)}
            className="text-muted-foreground hover:text-destructive h-8 px-2 shrink-0"
            aria-label={`Remove discussion point ${index + 1}`}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-xs hidden sm:inline">Remove</span>
          </Button>
        </div>

        {/* Question / concern */}
        <div className="space-y-1.5">
          <Label htmlFor={`question-${point.id}`} className="text-sm font-medium">
            Question or concern
          </Label>
          <Textarea
            id={`question-${point.id}`}
            value={point.question}
            onChange={(e) => onUpdate(point.id, { question: e.target.value })}
            placeholder="e.g. What does my latest cholesterol reading mean in the context of my family history?"
            rows={2}
            className="text-sm resize-none"
          />
        </div>

        {/* Linked unknown + Urgency row */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Link to unknown */}
          <div className="flex-1 space-y-1.5 min-w-0">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Link to unknown
            </Label>
            <Select
              value={point.linkedUnknownId ?? '__none__'}
              onValueChange={(val) =>
                onUpdate(point.id, { linkedUnknownId: val === '__none__' ? null : val })
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select an unknown…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Not linked</SelectItem>
                {truncatedUnknowns.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    <span className="truncate">{u.description}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Urgency toggle buttons */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Urgency</Label>
            <div className="flex items-center gap-1">
              {ALL_URGENCIES.map((u) => {
                const cfg = URGENCY_CONFIG[u];
                const isActive = point.urgency === u;
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => onUpdate(point.id, { urgency: u })}
                    className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-full border transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      isActive
                        ? cn(cfg.activeClasses, 'shadow-sm')
                        : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground',
                    )}
                    aria-pressed={isActive}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Who should be present + Notes row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Who should be present */}
          <div className="space-y-1.5">
            <Label htmlFor={`who-${point.id}`} className="text-xs text-muted-foreground">
              Who should be present{' '}
              <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            <Input
              id={`who-${point.id}`}
              value={point.whoShouldBePresent ?? ''}
              onChange={(e) =>
                onUpdate(point.id, {
                  whoShouldBePresent: e.target.value.trim() || null,
                })
              }
              placeholder="e.g. Partner, Cardiologist"
              className="h-9 text-sm"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor={`notes-${point.id}`} className="text-xs text-muted-foreground">
              Notes{' '}
              <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            <Textarea
              id={`notes-${point.id}`}
              value={point.notes ?? ''}
              onChange={(e) =>
                onUpdate(point.id, {
                  notes: e.target.value.trim() || null,
                })
              }
              placeholder="Any extra context or reminders…"
              rows={2}
              className="text-sm resize-none"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}