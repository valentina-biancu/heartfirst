'use client';
import { useState, useMemo } from 'react';
import { useClarifyStore } from '@/lib/clarify-store';
import { OUTPUTS } from '@/lib/clarify-types';
import { personLabel, personIdentityForOutput, hasStage2Data, formatDate, printOutput } from '@/lib/clarify-utils';
import type { Person, Priority } from '@/lib/clarify-types';
import { InfoPanel } from './info-panel';
import { PersonSelector } from './person-selector';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  ClipboardList, HelpCircle, MessageSquare, CheckSquare, Users, Package,
  Printer, Eye, ChevronDown, ChevronUp, AlertTriangle, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Icon Map ──────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'ClipboardList': ClipboardList,
  'HelpCircle': HelpCircle,
  'MessageSquare': MessageSquare,
  'CheckSquare': CheckSquare,
  'Users': Users,
  'Package': Package,
};

// ─── Priority Badge Colours ────────────────────────────────────

const PRIORITY_STYLES: Record<Priority, string> = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

// ─── Medical Disclaimer ────────────────────────────────────────

function MedicalDisclaimer() {
  return (
    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 print:bg-amber-50 print:border-amber-200">
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <p>
        This document was prepared using HeartFirst Clarify. It is a personal
        organisational tool — not a clinical assessment, diagnostic tool, or
        substitute for professional medical advice. Always discuss heart risk
        with a qualified health professional.
      </p>
    </div>
  );
}

// ─── Helper: "I don't know" check ──────────────────────────────

function isDontKnow(value: string | null | undefined): boolean {
  return !!value && value.trim() === "I don't know";
}

// ─── Output 1: Heart Risk Audit Record ─────────────────────────

