'use client';
import { useEffect, useMemo } from 'react';
import { useClarifyStore } from '@/lib/clarify-store';
import { STAGES } from '@/lib/clarify-types';
import { generateAutoUnknowns } from '@/lib/clarify-utils';
import { InfoPanel } from './info-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertCircle, Sparkles, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Priority } from '@/lib/clarify-types';

// ─── Constants ────────────────────────────────────────────────────────

const CATEGORY_ORDER = [
  'Measurements',
  'Lifestyle',
  'Medical history',
  'Family history',
  'Other',
] as const;

const CATEGORY_OPTIONS = [...CATEGORY_ORDER];

const PRIORITY_CONFIG: Record<
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

const ALL_PRIORITIES: Priority[] = ['low', 'medium', 'high'];

// ─── Component ────────────────────────────────────────────────────────

export function Stage3Unknown() {
  // Store methods
  const getActivePerson = useClarifyStore((s) => s.getActivePerson);
  const addUnknown = useClarifyStore((s) => s.addUnknown);
  const updateUnknown = useClarifyStore((s) => s.updateUnknown);
  const removeUnknown = useClarifyStore((s) => s.removeUnknown);

  // Subscribe to the active person for reactivity
  const person = useClarifyStore((s) => {
    const id = s.activePersonId;
    return id ? s.persons.find((p) => p.id === id) : undefined;
  });

  const stage = STAGES[2]; // Stage 3

  // Stable key derived from Stage 2 data only — used to detect when
  // auto-generated unknowns need re-evaluation.
  const stage2Key = useMemo(() => {
    if (!person) return '';
    return JSON.stringify({
      m: person.measurements,
      l: person.lifestyle,
      mh: person.medicalHistory,
      fh: person.familyHistory,
    });
  }, [person]);

  // Compute auto-generated unknowns from Stage 2 gaps.
  // Depends on stage2Key (not person) to avoid recomputing when only
  // the unknowns list changes.
  const autoUnknowns = useMemo(() => {
    const p = getActivePerson();
    if (!p) return [];
    return generateAutoUnknowns(p);
  }, [stage2Key, getActivePerson]);

  // Auto-sync: add any auto-generated unknowns that aren't already present.
  useEffect(() => {
    const p = getActivePerson();
    if (!p) return;

    const existingDescriptions = new Set(p.unknowns.map((u) => u.description));

    for (const au of autoUnknowns) {
      if (!existingDescriptions.has(au.description)) {
        addUnknown(p.id, au);
      }
    }
  }, [autoUnknowns, getActivePerson, addUnknown]);

  // Group unknowns by category, preserving category order.
  const grouped: Map<string, typeof person.unknowns> = (() => {
    if (!person) return new Map();
    const map = new Map<string, typeof person.unknowns>();
    for (const u of person.unknowns) {
      const list = map.get(u.category) ?? [];
      list.push(u);
      map.set(u.category, list);
    }
    return map;
  })();

  // Priority counts for the summary bar.
  const priorityCounts = (() => {
    if (!person) return { high: 0, medium: 0, low: 0, total: 0 };
    const uks = person.unknowns;
    return {
      high: uks.filter((u) => u.priority === 'high').length,
      medium: uks.filter((u) => u.priority === 'medium').length,
      low: uks.filter((u) => u.priority === 'low').length,
      total: uks.length,
    };
  })();

  // Whether we should show the positive "all known" message.
  const showAllKnown =
    person !== undefined &&
    person.unknowns.length === 0 &&
    autoUnknowns.length === 0;

  // ─── Handlers ─────────────────────────────────────────────────

  const handleAddManual = () => {
    const p = getActivePerson();
    if (!p) return;
    addUnknown(p.id, {
      category: 'Other',
      description: '',
      autoFromStage2: false,
      priority: 'medium',
      howToFindOut: null,
    });
  };

  const handleDescriptionChange = (unknownId: string, value: string) => {
    const p = getActivePerson();
    if (!p) return;
    updateUnknown(p.id, unknownId, { description: value });
  };

  const handlePriorityChange = (unknownId: string, priority: Priority) => {
    const p = getActivePerson();
    if (!p) return;
    updateUnknown(p.id, unknownId, { priority });
  };

  const handleHowToFindOutChange = (
    unknownId: string,
    value: string,
  ) => {
    const p = getActivePerson();
    if (!p) return;
    updateUnknown(p.id, unknownId, {
      howToFindOut: value.trim() || null,
    });
  };

  const handleCategoryChange = (
    unknownId: string,
    category: string,
  ) => {
    const p = getActivePerson();
    if (!p) return;
    updateUnknown(p.id, unknownId, { category });
  };

  const handleRemove = (unknownId: string) => {
    const p = getActivePerson();
    if (!p) return;
    removeUnknown(p.id, unknownId);
  };

  // ─── Render ───────────────────────────────────────────────────

  if (!person) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Stage header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{stage.title}</h2>
        <p className="text-muted-foreground mt-1">{stage.subtitle}</p>
      </div>

      {/* Info panel */}
      <InfoPanel title="About this stage" defaultOpen>
        <p>{stage.description}</p>
        <p className="mt-2">
          Unknowns detected automatically from Stage 2 are marked{' '}
          <Badge variant="secondary" className="gap-1 text-xs">
            <Sparkles className="w-3 h-3" />
            Auto-detected
          </Badge>
          . You can adjust their priority, note how to find out, or remove
          them if no longer relevant.
        </p>
      </InfoPanel>

      {/* Summary bar */}
      {priorityCounts.total > 0 && (
        <Card className="border-dashed">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <span>
                  {priorityCounts.total}{' '}
                  {priorityCounts.total === 1
                    ? 'item'
                    : 'items'}{' '}
                  to investigate
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {ALL_PRIORITIES.map((p) => {
                  const count = priorityCounts[p];
                  if (count === 0) return null;
                  const cfg = PRIORITY_CONFIG[p];
                  return (
                    <Badge
                      key={p}
                      variant="outline"
                      className={cn('gap-1.5 text-xs', cfg.activeClasses)}
                    >
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          cfg.dotClasses,
                        )}
                      />
                      {cfg.label}: {count}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All-known positive message */}
      {showAllKnown && (
        <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-300">
                  All key information has been entered
                </p>
                <p className="text-sm text-green-700/80 dark:text-green-400/80 mt-1">
                  No gaps were detected from Stage 2. You may add additional
                  unknowns if needed, or move on to Stage 4.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unknowns grouped by category */}
      {CATEGORY_ORDER.map((category) => {
        const items = grouped.get(category);
        if (!items || items.length === 0) return null;

        return (
          <section key={category} aria-label={category}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {items.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {items.map((unknown) => (
                <UnknownCard
                  key={unknown.id}
                  personId={person.id}
                  unknown={unknown}
                  onDescriptionChange={handleDescriptionChange}
                  onPriorityChange={handlePriorityChange}
                  onHowToFindOutChange={handleHowToFindOutChange}
                  onCategoryChange={handleCategoryChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Add manual unknown button */}
      <Button
        variant="outline"
        onClick={handleAddManual}
        className="w-full sm:w-auto"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add another unknown
      </Button>
    </div>
  );
}

// ─── UnknownCard sub-component ────────────────────────────────────────

interface UnknownCardProps {
  personId: string;
  unknown: {
    id: string;
    category: string;
    description: string;
    autoFromStage2: boolean;
    priority: Priority;
    howToFindOut: string | null;
  };
  onDescriptionChange: (id: string, value: string) => void;
  onPriorityChange: (id: string, priority: Priority) => void;
  onHowToFindOutChange: (id: string, value: string) => void;
  onCategoryChange: (id: string, category: string) => void;
  onRemove: (id: string) => void;
}

function UnknownCard({
  unknown,
  onDescriptionChange,
  onPriorityChange,
  onHowToFindOutChange,
  onCategoryChange,
  onRemove,
}: UnknownCardProps) {
  return (
    <Card className="group relative">
      <CardContent className="p-4 space-y-3">
        {/* Top row: description + auto badge */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <Input
            value={unknown.description}
            onChange={(e) =>
              onDescriptionChange(unknown.id, e.target.value)
            }
            placeholder="Describe what is unknown or unclear…"
            className="font-medium text-sm border-transparent hover:border-input focus:border-input bg-transparent hover:bg-background transition-colors"
            aria-label="Unknown description"
          />
          {unknown.autoFromStage2 && (
            <Badge
              variant="secondary"
              className="shrink-0 gap-1 text-xs w-fit"
            >
              <Sparkles className="w-3 h-3" />
              Auto-detected
            </Badge>
          )}
        </div>

        {/* Category selector (always available for flexibility) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">
              Category
            </Label>
            <Select
              value={unknown.category}
              onValueChange={(val) => onCategoryChange(unknown.id, val)}
            >
              <SelectTrigger className="h-8 text-xs w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority toggle buttons */}
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">
              Priority
            </Label>
            <div className="flex items-center gap-1">
              {ALL_PRIORITIES.map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                const isActive = unknown.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPriorityChange(unknown.id, p)}
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

        {/* How to find out */}
        <div className="space-y-1.5">
          <Label
            htmlFor={`htfo-${unknown.id}`}
            className="text-xs text-muted-foreground"
          >
            How to find out{' '}
            <span className="text-muted-foreground/60">(optional)</span>
          </Label>
          <Textarea
            id={`htfo-${unknown.id}`}
            value={unknown.howToFindOut ?? ''}
            onChange={(e) =>
              onHowToFindOutChange(unknown.id, e.target.value)
            }
            placeholder="e.g. Ask GP at next appointment, check latest blood test results…"
            rows={2}
            className="text-sm resize-none"
          />
        </div>

        {/* Remove button */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(unknown.id)}
            className="text-muted-foreground hover:text-destructive h-8 px-2"
            aria-label="Remove this unknown"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-xs">Remove</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}