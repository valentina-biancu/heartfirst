'use client';

import { useState, type ReactNode } from 'react';
import { useClarifyStore } from '@/lib/clarify-store';
import {
  STAGES,
  SMOKING_OPTIONS,
  ACTIVITY_OPTIONS,
  ALCOHOL_OPTIONS,
  CONDITION_OPTIONS,
  HEART_EVENT_OPTIONS,
  FAMILY_RELATION_OPTIONS,
  FAMILY_CONDITION_OPTIONS,
  OTHER_FACTOR_OPTIONS,
} from '@/lib/clarify-types';
import { InfoPanel } from './info-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Plus,
  Trash2,
  Activity,
  Pill,
  Dna,
  Heart,
  Scale,
  Dumbbell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Constants ─────────────────────────────────────────────────

const DIET_OPTIONS = [
  'I eat a balanced diet',
  'High in processed food',
  'High in salt',
  'High in saturated fat',
  "I don't know",
] as const;

// ─── Helpers ───────────────────────────────────────────────────

function countKnown(...values: (string | null | undefined)[]): number {
  return values.filter((v) => v !== null && v !== undefined && v !== '').length;
}

// ─── FieldWrapper ───────────────────────────────────────────────

interface FieldWrapperProps {
  label: string;
  description?: string;
  htmlFor?: string;
  idkChecked?: boolean;
  onIdkChange?: (checked: boolean) => void;
  children: ReactNode;
}

