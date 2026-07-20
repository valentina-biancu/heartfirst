'use client';
import { useClarifyStore } from '@/lib/clarify-store';
import { STAGES } from '@/lib/clarify-types';
import type { Decision, Action } from '@/lib/clarify-types';
import { InfoPanel } from './info-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Calendar, CheckCircle2, Circle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Component ────────────────────────────────────────────────────────

export default function Stage5Next() {
  const getActivePerson = useClarifyStore((s) => s.getActivePerson);
  const addDecision = useClarifyStore((s) => s.addDecision);
  const updateDecision = useClarifyStore((s) => s.updateDecision);
  const removeDecision = useClarifyStore((s) => s.removeDecision);
  const addAction = useClarifyStore((s) => s.addAction);
  const updateAction = useClarifyStore((s) => s.updateAction);
  const removeAction = useClarifyStore((s) => s.removeAction);
  const persons = useClarifyStore((s) => s.persons);
  const activePersonId = useClarifyStore((s) => s.activePersonId);

  const person = useClarifyStore((s) => {
    const id = s.activePersonId;
    return id ? s.persons.find((p) => p.id === id) : undefined;
  });

  const stage = STAGES[4];

  if (!person) {
    return null;
  }

  const decisions = person.decisions;

  const totalActions = decisions.reduce((sum, d) => sum + d.actions.length, 0);
  const completedActions = decisions.reduce(
    (sum, d) => sum + d.actions.filter((a) => a.completed).length,
    0,
  );

  const handleAddDecision = () => {
    const p = getActivePerson();
    if (!p) return;
    addDecision(p.id);
  };

  const handleUpdateDecision = (
    decisionId: string,
    updates: Partial<Decision>,
  ) => {
    const p = getActivePerson();
    if (!p) return;
    updateDecision(p.id, decisionId, updates);
  };

  const handleRemoveDecision = (decisionId: string) => {
    const p = getActivePerson();
    if (!p) return;
    removeDecision(p.id, decisionId);
  };

  const handleAddAction = (decisionId: string) => {
    const p = getActivePerson();
    if (!p) return;
    addAction(p.id, decisionId);
  };

  const handleUpdateAction = (
    decisionId: string,
    actionId: string,
    updates: Partial<Action>,
  ) => {
    const p = getActivePerson();
    if (!p) return;
    updateAction(p.id, decisionId, actionId, updates);
  };

  const handleRemoveAction = (
    decisionId: string,
    actionId: string,
  ) => {
    const p = getActivePerson();
    if (!p) return;
    removeAction(p.id, decisionId, actionId);
  };

  return (
    <div className="space-y-6">
      {/* Stage header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{stage.title}</h2>
        <p className="text-muted-foreground mt-1">{stage.subtitle}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {stage.description}
        </p>
      </div>

      {/* Summary bar */}
      {decisions.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <strong className="font-semibold text-foreground">
              {decisions.length}
            </strong>{' '}
            {decisions.length === 1 ? 'decision' : 'decisions'}
          </span>
          <span className="flex items-center gap-1.5">
            <Circle className="w-4 h-4" />
            <strong className="font-semibold text-foreground">
              {totalActions}
            </strong>{' '}
            {totalActions === 1 ? 'action' : 'actions'}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <strong className="font-semibold text-foreground">
              {completedActions}
            </strong>{' '}
            completed
          </span>
        </div>
      )}

      {/* Info panel */}
      <InfoPanel title="Recording decisions and next actions">
        <p>
          Use this section to record what was discussed and agreed after your
          health team conversation. Write a brief summary of each key decision
          or outcome, including the date it was discussed.
        </p>
        <p className="mt-2">
          Under each decision, add the specific actions that were agreed — who
          will do what and by when. Tick the checkbox when an action is
          complete. You can also record follow-up appointment details so
          everything is in one place.
        </p>
        <p className="mt-2">
          Keeping this record up to date helps you track progress and makes it
          easier to prepare for your next appointment.
        </p>
      </InfoPanel>

      {/* Decision list */}
      {decisions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">
                No decisions recorded yet
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Add a decision to start tracking what was agreed. You can
                record outcomes, follow-up appointments, and agreed actions.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleAddDecision}
              className="mt-1"
              aria-label="Add first decision"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add decision
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {decisions.map((decision, index) => (
              <DecisionCard
                key={decision.id}
                index={index}
                decision={decision}
                onUpdate={handleUpdateDecision}
                onRemove={handleRemoveDecision}
                onAddAction={handleAddAction}
                onUpdateAction={handleUpdateAction}
                onRemoveAction={handleRemoveAction}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleAddDecision}
            className="w-full sm:w-auto"
            aria-label="Add another decision"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add decision
          </Button>
        </>
      )}
    </div>
  );
}

// ─── DecisionCard sub-component ────────────────────────────────────────

interface DecisionCardProps {
  index: number;
  decision: Decision;
  onUpdate: (id: string, updates: Partial<Decision>) => void;
  onRemove: (id: string) => void;
  onAddAction: (decisionId: string) => void;
  onUpdateAction: (
    decisionId: string,
    actionId: string,
    updates: Partial<Action>,
  ) => void;
  onRemoveAction: (decisionId: string, actionId: string) => void;
}