function HeartRiskAuditRenderer({ person }: { person: Person }) {
  const m = person.measurements;
  const l = person.lifestyle;
  const mh = person.medicalHistory;
  const fh = person.familyHistory;
  const of = person.otherFactors;

  const renderValue = (value: string | null | undefined, label: string) => {
    if (!value || value.trim() === '') return null;
    if (isDontKnow(value)) {
      return (
        <div key={label} className="flex justify-between py-1">
          <span className="text-muted-foreground">{label}</span>
          <span className="italic text-muted-foreground">I don&apos;t know</span>
        </div>
      );
    }
    return (
      <div key={label} className="flex justify-between py-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
    );
  };

  // Measurements section
  const measurementRows: React.ReactNode[] = [];
  if (m.bloodPressure.systolic || m.bloodPressure.diastolic) {
    const bpText = [m.bloodPressure.systolic, m.bloodPressure.diastolic].filter(Boolean).join('/');
    measurementRows.push(renderValue(bpText, 'Blood pressure'));
  } else if (m.bloodPressure.systolic === null && m.bloodPressure.diastolic === null) {
    // no data, skip
  }
  if (m.bloodPressure.date) {
    measurementRows.push(renderValue(formatDate(m.bloodPressure.date), 'BP date'));
  }
  if (m.bloodPressure.notes) {
    measurementRows.push(
      <div key="bp-notes" className="py-1 text-sm text-muted-foreground">
        BP notes: {m.bloodPressure.notes}
      </div>
    );
  }
  if (m.cholesterol.total) measurementRows.push(renderValue(m.cholesterol.total, 'Total cholesterol'));
  if (m.cholesterol.ldl) measurementRows.push(renderValue(m.cholesterol.ldl, 'LDL cholesterol'));
  if (m.cholesterol.hdl) measurementRows.push(renderValue(m.cholesterol.hdl, 'HDL cholesterol'));
  if (m.cholesterol.triglycerides) measurementRows.push(renderValue(m.cholesterol.triglycerides, 'Triglycerides'));
  if (m.cholesterol.date) measurementRows.push(renderValue(formatDate(m.cholesterol.date), 'Cholesterol date'));
  if (m.cholesterol.notes) {
    measurementRows.push(
      <div key="chol-notes" className="py-1 text-sm text-muted-foreground">
        Cholesterol notes: {m.cholesterol.notes}
      </div>
    );
  }
  if (m.bloodSugar.value) {
    measurementRows.push(
      renderValue(`${m.bloodSugar.value}${m.bloodSugar.unit ? ` ${m.bloodSugar.unit}` : ''}`, 'Blood sugar')
    );
  }
  if (m.bloodSugar.hba1c) measurementRows.push(renderValue(m.bloodSugar.hba1c, 'HbA1c'));
  if (m.bloodSugar.date) measurementRows.push(renderValue(formatDate(m.bloodSugar.date), 'Blood sugar date'));
  if (m.bloodSugar.notes) {
    measurementRows.push(
      <div key="bs-notes" className="py-1 text-sm text-muted-foreground">
        Blood sugar notes: {m.bloodSugar.notes}
      </div>
    );
  }
  if (m.bmi.weight) {
    measurementRows.push(
      renderValue(`${m.bmi.weight}${m.bmi.weightUnit ? ` ${m.bmi.weightUnit}` : ''}`, 'Weight')
    );
  }
  if (m.bmi.height) {
    measurementRows.push(
      renderValue(`${m.bmi.height}${m.bmi.heightUnit ? ` ${m.bmi.heightUnit}` : ''}`, 'Height')
    );
  }
  if (m.bmi.date) measurementRows.push(renderValue(formatDate(m.bmi.date), 'BMI date'));
  if (m.bmi.notes) {
    measurementRows.push(
      <div key="bmi-notes" className="py-1 text-sm text-muted-foreground">
        BMI notes: {m.bmi.notes}
      </div>
    );
  }
  if (m.notes) {
    measurementRows.push(
      <div key="meas-notes" className="py-1 text-sm text-muted-foreground">
        General notes: {m.notes}
      </div>
    );
  }

  // Lifestyle section
  const lifestyleRows: React.ReactNode[] = [];
  if (l.smokingStatus) lifestyleRows.push(renderValue(l.smokingStatus, 'Smoking status'));
  if (l.smokingDetail) lifestyleRows.push(renderValue(l.smokingDetail, 'Smoking detail'));
  if (l.physicalActivity) lifestyleRows.push(renderValue(l.physicalActivity, 'Physical activity'));
  if (l.physicalActivityDetail) lifestyleRows.push(renderValue(l.physicalActivityDetail, 'Activity detail'));
  if (l.alcoholConsumption) lifestyleRows.push(renderValue(l.alcoholConsumption, 'Alcohol consumption'));
  if (l.alcoholDetail) lifestyleRows.push(renderValue(l.alcoholDetail, 'Alcohol detail'));
  if (l.dietPatterns) lifestyleRows.push(renderValue(l.dietPatterns, 'Diet patterns'));
  if (l.dietDetail) lifestyleRows.push(renderValue(l.dietDetail, 'Diet detail'));
  if (l.notes) lifestyleRows.push(
    <div key="life-notes" className="py-1 text-sm text-muted-foreground">
      Lifestyle notes: {l.notes}
    </div>
  );

  // Medical history section
  const medicalRows: React.ReactNode[] = [];
  if (mh.conditions.length > 0) {
    medicalRows.push(
      <div key="conditions" className="py-1">
        <span className="text-muted-foreground">Conditions: </span>
        <span className="font-medium">{mh.conditions.join(', ')}</span>
      </div>
    );
  }
  if (mh.customConditions) {
    medicalRows.push(
      <div key="custom-conditions" className="py-1">
        <span className="text-muted-foreground">Other conditions: </span>
        <span className="font-medium">{mh.customConditions}</span>
      </div>
    );
  }
  if (mh.medications.length > 0) {
    medicalRows.push(
      <div key="medications" className="py-1">
        <span className="text-muted-foreground">Medications: </span>
        <span className="font-medium">{mh.medications.join(', ')}</span>
      </div>
    );
  }
  if (mh.medicationsNotes) {
    medicalRows.push(
      <div key="med-notes" className="py-1 text-sm text-muted-foreground">
        Medication notes: {mh.medicationsNotes}
      </div>
    );
  }
  if (mh.previousHeartEvents.length > 0) {
    medicalRows.push(
      <div key="events" className="py-1">
        <span className="text-muted-foreground">Previous heart events: </span>
        <span className="font-medium">{mh.previousHeartEvents.join(', ')}</span>
      </div>
    );
  }
  if (mh.previousHeartEventsNotes) {
    medicalRows.push(
      <div key="events-notes" className="py-1 text-sm text-muted-foreground">
        Heart event notes: {mh.previousHeartEventsNotes}
      </div>
    );
  }
  if (mh.notes) {
    medicalRows.push(
      <div key="mh-notes" className="py-1 text-sm text-muted-foreground">
        Medical history notes: {mh.notes}
      </div>
    );
  }

  // Family history section
  const familyRows: React.ReactNode[] = [];
  if (fh.hasFamilyHistory) {
    familyRows.push(renderValue(fh.hasFamilyHistory, 'Family history of heart disease'));
  }
  if (fh.entries.length > 0) {
    fh.entries.forEach((entry, idx) => {
      if (!entry.relation && !entry.condition) return;
      familyRows.push(
        <div key={`fh-${idx}`} className="py-1 text-sm">
          <span className="font-medium">
            {entry.relation}{entry.relationDetail ? ` (${entry.relationDetail})` : ''}
          </span>
          {entry.condition && (
            <span className="text-muted-foreground">
              {' — '}{entry.condition}{entry.conditionDetail ? ` (${entry.conditionDetail})` : ''}
            </span>
          )}
          {entry.ageOfOnset && (
            <span className="text-muted-foreground"> at age {entry.ageOfOnset}</span>
          )}
        </div>
      );
    });
  }
  if (fh.notes) {
    familyRows.push(
      <div key="fh-notes" className="py-1 text-sm text-muted-foreground">
        Family history notes: {fh.notes}
      </div>
    );
  }

  // Other factors section
  const otherRows: React.ReactNode[] = [];
  of.items.forEach((item) => {
    if (!item.factor && !item.details) return;
    otherRows.push(
      <div key={item.id} className="py-1 text-sm">
        <span className="font-medium">{item.factor}</span>
        {item.details && (
          <span className="text-muted-foreground">: {item.details}</span>
        )}
      </div>
    );
  });
  if (of.notes) {
    otherRows.push(
      <div key="of-notes" className="py-1 text-sm text-muted-foreground">
        Other factors notes: {of.notes}
      </div>
    );
  }

  const renderSection = (title: string, rows: React.ReactNode[]) => {
    if (rows.length === 0) {
      return (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">{title}</h4>
          <p className="text-sm text-muted-foreground italic">No information entered</p>
        </div>
      );
    }
    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2">{title}</h4>
        <div className="divide-y divide-border">{rows}</div>
      </div>
    );
  };

  return (
    <div className="print-content space-y-1">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">{personIdentityForOutput(person)}</p>
      </div>
      {renderSection('Measurements', measurementRows)}
      {renderSection('Lifestyle', lifestyleRows)}
      {renderSection('Medical History', medicalRows)}
      {renderSection('Family History', familyRows)}
      {renderSection('Other Factors', otherRows)}
      <div className="mt-6">
        <MedicalDisclaimer />
      </div>
    </div>
  );
}

