'use client';

import { useClarifyStore } from '@/lib/clarify-store';
import { RELATIONSHIP_OPTIONS, SEX_OPTIONS, STAGES } from '@/lib/clarify-types';
import { personLabel } from '@/lib/clarify-utils';
import { InfoPanel } from './info-panel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Users, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Stage1Who() {
  const addPerson = useClarifyStore((s) => s.addPerson);
  const persons = useClarifyStore((s) => s.persons);
  const activePersonId = useClarifyStore((s) => s.activePersonId);
  const getActivePerson = useClarifyStore((s) => s.getActivePerson);
  const updatePerson = useClarifyStore((s) => s.updatePerson);
  const setActivePersonId = useClarifyStore((s) => s.setActivePersonId);

  const stage = STAGES[0];
  const activePerson = getActivePerson();

  // ── No persons yet: show welcome selection ──────────────────
  if (persons.length === 0) {
    return (
      <div className="space-y-6">
        {/* Stage header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {stage.title}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {stage.description}
          </p>
        </div>

        {/* Choice cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <button
            onClick={() => addPerson('self')}
            className={cn(
              'group flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border',
              'p-6 sm:p-8 text-center transition-all',
              'hover:border-primary hover:bg-accent/30',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
            aria-label="Add yourself as the person you are gathering information for"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <User className="w-7 h-7" />
            </div>
            <div>
              <p className="text-lg font-semibold">Myself</p>
              <p className="text-sm text-muted-foreground mt-1">
                I want to understand my own heart risk
              </p>
            </div>
          </button>

          <button
            onClick={() => addPerson('loved-one')}
            className={cn(
              'group flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border',
              'p-6 sm:p-8 text-center transition-all',
              'hover:border-primary hover:bg-accent/30',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
            aria-label="Add someone you love as the person you are gathering information for"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-lg font-semibold">Someone I love</p>
              <p className="text-sm text-muted-foreground mt-1">
                I want to help a loved one understand theirs
              </p>
            </div>
          </button>
        </div>

        {/* Info panel */}
        <InfoPanel title="Why does this stage matter?" defaultOpen>
          <p>
            HeartFirst Clarify is designed around a specific person. By telling us who you are
            gathering information for, we can tailor every subsequent stage to that person&apos;s
            context and make the outputs personal and actionable.
          </p>
          <p className="mt-2">
            You can add more than one person (for example, yourself and a parent) and switch
            between them at any time using the tabs at the top of the screen.
          </p>
        </InfoPanel>
      </div>
    );
  }

  // ── Person form ──────────────────────────────────────────────
  const isLovedOne = activePerson?.role === 'loved-one';
  const showOtherRelationship = isLovedOne && activePerson?.relationship === 'Other';

  return (
    <div className="space-y-6">
      {/* Stage header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {stage.title}
        </h2>
        <p className="text-muted-foreground">{stage.description}</p>
      </div>

      {/* Person selector tabs */}
      {persons.length > 1 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Select person to edit">
          {persons.map((p) => {
            const isActive = p.id === activePersonId;
            return (
              <button
                key={p.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActivePersonId(p.id)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {p.role === 'self' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Users className="w-4 h-4" />
                )}
                {personLabel(p)}
              </button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => addPerson('loved-one')}
            aria-label="Add another person"
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add person
          </Button>
        </div>
      )}

      {/* Form card */}
      {activePerson && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {activePerson.role === 'self' ? (
                <User className="w-5 h-5 text-primary" />
              ) : (
                <Users className="w-5 h-5 text-primary" />
              )}
              {personLabel(activePerson)}
            </CardTitle>
            <CardDescription>
              {activePerson.role === 'self'
                ? 'Tell us a little about yourself (all fields are optional).'
                : 'Tell us a little about this person (all fields are optional).'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Display name */}
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                type="text"
                placeholder="e.g. Mum, David, Gran — or leave blank"
                value={activePerson.displayName ?? ''}
                onChange={(e) =>
                  updatePerson(activePerson.id, {
                    displayName: e.target.value || null,
                  })
                }
                aria-label="Display name for this person"
              />
              <p className="text-xs text-muted-foreground">
                This is only for your reference and will not be shared unless you choose to.
              </p>
            </div>

            {/* Approximate age */}
            <div className="space-y-2">
              <Label htmlFor="approximate-age">Approximate age</Label>
              <Input
                id="approximate-age"
                type="text"
                placeholder={"e.g. 45, early 60s, or \"I don't know\""}
                value={activePerson.approximateAge ?? ''}
                onChange={(e) =>
                  updatePerson(activePerson.id, {
                    approximateAge: e.target.value || null,
                  })
                }
                aria-label="Approximate age"
              />
            </div>

            {/* Sex */}
            <div className="space-y-2">
              <Label htmlFor="sex-select">Sex</Label>
              <Select
                value={activePerson.sex ?? ''}
                onValueChange={(val) =>
                  updatePerson(activePerson.id, { sex: val || null })
                }
              >
                <SelectTrigger id="sex-select" aria-label="Select sex">
                  <SelectValue placeholder="Select or type to search" />
                </SelectTrigger>
                <SelectContent>
                  {SEX_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Relationship — loved-ones only */}
            {isLovedOne && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="relationship-select">Relationship to you</Label>
                  <Select
                    value={activePerson.relationship ?? ''}
                    onValueChange={(val) =>
                      updatePerson(activePerson.id, {
                        relationship: val || null,
                        // Clear detail when switching away from "Other"
                        relationshipDetail: val === 'Other' ? activePerson.relationshipDetail : null,
                      })
                    }
                  >
                    <SelectTrigger id="relationship-select" aria-label="Select relationship">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {showOtherRelationship && (
                  <div className="space-y-2">
                    <Label htmlFor="relationship-detail">Please specify the relationship</Label>
                    <Input
                      id="relationship-detail"
                      type="text"
                      placeholder="e.g. neighbour, carer, mentor"
                      value={activePerson.relationshipDetail ?? ''}
                      onChange={(e) =>
                        updatePerson(activePerson.id, {
                          relationshipDetail: e.target.value || null,
                        })
                      }
                      aria-label="Specify relationship"
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info panel */}
      <InfoPanel title="About this stage">
        <p>
          {stage.description}
        </p>
        <p className="mt-2">
          All fields on this stage are optional. The information you provide here helps personalise
          the outputs in later stages and makes it easier to distinguish between multiple people
          if you are gathering information for more than one person.
        </p>
      </InfoPanel>
    </div>
  );
}