function DecisionCard({
  index,
  decision,
  onUpdate,
  onRemove,
  onAddAction,
  onUpdateAction,
  onRemoveAction,
}: DecisionCardProps) {
  return (
    <Card className="group relative">
      <CardHeader className="p-4 sm:p-6 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
              {index + 1}
            </span>
            <CardTitle className="text-sm font-medium text-muted-foreground truncate">
              Decision
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(decision.id)}
            className="text-muted-foreground hover:text-destructive h-8 px-2 shrink-0"
            aria-label={`Remove decision ${index + 1}`}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-xs hidden sm:inline">Remove</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-4 space-y-4">
        {/* Summary */}
        <div className="space-y-1.5">
          <Label
            htmlFor={`summary-${decision.id}`}
            className="text-sm font-medium"
          >
            Summary
          </Label>
          <Textarea
            id={`summary-${decision.id}`}
            value={decision.summary}
            onChange={(e) => onUpdate(decision.id, { summary: e.target.value })}
            placeholder="e.g. Agreed to start statin medication following discussion about cholesterol results"
            rows={3}
            className="text-sm resize-none"
          />
        </div>

        {/* Date of conversation + Appointment details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor={`date-${decision.id}`}
              className="text-xs text-muted-foreground flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              Date of conversation
            </Label>
            <Input
              id={`date-${decision.id}`}
              type="date"
              value={decision.date ?? ''}
              onChange={(e) =>
                onUpdate(decision.id, {
                  date: e.target.value || null,
                })
              }
              className="h-9 text-sm"
              aria-label={`Date of conversation for decision ${index + 1}`}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`appointment-${decision.id}`}
              className="text-xs text-muted-foreground"
            >
              Appointment details{' '}
              <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            <Textarea
              id={`appointment-${decision.id}`}
              value={decision.appointmentDetails ?? ''}
              onChange={(e) =>
                onUpdate(decision.id, {
                  appointmentDetails: e.target.value.trim() || null,
                })
              }
              placeholder="e.g. Follow-up cardiology appointment, St Mary's Hospital, 14 August"
              rows={2}
              className="text-sm resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Actions</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddAction(decision.id)}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              aria-label={`Add action to decision ${index + 1}`}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add action
            </Button>
          </div>

          {decision.actions.length > 0 && (
            <div className="pl-2 sm:pl-4 border-l-2 border-border space-y-3">
              {decision.actions.map((action) => (
                <ActionItem
                  key={action.id}
                  action={action}
                  decisionId={decision.id}
                  decisionIndex={index}
                  onUpdateAction={onUpdateAction}
                  onRemoveAction={onRemoveAction}
                />
              ))}
            </div>
          )}

          {decision.actions.length === 0 && (
            <p className="text-xs text-muted-foreground pl-2 sm:pl-4">
              No actions recorded. Use the button above to add one.
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label
            htmlFor={`notes-${decision.id}`}
            className="text-xs text-muted-foreground"
          >
            Notes{' '}
            <span className="text-muted-foreground/60">(optional)</span>
          </Label>
          <Textarea
            id={`notes-${decision.id}`}
            value={decision.notes ?? ''}
            onChange={(e) =>
              onUpdate(decision.id, {
                notes: e.target.value.trim() || null,
              })
            }
            placeholder="Any additional notes or context…"
            rows={2}
            className="text-sm resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── ActionItem sub-component ──────────────────────────────────────────

interface ActionItemProps {
  action: Action;
  decisionId: string;
  decisionIndex: number;
  onUpdateAction: (
    decisionId: string,
    actionId: string,
    updates: Partial<Action>,
  ) => void;
  onRemoveAction: (decisionId: string, actionId: string) => void;
}

function ActionItem({
  action,
  decisionId,
  decisionIndex,
  onUpdateAction,
  onRemoveAction,
}: ActionItemProps) {
  return (
    <div className="relative">
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 group/action',
          action.completed && 'opacity-70',
        )}
      >
        {/* Checkbox */}
        <div className="flex items-center gap-2 sm:pt-1.5 shrink-0">
          <Checkbox
            id={`completed-${action.id}`}
            checked={action.completed}
            onCheckedChange={(checked) =>
              onUpdateAction(decisionId, action.id, {
                completed: checked === true,
              })
            }
            aria-label={
              action.completed
                ? `Mark action "${action.description || 'unnamed'}" as incomplete`
                : `Mark action "${action.description || 'unnamed'}" as complete`
            }
          />
          {action.completed ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
          ) : (
            <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </div>

        {/* Fields */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <Label
                htmlFor={`action-desc-${action.id}`}
                className="sr-only"
              >
                Action description
              </Label>
              <Input
                id={`action-desc-${action.id}`}
                value={action.description}
                onChange={(e) =>
                  onUpdateAction(decisionId, action.id, {
                    description: e.target.value,
                  })
                }
                placeholder="What needs to be done?"
                className={cn(
                  'h-9 text-sm',
                  action.completed && 'line-through text-muted-foreground',
                )}
                aria-label={`Action description in decision ${decisionIndex + 1}`}
              />
            </div>
            <div className="w-full sm:w-40 shrink-0">
              <Label
                htmlFor={`action-due-${action.id}`}
                className="sr-only"
              >
                Due date
              </Label>
              <Input
                id={`action-due-${action.id}`}
                type="date"
                value={action.dueDate ?? ''}
                onChange={(e) =>
                  onUpdateAction(decisionId, action.id, {
                    dueDate: e.target.value || null,
                  })
                }
                className="h-9 text-sm"
                aria-label={`Due date for action in decision ${decisionIndex + 1}`}
              />
            </div>
          </div>
        </div>

        {/* Remove button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveAction(decisionId, action.id)}
          className="text-muted-foreground hover:text-destructive h-7 w-7 p-0 shrink-0 opacity-0 group-hover/action:opacity-100 focus-visible:opacity-100 transition-opacity"
          aria-label={`Remove action: ${action.description || 'unnamed action'}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {action.completed && action.dueDate && (
        <p className="text-xs text-green-600 dark:text-green-400 mt-1 ml-[2.25rem]">
          Completed
        </p>
      )}
    </div>
  );
}