// ─── Output 2: Missing-Information Summary ─────────────────────

function MissingInfoRenderer({ person }: { person: Person }) {
  const grouped = useMemo(() => {
    const buckets: Record<Priority, typeof person.unknowns> = {
      high: [],
      medium: [],
      low: [],
    };
    for (const u of person.unknowns) {
      buckets[u.priority].push(u);
    }
    return buckets;
  }, [person.unknowns]);

  const priorityLabels: Record<Priority, string> = {
    high: 'High priority',
    medium: 'Medium priority',
    low: 'Low priority',
  };

  const priorityDescriptions: Record<Priority, string> = {
    high: 'These are important for understanding heart risk and should be addressed soon.',
    medium: 'These would improve the picture but are less immediately urgent.',
    low: 'These are nice to know but not essential for the current assessment.',
  };

  if (person.unknowns.length === 0) {
    return (
      <div className="print-content space-y-4">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">{personIdentityForOutput(person)}</p>
        </div>
        <p className="text-sm text-muted-foreground italic">No information gaps identified.</p>
        <div className="mt-6">
          <MedicalDisclaimer />
        </div>
      </div>
    );
  }

  return (
    <div className="print-content space-y-4">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">{personIdentityForOutput(person)}</p>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {person.unknowns.length} information {person.unknowns.length === 1 ? 'gap' : 'gaps'} identified.
      </p>
      {(['high', 'medium', 'low'] as Priority[]).map((priority) => {
        const items = grouped[priority];
        if (items.length === 0) return null;
        return (
          <div key={priority} className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={cn('text-xs', PRIORITY_STYLES[priority])}>
                {priorityLabels[priority]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {priorityDescriptions[priority]}
              </span>
            </div>
            <ul className="space-y-3">
              {items.map((u) => (
                <li key={u.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{u.description}</p>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {u.category}
                    </Badge>
                  </div>
                  {u.howToFindOut && (
                    <p className="text-sm text-muted-foreground mt-1.5">
                      <span className="font-medium">How to find out:</span> {u.howToFindOut}
                    </p>
                  )}
                  {u.autoFromStage2 && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Auto-identified from Stage 2
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <div className="mt-6">
        <MedicalDisclaimer />
      </div>
    </div>
  );
}

// ─── Output 3: Health Team Discussion Brief ────────────────────

function DiscussionBriefRenderer({ person }: { person: Person }) {
  if (person.discussionPoints.length === 0) {
    return (
      <div className="print-content space-y-4">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">{personIdentityForOutput(person)}</p>
        </div>
        <p className="text-sm text-muted-foreground italic">No discussion points prepared.</p>
        <div className="mt-6">
          <MedicalDisclaimer />
        </div>
      </div>
    );
  }

  return (
    <div className="print-content space-y-4">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">{personIdentityForOutput(person)}</p>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {person.discussionPoints.length} discussion {person.discussionPoints.length === 1 ? 'point' : 'points'} prepared.
      </p>
      <ol className="space-y-4">
        {person.discussionPoints.map((dp, idx) => {
          const linkedUnknown = dp.linkedUnknownId
            ? person.unknowns.find((u) => u.id === dp.linkedUnknownId)
            : null;
          return (
            <li key={dp.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-2">{dp.question}</p>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className={cn('text-xs', PRIORITY_STYLES[dp.urgency])}>
                      {dp.urgency.charAt(0).toUpperCase() + dp.urgency.slice(1)} urgency
                    </Badge>
                    {dp.whoShouldBePresent && (
                      <span className="text-xs text-muted-foreground">
                        Present: {dp.whoShouldBePresent}
                      </span>
                    )}
                  </div>
                  {linkedUnknown && (
                    <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 mb-2">
                      Linked unknown: {linkedUnknown.description}
                      {linkedUnknown.howToFindOut && ` — ${linkedUnknown.howToFindOut}`}
                    </div>
                  )}
                  {dp.notes && (
                    <p className="text-xs text-muted-foreground italic">{dp.notes}</p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-6">
        <MedicalDisclaimer />
      </div>
    </div>
  );
}

// ─── Output 4: Decision and Next-Action Record ─────────────────

function DecisionRecordRenderer({ person }: { person: Person }) {
  if (person.decisions.length === 0) {
    return (
      <div className="print-content space-y-4">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">{personIdentityForOutput(person)}</p>
        </div>
        <p className="text-sm text-muted-foreground italic">No decisions recorded.</p>
        <div className="mt-6">
          <MedicalDisclaimer />
        </div>
      </div>
    );
  }

  return (
    <div className="print-content space-y-4">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">{personIdentityForOutput(person)}</p>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {person.decisions.length} {person.decisions.length === 1 ? 'decision' : 'decisions'} recorded.
      </p>
      <div className="space-y-4">
        {person.decisions.map((d) => {
          const incompleteActions = d.actions.filter((a) => !a.completed);
          const completeActions = d.actions.filter((a) => a.completed);
          return (
            <div key={d.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-medium">{d.summary}</p>
                {d.date && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDate(d.date)}
                  </span>
                )}
              </div>
              {d.appointmentDetails && (
                <div className="text-xs text-muted-foreground mb-3 bg-muted/50 rounded px-2 py-1.5">
                  <span className="font-medium">Appointment:</span> {d.appointmentDetails}
                </div>
              )}
              {d.actions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</p>
                  {incompleteActions.length > 0 && (
                    <ul className="space-y-1.5">
                      {incompleteActions.map((a) => (
                        <li key={a.id} className="flex items-start gap-2 text-sm">
                          <span className="mt-1 w-3.5 h-3.5 rounded border border-muted-foreground/40 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span>{a.description}</span>
                            {a.dueDate && (
                              <span className="text-xs text-muted-foreground ml-2">
                                Due: {formatDate(a.dueDate)}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {completeActions.length > 0 && (
                    <ul className="space-y-1.5">
                      {completeActions.map((a) => (
                        <li key={a.id} className="flex items-start gap-2 text-sm text-muted-foreground line-through">
                          <span className="mt-1 w-3.5 h-3.5 rounded bg-primary flex-shrink-0 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span>{a.description}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {d.notes && (
                <p className="text-xs text-muted-foreground italic mt-3">{d.notes}</p>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <MedicalDisclaimer />
      </div>
    </div>
  );
}

// ─── Output 5: People You Love Follow-Up ───────────────────────

function PeopleFollowupRenderer({ persons }: { persons: Person[] }) {
  const lovedOnes = persons.filter((p) => p.role === 'loved-one');

  if (lovedOnes.length === 0) {
    return (
      <div className="print-content space-y-4">
        <p className="text-sm text-muted-foreground italic">No loved-one records to show.</p>
        <div className="mt-6">
          <MedicalDisclaimer />
        </div>
      </div>
    );
  }

  return (
    <div className="print-content space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Summary across {lovedOnes.length} loved-one {lovedOnes.length === 1 ? 'record' : 'records'}.
      </p>
      <div className="space-y-4">
        {lovedOnes.map((person) => {
          const unknownsCount = person.unknowns.length;
          const discussionCount = person.discussionPoints.length;
          const decisionsCount = person.decisions.length;
          const incompleteActions = person.decisions.reduce(
            (sum, d) => sum + d.actions.filter((a) => !a.completed).length,
            0
          );
          const highPriorityUnknowns = person.unknowns.filter((u) => u.priority === 'high').length;

          return (
            <div key={person.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-semibold">{personLabel(person)}</p>
                  <p className="text-xs text-muted-foreground">
                    {personIdentityForOutput(person)}
                  </p>
                </div>
                {person.relationship && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    {person.relationship}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div className="text-center p-2 bg-muted/50 rounded">
                  <p className="text-lg font-bold">{unknownsCount}</p>
                  <p className="text-xs text-muted-foreground">Unknown{unknownsCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <p className="text-lg font-bold">{discussionCount}</p>
                  <p className="text-xs text-muted-foreground">Discussion {discussionCount !== 1 ? 'points' : 'point'}</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <p className="text-lg font-bold">{decisionsCount}</p>
                  <p className="text-xs text-muted-foreground">Decision{decisionsCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <p className={cn('text-lg font-bold', incompleteActions > 0 ? 'text-amber-600' : '')}>
                    {incompleteActions}
                  </p>
                  <p className="text-xs text-muted-foreground">Incomplete action{incompleteActions !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {highPriorityUnknowns > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <span>{highPriorityUnknowns} high-priority unknown{highPriorityUnknowns !== 1 ? 's' : ''} — may need urgent attention</span>
                </div>
              )}
              {incompleteActions > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Pending actions</p>
                  <ul className="space-y-1">
                    {person.decisions.flatMap((d) =>
                      d.actions
                        .filter((a) => !a.completed)
                        .map((a) => (
                          <li key={a.id} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                            <span>
                              {a.description}
                              {a.dueDate && ` (due: ${formatDate(a.dueDate)})`}
                            </span>
                          </li>
                        ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <MedicalDisclaimer />
      </div>
    </div>
  );
}

// ─── Output 6: Clarify Take-Forward Pack ───────────────────────

function TakeForwardPackRenderer({
  person,
  persons,
}: {
  person: Person;
  persons: Person[];
}) {
  const outputIds = OUTPUTS.map((o) => o.id);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(outputIds));
  const [showPreview, setShowPreview] = useState(false);

  const toggleOutput = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setShowPreview(false);
  };

  const selectedLabels = OUTPUTS.filter((o) => selectedIds.has(o.id)).map((o) => o.title);

  const renderOutputById = (id: string) => {
    switch (id) {
      case 'heart-risk-audit':
        return <HeartRiskAuditRenderer key={id} person={person} />;
      case 'missing-info':
        return <MissingInfoRenderer key={id} person={person} />;
      case 'discussion-brief':
        return <DiscussionBriefRenderer key={id} person={person} />;
      case 'decision-record':
        return <DecisionRecordRenderer key={id} person={person} />;
      case 'people-followup':
        return <PeopleFollowupRenderer key={id} persons={persons} />;
      default:
        return null;
    }
  };

  return (
    <div className="print-content space-y-4">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">{personIdentityForOutput(person)}</p>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Select which outputs to include in your take-forward pack.
      </p>
      <div className="space-y-2 mb-4">
        {OUTPUTS.map((o) => {
          const checked = selectedIds.has(o.id);
          return (
            <label
              key={o.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                checked
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border hover:bg-accent/50'
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => toggleOutput(o.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{o.title}</p>
                <p className="text-xs text-muted-foreground">{o.description}</p>
              </div>
            </label>
          );
        })}
      </div>
      {selectedIds.size === 0 && (
        <p className="text-sm text-muted-foreground italic">Select at least one output to continue.</p>
      )}
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button
          variant="outline"
          size="sm"
          disabled={selectedIds.size === 0}
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1.5" />
              Hide preview
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-1.5" />
              Preview ({selectedIds.size})
            </>
          )}
        </Button>
        <Button
          size="sm"
          disabled={selectedIds.size === 0}
          onClick={() => printOutput()}
        >
          <Printer className="w-4 h-4 mr-1.5" />
          Print pack
        </Button>
      </div>
      {showPreview && selectedIds.size > 0 && (
        <div className="mt-4">
          <div className="text-xs text-muted-foreground mb-3 print:hidden">
            Preview of selected outputs: {selectedLabels.join(' · ')}
          </div>
          <div className="space-y-8">
            {Array.from(selectedIds).map((id, idx) => (
              <div key={id}>
                <h3 className="text-base font-semibold mb-3 print:mb-2">
                  {OUTPUTS.find((o) => o.id === id)?.title}
                </h3>
                {renderOutputById(id)}
                {idx < selectedIds.size - 1 && (
                  <div className="my-6 border-t border-dashed border-border print:break-after-page" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-6">
        <MedicalDisclaimer />
      </div>
    </div>
  );
}

// ─── Privacy Controls ──────────────────────────────────────────

function PrivacyControls({ person }: { person: Person }) {
  const updatePrivacySettings = useClarifyStore((s) => s.updatePrivacySettings);

  const toggles: { key: keyof Person['privacySettings']; label: string; description: string }[] = [
    {
      key: 'shareDisplayName',
      label: 'Display name',
      description: 'Show the person\'s name on printed outputs',
    },
    {
      key: 'shareAge',
      label: 'Age',
      description: 'Include approximate age on printed outputs',
    },
    {
      key: 'shareSex',
      label: 'Sex',
      description: 'Include sex on printed outputs',
    },
    {
      key: 'shareRelationship',
      label: 'Relationship',
      description: 'Show the relationship to you (for loved ones)',
    },
  ];

  return (
    <Card className="print:hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-base">
            Privacy controls for {personLabel(person)}
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          These settings control what personal information appears when you print or share outputs.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {toggles.map((toggle) => (
          <div key={toggle.key} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <Label htmlFor={`privacy-${toggle.key}`} className="text-sm font-medium cursor-pointer">
                {toggle.label}
              </Label>
              <p className="text-xs text-muted-foreground">{toggle.description}</p>
            </div>
            <Switch
              id={`privacy-${toggle.key}`}
              checked={person.privacySettings[toggle.key]}
              onCheckedChange={(checked) =>
                updatePrivacySettings(person.id, { [toggle.key]: checked })
              }
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Output Viewer ─────────────────────────────────────────────

function OutputViewer({
  outputId,
  person,
  persons,
}: {
  outputId: string;
  person: Person;
  persons: Person[];
}) {
  const outputDef = OUTPUTS.find((o) => o.id === outputId);
  if (!outputDef) return null;

  const renderContent = () => {
    switch (outputId) {
      case 'heart-risk-audit':
        return <HeartRiskAuditRenderer person={person} />;
      case 'missing-info':
        return <MissingInfoRenderer person={person} />;
      case 'discussion-brief':
        return <DiscussionBriefRenderer person={person} />;
      case 'decision-record':
        return <DecisionRecordRenderer person={person} />;
      case 'people-followup':
        return <PeopleFollowupRenderer persons={persons} />;
      case 'take-forward-pack':
        return <TakeForwardPackRenderer person={person} persons={persons} />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-6 print:mt-0" id="output-viewer">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{outputDef.title}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="print:hidden"
              onClick={() => printOutput()}
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Print
            </Button>
          </div>
          <CardDescription>{outputDef.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────

export default function OutputsHub() {
  const persons = useClarifyStore((s) => s.persons);
  const activePersonId = useClarifyStore((s) => s.activePersonId);
  const setActivePersonId = useClarifyStore((s) => s.setActivePersonId);
  const getActivePerson = useClarifyStore((s) => s.getActivePerson);

  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);

  const activePerson = getActivePerson();

  const handleView = (outputId: string) => {
    setSelectedOutput((prev) => (prev === outputId ? null : outputId));
  };

  const handlePrint = (outputId: string) => {
    setSelectedOutput(outputId);
    // Small delay to let React render the output before printing
    setTimeout(() => printOutput(), 100);
  };

  // If no persons exist, show prompt
  if (persons.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your outputs</h2>
          <p className="text-muted-foreground mt-1">
            View, print, and share the outputs from your Clarify session.
          </p>
        </div>
        <InfoPanel title="No data yet" defaultOpen>
          <p>
            Complete the earlier stages to generate outputs. Return here once you have
            entered information about heart risk factors, unknowns, discussion points,
            or decisions.
          </p>
        </InfoPanel>
      </div>
    );
  }

  // If there's no active person but persons exist, select the first one
  if (!activePerson && persons.length > 0 && !activePersonId) {
    // We handle this in a useEffect-like way via the selector
  }

  const displayPerson = activePerson || persons[0];

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="print:hidden">
        <h2 className="text-2xl font-bold tracking-tight">Your outputs</h2>
        <p className="text-muted-foreground mt-1">
          View, print, and share the outputs from your Clarify session.
        </p>
      </div>

      <PersonSelector />

      {displayPerson && (
        <>
          {/* ── Output Cards Grid ──────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
            {OUTPUTS.map((output) => {
              const IconComponent = ICON_MAP[output.icon];
              const isSelected = selectedOutput === output.id;
              return (
                <Card
                  key={output.id}
                  className={cn(
                    'transition-all',
                    isSelected && 'ring-2 ring-primary border-primary/50'
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      {IconComponent && (
                        <div className="p-2 rounded-lg bg-muted/80">
                          <IconComponent className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-semibold leading-tight">
                          {output.title}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {output.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button
                        variant={isSelected ? 'secondary' : 'outline'}
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={() => handleView(output.id)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        {isSelected ? 'Hide' : 'View'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => handlePrint(output.id)}
                      >
                        <Printer className="w-3.5 h-3.5 mr-1.5" />
                        Print
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ── Output Viewer ───────────────────────────────── */}
          {selectedOutput && (
            <OutputViewer
              outputId={selectedOutput}
              person={displayPerson}
              persons={persons}
            />
          )}

          {/* ── Privacy Controls ───────────────────────────── */}
          <PrivacyControls person={displayPerson} />
        </>
      )}
    </div>
  );
}