function FieldWrapper({
  label,
  description,
  htmlFor,
  idkChecked,
  onIdkChange,
  children,
}: FieldWrapperProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {onIdkChange !== undefined && (
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
            <Checkbox
              checked={idkChecked ?? false}
              onCheckedChange={(checked) => onIdkChange(checked === true)}
              aria-label={"I don't know " + label}
            />
            {"I don't know"}
          </label>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
}

// ─── Badge helper ───────────────────────────────────────────────

function SectionBadge({ known, total }: { known: number; total: number }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center text-xs font-medium rounded-full px-2 py-0.5',
        known > 0
          ? 'bg-primary/10 text-primary'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {known} of {total} known
    </span>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function Stage2Known() {
  const getActivePerson = useClarifyStore((s) => s.getActivePerson);
  const updateBloodPressure = useClarifyStore((s) => s.updateBloodPressure);
  const updateCholesterol = useClarifyStore((s) => s.updateCholesterol);
  const updateBloodSugar = useClarifyStore((s) => s.updateBloodSugar);
  const updateBmi = useClarifyStore((s) => s.updateBmi);
  const updateMeasurementsNotes = useClarifyStore(
    (s) => s.updateMeasurementsNotes
  );
  const updateLifestyle = useClarifyStore((s) => s.updateLifestyle);
  const updateMedicalHistory = useClarifyStore((s) => s.updateMedicalHistory);
  const updateFamilyHistory = useClarifyStore((s) => s.updateFamilyHistory);
  const addFamilyEntry = useClarifyStore((s) => s.addFamilyEntry);
  const updateFamilyEntry = useClarifyStore((s) => s.updateFamilyEntry);
  const removeFamilyEntry = useClarifyStore((s) => s.removeFamilyEntry);
  const addOtherFactor = useClarifyStore((s) => s.addOtherFactor);
  const updateOtherFactor = useClarifyStore((s) => s.updateOtherFactor);
  const removeOtherFactor = useClarifyStore((s) => s.removeOtherFactor);
  const updateOtherFactorsNotes = useClarifyStore(
    (s) => s.updateOtherFactorsNotes
  );

  const [newMedication, setNewMedication] = useState('');

  const stage = STAGES[1];
  const person = getActivePerson();

  if (!person) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {stage.title}
          </h2>
          <p className="text-muted-foreground">{stage.description}</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Please select or add a person in Stage 1.
          </CardContent>
        </Card>
      </div>
    );
  }

  const pid = person.id;
  const m = person.measurements;
  const ls = person.lifestyle;
  const mh = person.medicalHistory;
  const fh = person.familyHistory;
  const of = person.otherFactors;

  // ── Badge counts ───────────────────────────────────────────────
  const measurementsKnown = countKnown(
    m.bloodPressure.systolic,
    m.bloodPressure.diastolic,
    m.cholesterol.total,
    m.bloodSugar.value,
    m.bmi.weight,
    m.bmi.height
  );

  const lifestyleKnown = countKnown(
    ls.smokingStatus,
    ls.physicalActivity,
    ls.alcoholConsumption,
    ls.dietPatterns
  );

  const medicalKnown = countKnown(
    mh.conditions.length > 0 ? 'yes' : null,
    mh.medications.length > 0 ? 'yes' : null,
    mh.previousHeartEvents.length > 0 ? 'yes' : null
  );

  const familyKnown = countKnown(
    fh.hasFamilyHistory,
    fh.entries.length > 0 ? 'yes' : null
  );

  const otherKnown = of.items.length;

  // ── Medical history helpers ────────────────────────────────────

  function handleConditionToggle(option: string) {
    if (option === 'None known') {
      if (mh.conditions.includes('None known')) {
        // Unchecking None known — just remove it
        updateMedicalHistory(pid, { conditions: mh.conditions.filter((c) => c !== 'None known') });
      } else {
        // Checking None known — clear all others
        updateMedicalHistory(pid, { conditions: ['None known'] });
      }
    } else {
      const withoutNone = mh.conditions.filter((c) => c !== 'None known');
      if (withoutNone.includes(option)) {
        updateMedicalHistory(pid, {
          conditions: withoutNone.filter((c) => c !== option),
        });
      } else {
        updateMedicalHistory(pid, {
          conditions: [...withoutNone, option],
        });
      }
    }
  }

  function handleHeartEventToggle(option: string) {
    if (option === 'None') {
      if (mh.previousHeartEvents.includes('None')) {
        updateMedicalHistory(pid, {
          previousHeartEvents: mh.previousHeartEvents.filter((e) => e !== 'None'),
        });
      } else {
        updateMedicalHistory(pid, { previousHeartEvents: ['None'] });
      }
    } else {
      const withoutNone = mh.previousHeartEvents.filter((e) => e !== 'None');
      if (withoutNone.includes(option)) {
        updateMedicalHistory(pid, {
          previousHeartEvents: withoutNone.filter((e) => e !== option),
        });
      } else {
        updateMedicalHistory(pid, {
          previousHeartEvents: [...withoutNone, option],
        });
      }
    }
  }

  // Medication management

  function handleAddMedication() {
    const trimmed = newMedication.trim();
    if (!trimmed) return;
    updateMedicalHistory(pid, {
      medications: [...mh.medications, trimmed],
    });
    setNewMedication('');
  }

  function handleRemoveMedication(index: number) {
    updateMedicalHistory(pid, {
      medications: mh.medications.filter((_, i) => i !== index),
    });
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Stage header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {stage.title}
        </h2>
        <p className="text-muted-foreground">{stage.description}</p>
      </div>

      {/* Accordion */}
      <Accordion
        type="multiple"
        defaultValue={['measurements', 'lifestyle', 'medical', 'family', 'other']}
        className="w-full"
      >
        {/* 1. MEASUREMENTS */}
        <AccordionItem value="measurements">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary shrink-0" />
              <span>Measurements</span>
              <SectionBadge known={measurementsKnown} total={6} />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-8">
              {/* ── Blood Pressure ──────────────────────────────── */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Blood Pressure</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FieldWrapper label="Systolic (top number)" htmlFor="bp-systolic">
                    <Input
                      id="bp-systolic"
                      type="number"
                      placeholder="e.g. 120"
                      value={m.bloodPressure.systolic ?? ''}
                      onChange={(e) =>
                        updateBloodPressure(pid, {
                          systolic: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Diastolic (bottom number)" htmlFor="bp-diastolic">
                    <Input
                      id="bp-diastolic"
                      type="number"
                      placeholder="e.g. 80"
                      value={m.bloodPressure.diastolic ?? ''}
                      onChange={(e) =>
                        updateBloodPressure(pid, {
                          diastolic: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Date taken" htmlFor="bp-date">
                    <Input
                      id="bp-date"
                      type="date"
                      value={m.bloodPressure.date ?? ''}
                      onChange={(e) =>
                        updateBloodPressure(pid, {
                          date: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>
                </div>

                <FieldWrapper label="Notes" htmlFor="bp-notes">
                  <Textarea
                    id="bp-notes"
                    placeholder="e.g. Taken at GP surgery, after resting 5 minutes"
                    value={m.bloodPressure.notes ?? ''}
                    onChange={(e) =>
                      updateBloodPressure(pid, {
                        notes: e.target.value || null,
                      })
                    }
                    rows={2}
                  />
                </FieldWrapper>
              </div>

              {/* ── Cholesterol ─────────────────────────────────── */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Cholesterol</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FieldWrapper label="Total (mmol/L)" htmlFor="chol-total" idkChecked={m.cholesterol.total === "I don't know"} onIdkChange={(checked) => updateCholesterol(pid, { total: checked ? "I don't know" : null })}>
                    <Input
                      id="chol-total"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 5.2"
                      value={m.cholesterol.total === "I don't know" ? '' : (m.cholesterol.total ?? '')}
                      disabled={m.cholesterol.total === "I don't know"}
                      onChange={(e) =>
                        updateCholesterol(pid, {
                          total: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper label="LDL (mmol/L)" htmlFor="chol-ldl" idkChecked={m.cholesterol.ldl === "I don't know"} onIdkChange={(checked) => updateCholesterol(pid, { ldl: checked ? "I don't know" : null })}>
                    <Input
                      id="chol-ldl"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 3.1"
                      value={m.cholesterol.ldl === "I don't know" ? '' : (m.cholesterol.ldl ?? '')}
                      disabled={m.cholesterol.ldl === "I don't know"}
                      onChange={(e) =>
                        updateCholesterol(pid, {
                          ldl: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper label="HDL (mmol/L)" htmlFor="chol-hdl" idkChecked={m.cholesterol.hdl === "I don't know"} onIdkChange={(checked) => updateCholesterol(pid, { hdl: checked ? "I don't know" : null })}>
                    <Input
                      id="chol-hdl"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 1.2"
                      value={m.cholesterol.hdl === "I don't know" ? '' : (m.cholesterol.hdl ?? '')}
                      disabled={m.cholesterol.hdl === "I don't know"}
                      onChange={(e) =>
                        updateCholesterol(pid, {
                          hdl: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Triglycerides (mmol/L)" htmlFor="chol-trig" idkChecked={m.cholesterol.triglycerides === "I don't know"} onIdkChange={(checked) => updateCholesterol(pid, { triglycerides: checked ? "I don't know" : null })}>
                    <Input
                      id="chol-trig"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 1.8"
                      value={m.cholesterol.triglycerides === "I don't know" ? '' : (m.cholesterol.triglycerides ?? '')}
                      disabled={m.cholesterol.triglycerides === "I don't know"}
                      onChange={(e) =>
                        updateCholesterol(pid, {
                          triglycerides: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldWrapper label="Date taken" htmlFor="chol-date">
                    <Input
                      id="chol-date"
                      type="date"
                      value={m.cholesterol.date ?? ''}
                      onChange={(e) =>
                        updateCholesterol(pid, {
                          date: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Notes" htmlFor="chol-notes">
                    <Input
                      id="chol-notes"
                      type="text"
                      placeholder="e.g. Fasting blood test"
                      value={m.cholesterol.notes ?? ''}
                      onChange={(e) =>
                        updateCholesterol(pid, {
                          notes: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>
                </div>
              </div>

              {/* ── Blood Sugar ─────────────────────────────────── */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Blood Sugar</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FieldWrapper label="Value" htmlFor="bs-value" idkChecked={m.bloodSugar.value === "I don't know"} onIdkChange={(checked) => updateBloodSugar(pid, { value: checked ? "I don't know" : null })}>
                    <Input
                      id="bs-value"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 5.6"
                      value={m.bloodSugar.value === "I don't know" ? '' : (m.bloodSugar.value ?? '')}
                      disabled={m.bloodSugar.value === "I don't know"}
                      onChange={(e) =>
                        updateBloodSugar(pid, {
                          value: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Unit" htmlFor="bs-unit">
                    <Select
                      value={m.bloodSugar.unit ?? ''}
                      onValueChange={(val) =>
                        updateBloodSugar(pid, {
                          unit: val as 'mmol/L' | 'mg/dL' | null,
                        })
                      }
                    >
                      <SelectTrigger id="bs-unit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mmol/L">mmol/L</SelectItem>
                        <SelectItem value="mg/dL">mg/dL</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldWrapper>

                  <FieldWrapper label="HbA1c (%)" htmlFor="bs-hba1c" idkChecked={m.bloodSugar.hba1c === "I don't know"} onIdkChange={(checked) => updateBloodSugar(pid, { hba1c: checked ? "I don't know" : null })}>
                    <Input
                      id="bs-hba1c"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 42"
                      value={m.bloodSugar.hba1c === "I don't know" ? '' : (m.bloodSugar.hba1c ?? '')}
                      disabled={m.bloodSugar.hba1c === "I don't know"}
                      onChange={(e) =>
                        updateBloodSugar(pid, {
                          hba1c: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldWrapper label="Date taken" htmlFor="bs-date">
                    <Input
                      id="bs-date"
                      type="date"
                      value={m.bloodSugar.date ?? ''}
                      onChange={(e) =>
                        updateBloodSugar(pid, {
                          date: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Notes" htmlFor="bs-notes">
                    <Input
                      id="bs-notes"
                      type="text"
                      placeholder="e.g. Fasting glucose test"
                      value={m.bloodSugar.notes ?? ''}
                      onChange={(e) =>
                        updateBloodSugar(pid, {
                          notes: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>
                </div>
              </div>

              {/* ── Weight & Height ─────────────────────────────── */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Weight &amp; Height</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldWrapper label="Weight" htmlFor="bmi-weight" idkChecked={m.bmi.weight === "I don't know"} onIdkChange={(checked) => updateBmi(pid, { weight: checked ? "I don't know" : null })}>
                    <Input
                      id="bmi-weight"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 78"
                      value={m.bmi.weight === "I don't know" ? '' : (m.bmi.weight ?? '')}
                      disabled={m.bmi.weight === "I don't know"}
                      onChange={(e) =>
                        updateBmi(pid, {
                          weight: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Weight unit" htmlFor="bmi-weight-unit">
                    <Select
                      value={m.bmi.weightUnit ?? ''}
                      onValueChange={(val) =>
                        updateBmi(pid, {
                          weightUnit: val as 'kg' | 'lbs' | null,
                        })
                      }
                    >
                      <SelectTrigger id="bmi-weight-unit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="lbs">lbs</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldWrapper>

                  <FieldWrapper label="Height" htmlFor="bmi-height" idkChecked={m.bmi.height === "I don't know"} onIdkChange={(checked) => updateBmi(pid, { height: checked ? "I don't know" : null })}>
                    <Input
                      id="bmi-height"
                      type="number"
                      step="0.1"
                      placeholder={m.bmi.heightUnit === 'ft/in' ? 'e.g. 5.10' : 'e.g. 175'}
                      value={m.bmi.height === "I don't know" ? '' : (m.bmi.height ?? '')}
                      disabled={m.bmi.height === "I don't know"}
                      onChange={(e) =>
                        updateBmi(pid, {
                          height: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Height unit" htmlFor="bmi-height-unit">
                    <Select
                      value={m.bmi.heightUnit ?? ''}
                      onValueChange={(val) =>
                        updateBmi(pid, {
                          heightUnit: val as 'cm' | 'ft/in' | null,
                        })
                      }
                    >
                      <SelectTrigger id="bmi-height-unit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="ft/in">ft/in</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldWrapper>

                  <FieldWrapper label="Date measured" htmlFor="bmi-date">
                    <Input
                      id="bmi-date"
                      type="date"
                      value={m.bmi.date ?? ''}
                      onChange={(e) =>
                        updateBmi(pid, {
                          date: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Notes" htmlFor="bmi-notes">
                    <Input
                      id="bmi-notes"
                      type="text"
                      placeholder="e.g. Self-measured at home"
                      value={m.bmi.notes ?? ''}
                      onChange={(e) =>
                        updateBmi(pid, {
                          notes: e.target.value || null,
                        })
                      }
                    />
                  </FieldWrapper>
                </div>
              </div>

              {/* ── General notes ───────────────────────────────── */}
              <FieldWrapper label="General measurement notes" htmlFor="measurements-notes">
                <Textarea
                  id="measurements-notes"
                  placeholder="Any additional notes about measurements, e.g. recent changes, concerns, or where the data came from"
                  value={m.notes ?? ''}
                  onChange={(e) => updateMeasurementsNotes(pid, e.target.value)}
                  rows={3}
                />
              </FieldWrapper>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. LIFESTYLE */}
        <AccordionItem value="lifestyle">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Dumbbell className="w-5 h-5 text-primary shrink-0" />
              <span>Lifestyle</span>
              <SectionBadge known={lifestyleKnown} total={4} />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* ── Smoking ─────────────────────────────────────── */}
              <FieldWrapper
                label="Smoking status"
                description="Include any form: cigarettes, vaping, shisha, etc."
                htmlFor="lifestyle-smoking"
              >
                <Select
                  value={ls.smokingStatus ?? ''}
                  onValueChange={(val) =>
                    updateLifestyle(pid, { smokingStatus: val || null })
                  }
                >
                  <SelectTrigger id="lifestyle-smoking">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {SMOKING_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrapper>

              <FieldWrapper label="Smoking detail" htmlFor="lifestyle-smoking-detail">
                <Textarea
                  id="lifestyle-smoking-detail"
                  placeholder="e.g. How many per day, how long you/they have smoked, when you/they quit"
                  value={ls.smokingDetail ?? ''}
                  onChange={(e) =>
                    updateLifestyle(pid, {
                      smokingDetail: e.target.value || null,
                    })
                  }
                  rows={2}
                />
              </FieldWrapper>

              {/* ── Physical Activity ───────────────────────────── */}
              <FieldWrapper
                label="Physical activity level"
                description="Based on NHS guidelines for weekly activity."
                htmlFor="lifestyle-activity"
              >
                <Select
                  value={ls.physicalActivity ?? ''}
                  onValueChange={(val) =>
                    updateLifestyle(pid, { physicalActivity: val || null })
                  }
                >
                  <SelectTrigger id="lifestyle-activity">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrapper>

              <FieldWrapper label="Physical activity detail" htmlFor="lifestyle-activity-detail">
                <Textarea
                  id="lifestyle-activity-detail"
                  placeholder="e.g. Walks 30 minutes most days, goes swimming once a week"
                  value={ls.physicalActivityDetail ?? ''}
                  onChange={(e) =>
                    updateLifestyle(pid, {
                      physicalActivityDetail: e.target.value || null,
                    })
                  }
                  rows={2}
                />
              </FieldWrapper>

              {/* ── Alcohol ──────────────────────────────────────── */}
              <FieldWrapper
                label="Alcohol consumption"
                description="UK units per week. 1 unit is roughly half a pint of beer or a small glass of wine."
                htmlFor="lifestyle-alcohol"
              >
                <Select
                  value={ls.alcoholConsumption ?? ''}
                  onValueChange={(val) =>
                    updateLifestyle(pid, { alcoholConsumption: val || null })
                  }
                >
                  <SelectTrigger id="lifestyle-alcohol">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALCOHOL_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrapper>

              <FieldWrapper label="Alcohol detail" htmlFor="lifestyle-alcohol-detail">
                <Textarea
                  id="lifestyle-alcohol-detail"
                  placeholder="e.g. Mostly at weekends, glass of wine with dinner most evenings"
                  value={ls.alcoholDetail ?? ''}
                  onChange={(e) =>
                    updateLifestyle(pid, {
                      alcoholDetail: e.target.value || null,
                    })
                  }
                  rows={2}
                />
              </FieldWrapper>

              {/* ── Diet ─────────────────────────────────────────── */}
              <FieldWrapper
                label="Diet patterns"
                description="Select the closest description, or type your own in the notes below."
                htmlFor="lifestyle-diet"
              >
                <Select
                  value={ls.dietPatterns ?? ''}
                  onValueChange={(val) =>
                    updateLifestyle(pid, { dietPatterns: val || null })
                  }
                >
                  <SelectTrigger id="lifestyle-diet">
                    <SelectValue placeholder="Select description" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIET_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrapper>

              <FieldWrapper label="Diet detail" htmlFor="lifestyle-diet-detail">
                <Textarea
                  id="lifestyle-diet-detail"
                  placeholder="e.g. Tries to eat 5-a-day, eats a lot of takeaways, follows a specific diet plan"
                  value={ls.dietDetail ?? ''}
                  onChange={(e) =>
                    updateLifestyle(pid, {
                      dietDetail: e.target.value || null,
                    })
                  }
                  rows={2}
                />
              </FieldWrapper>

              {/* ── General notes ───────────────────────────────── */}
              <FieldWrapper label="General lifestyle notes" htmlFor="lifestyle-notes">
                <Textarea
                  id="lifestyle-notes"
                  placeholder="Any additional notes about lifestyle factors"
                  value={ls.notes ?? ''}
                  onChange={(e) =>
                    updateLifestyle(pid, { notes: e.target.value || null })
                  }
                  rows={3}
                />
              </FieldWrapper>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. MEDICAL HISTORY */}
        <AccordionItem value="medical">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Pill className="w-5 h-5 text-primary shrink-0" />
              <span>Medical History</span>
              <SectionBadge known={medicalKnown} total={3} />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* ── Known Conditions ────────────────────────────── */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Known Conditions</h3>
                <p className="text-xs text-muted-foreground">
                  Select all that apply. If you select &ldquo;None known&rdquo;, other selections will be cleared.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CONDITION_OPTIONS.map((option) => {
                    const isChecked = mh.conditions.includes(option);
                    const isNone = option === 'None known';
                    return (
                      <label
                        key={option}
                        className={cn(
                          'flex items-start gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors',
                          isChecked
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-accent/50'
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleConditionToggle(option)}
                          aria-label={option}
                          className="mt-0.5"
                        />
                        <span className="text-sm leading-snug">{option}</span>
                      </label>
                    );
                  })}
                </div>

                <FieldWrapper label="Other conditions" htmlFor="mh-custom-conditions">
                  <Input
                    id="mh-custom-conditions"
                    type="text"
                    placeholder="e.g. Polycystic ovary syndrome, sleep apnoea"
                    value={mh.customConditions ?? ''}
                    onChange={(e) =>
                      updateMedicalHistory(pid, {
                        customConditions: e.target.value || null,
                      })
                    }
                  />
                </FieldWrapper>
              </div>

              {/* ── Current Medications ─────────────────────────── */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Current Medications</h3>
                <p className="text-xs text-muted-foreground">
                  Add any medications currently being taken. Include the name and dose if known.
                </p>

                {/* Add medication input */}
                <div className="flex gap-2">
                  <Input
                    id="new-medication"
                    type="text"
                    placeholder="e.g. Ramipril 5mg, Atorvastatin 20mg"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMedication();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddMedication}
                    aria-label="Add medication"
                    disabled={!newMedication.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Medication list */}
                {mh.medications.length > 0 && (
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {mh.medications.map((med, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                      >
                        <span className="text-sm">{med}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveMedication(index)}
                          aria-label={`Remove ${med}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}

                <FieldWrapper label="Medication notes" htmlFor="mh-med-notes">
                  <Textarea
                    id="mh-med-notes"
                    placeholder="e.g. Some medications prescribed after a heart attack in 2022"
                    value={mh.medicationsNotes ?? ''}
                    onChange={(e) =>
                      updateMedicalHistory(pid, {
                        medicationsNotes: e.target.value || null,
                      })
                    }
                    rows={2}
                  />
                </FieldWrapper>
              </div>

              {/* ── Previous Heart Events ───────────────────────── */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Previous Heart Events</h3>
                <p className="text-xs text-muted-foreground">
                  Select all that apply. If you select &ldquo;None&rdquo;, other selections will be cleared.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {HEART_EVENT_OPTIONS.map((option) => {
                    const isChecked = mh.previousHeartEvents.includes(option);
                    return (
                      <label
                        key={option}
                        className={cn(
                          'flex items-start gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors',
                          isChecked
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-accent/50'
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleHeartEventToggle(option)}
                          aria-label={option}
                          className="mt-0.5"
                        />
                        <span className="text-sm leading-snug">{option}</span>
                      </label>
                    );
                  })}
                </div>

                <FieldWrapper label="Heart events notes" htmlFor="mh-events-notes">
                  <Textarea
                    id="mh-events-notes"
                    placeholder="e.g. Heart attack in 2019, two stents fitted"
                    value={mh.previousHeartEventsNotes ?? ''}
                    onChange={(e) =>
                      updateMedicalHistory(pid, {
                        previousHeartEventsNotes: e.target.value || null,
                      })
                    }
                    rows={2}
                  />
                </FieldWrapper>
              </div>

              {/* ── General notes ───────────────────────────────── */}
              <FieldWrapper label="General medical history notes" htmlFor="mh-notes">
                <Textarea
                  id="mh-notes"
                  placeholder="Any additional notes about medical history"
                  value={mh.notes ?? ''}
                  onChange={(e) =>
                    updateMedicalHistory(pid, { notes: e.target.value || null })
                  }
                  rows={3}
                />
              </FieldWrapper>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. FAMILY HISTORY */}
        <AccordionItem value="family">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Dna className="w-5 h-5 text-primary shrink-0" />
              <span>Family History</span>
              <SectionBadge known={familyKnown} total={2} />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* ── Has family history? ─────────────────────────── */}
              <FieldWrapper
                label="Do you know whether anyone in the family has had heart disease?"
                htmlFor="fh-has-history"
              >
                <Select
                  value={fh.hasFamilyHistory ?? ''}
                  onValueChange={(val) =>
                    updateFamilyHistory(pid, {
                      hasFamilyHistory: val || null,
                    })
                  }
                >
                  <SelectTrigger id="fh-has-history">
                    <SelectValue placeholder="Select answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="I don't know">I don&apos;t know</SelectItem>
                    <SelectItem value="Not applicable">Not applicable</SelectItem>
                  </SelectContent>
                </Select>
              </FieldWrapper>

              {/* ── Family entries (shown when Yes) ──────────────── */}
              {fh.hasFamilyHistory === 'Yes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      Family members
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addFamilyEntry(pid)}
                      className="gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add family member
                    </Button>
                  </div>

                  {fh.entries.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                      No family members added yet. Click &ldquo;Add family member&rdquo; above.
                    </p>
                  )}

                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {fh.entries.map((entry, index) => (
                      <Card key={entry.id}>
                        <CardContent className="pt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Family member {index + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => removeFamilyEntry(pid, entry.id)}
                              aria-label={`Remove family member ${index + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FieldWrapper label="Relationship" htmlFor={`fh-relation-${entry.id}`}>
                              <Select
                                value={entry.relation || ''}
                                onValueChange={(val) =>
                                  updateFamilyEntry(pid, entry.id, {
                                    relation: val,
                                    relationDetail: val === 'Other' ? entry.relationDetail : null,
                                  })
                                }
                              >
                                <SelectTrigger id={`fh-relation-${entry.id}`}>
                                  <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                  {FAMILY_RELATION_OPTIONS.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FieldWrapper>

                            {entry.relation === 'Other' && (
                              <FieldWrapper label="Specify relationship" htmlFor={`fh-relation-detail-${entry.id}`}>
                                <Input
                                  id={`fh-relation-detail-${entry.id}`}
                                  type="text"
                                  placeholder="e.g. Uncle, cousin"
                                  value={entry.relationDetail ?? ''}
                                  onChange={(e) =>
                                    updateFamilyEntry(pid, entry.id, {
                                      relationDetail: e.target.value || null,
                                    })
                                  }
                                />
                              </FieldWrapper>
                            )}

                            <FieldWrapper label="Condition" htmlFor={`fh-condition-${entry.id}`}>
                              <Select
                                value={entry.condition || ''}
                                onValueChange={(val) =>
                                  updateFamilyEntry(pid, entry.id, {
                                    condition: val,
                                    conditionDetail: val === 'Other' ? entry.conditionDetail : null,
                                  })
                                }
                              >
                                <SelectTrigger id={`fh-condition-${entry.id}`}>
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                                <SelectContent>
                                  {FAMILY_CONDITION_OPTIONS.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FieldWrapper>

                            {entry.condition === 'Other' && (
                              <FieldWrapper label="Specify condition" htmlFor={`fh-condition-detail-${entry.id}`}>
                                <Input
                                  id={`fh-condition-detail-${entry.id}`}
                                  type="text"
                                  placeholder="e.g. Cardiomyopathy"
                                  value={entry.conditionDetail ?? ''}
                                  onChange={(e) =>
                                    updateFamilyEntry(pid, entry.id, {
                                      conditionDetail: e.target.value || null,
                                    })
                                  }
                                />
                              </FieldWrapper>
                            )}

                            <FieldWrapper label="Age of onset" htmlFor={`fh-age-${entry.id}`} idkChecked={entry.ageOfOnset === "I don't know"} onIdkChange={(checked) => updateFamilyEntry(pid, entry.id, { ageOfOnset: checked ? "I don't know" : null })}>
                              <Input
                                id={`fh-age-${entry.id}`}
                                type="text"
                                placeholder="e.g. 55, or approximate age"
                                value={entry.ageOfOnset === "I don't know" ? '' : (entry.ageOfOnset ?? '')}
                                disabled={entry.ageOfOnset === "I don't know"}
                                onChange={(e) =>
                                  updateFamilyEntry(pid, entry.id, {
                                    ageOfOnset: e.target.value || null,
                                  })
                                }
                              />
                            </FieldWrapper>
                          </div>

                          <FieldWrapper label="Notes" htmlFor={`fh-notes-${entry.id}`}>
                            <Textarea
                              id={`fh-notes-${entry.id}`}
                              placeholder="Any additional details"
                              value={entry.notes ?? ''}
                              onChange={(e) =>
                                updateFamilyEntry(pid, entry.id, {
                                  notes: e.target.value || null,
                                })
                              }
                              rows={2}
                            />
                          </FieldWrapper>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* ── General notes ───────────────────────────────── */}
              <FieldWrapper label="General family history notes" htmlFor="fh-notes">
                <Textarea
                  id="fh-notes"
                  placeholder="Any additional notes about family history of heart disease"
                  value={fh.notes ?? ''}
                  onChange={(e) =>
                    updateFamilyHistory(pid, { notes: e.target.value || null })
                  }
                  rows={3}
                />
              </FieldWrapper>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 5. OTHER FACTORS */}
        <AccordionItem value="other">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-primary shrink-0" />
              <span>Other Factors</span>
              <SectionBadge known={otherKnown} total={otherKnown > 0 ? otherKnown : 1} />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* ── Dynamic list ────────────────────────────────── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Factors
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addOtherFactor(pid)}
                    className="gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add factor
                  </Button>
                </div>

                {of.items.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                    No factors added yet. Click &ldquo;Add factor&rdquo; above to record things like stress, sleep issues, or environmental exposures.
                  </p>
                )}

                <div className="space-y-4">
                  {of.items.map((item, index) => (
                    <Card key={item.id}>
                      <CardContent className="pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Factor {index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeOtherFactor(pid, item.id)}
                            aria-label={`Remove factor ${index + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FieldWrapper label="Factor type" htmlFor={`of-type-${item.id}`}>
                            <Select
                              value={item.factor || ''}
                              onValueChange={(val) =>
                                updateOtherFactor(pid, item.id, {
                                  factor: val,
                                })
                              }
                            >
                              <SelectTrigger id={`of-type-${item.id}`}>
                                <SelectValue placeholder="Select factor type" />
                              </SelectTrigger>
                              <SelectContent>
                                {OTHER_FACTOR_OPTIONS.map((opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FieldWrapper>
                        </div>

                        <FieldWrapper label="Details" htmlFor={`of-details-${item.id}`}>
                          <Textarea
                            id={`of-details-${item.id}`}
                            placeholder="Describe this factor in more detail, e.g. severity, duration, impact"
                            value={item.details ?? ''}
                            onChange={(e) =>
                              updateOtherFactor(pid, item.id, {
                                details: e.target.value,
                              })
                            }
                            rows={2}
                          />
                        </FieldWrapper>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* ── General notes ───────────────────────────────── */}
              <FieldWrapper label="General notes on other factors" htmlFor="of-notes">
                <Textarea
                  id="of-notes"
                  placeholder="Any additional notes about other risk factors"
                  value={of.notes ?? ''}
                  onChange={(e) => updateOtherFactorsNotes(pid, e.target.value)}
                  rows={3}
                />
              </FieldWrapper>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Info panel */}
      <InfoPanel title="About this stage">
        <p>
          This stage captures everything you already know about heart risk factors.
          You do not need to fill in every field — only record what you know.
        </p>
        <p className="mt-2">
          If you do not know a particular value, you can type &ldquo;I don&apos;t know&rdquo; or use
          the &ldquo;I don&apos;t know&rdquo; checkbox next to the field. These unknowns will be
          carried forward to Stage 3, where you can prioritise finding them out.
        </p>
      </InfoPanel>
    </div>
  );
}
