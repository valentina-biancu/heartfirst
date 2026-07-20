import type { Person, Unknown, Measurements, Lifestyle, MedicalHistory, FamilyHistory } from './clarify-types';

/**
 * Automatically generate Unknown entries from Stage 2 fields that are null or "I don't know".
 */
export function generateAutoUnknowns(person: Person): Omit<Unknown, 'id'>[] {
  const unknowns: Omit<Unknown, 'id'>[] = [];
  const m = person.measurements;

  // Blood pressure
  if (!m.bloodPressure.systolic || !m.bloodPressure.diastolic) {
    unknowns.push({
      category: 'Measurements',
      description: 'Blood pressure reading',
      autoFromStage2: true,
      priority: 'high',
      howToFindOut: null,
    });
  }

  // Cholesterol
  if (!m.cholesterol.total && !m.cholesterol.ldl && !m.cholesterol.hdl) {
    unknowns.push({
      category: 'Measurements',
      description: 'Cholesterol levels (total, LDL, HDL, triglycerides)',
      autoFromStage2: true,
      priority: 'high',
      howToFindOut: null,
    });
  } else {
    if (!m.cholesterol.total) {
      unknowns.push({ category: 'Measurements', description: 'Total cholesterol', autoFromStage2: true, priority: 'medium', howToFindOut: null });
    }
    if (!m.cholesterol.ldl) {
      unknowns.push({ category: 'Measurements', description: 'LDL cholesterol', autoFromStage2: true, priority: 'high', howToFindOut: null });
    }
    if (!m.cholesterol.hdl) {
      unknowns.push({ category: 'Measurements', description: 'HDL cholesterol', autoFromStage2: true, priority: 'medium', howToFindOut: null });
    }
    if (!m.cholesterol.triglycerides) {
      unknowns.push({ category: 'Measurements', description: 'Triglycerides', autoFromStage2: true, priority: 'medium', howToFindOut: null });
    }
  }

  // Blood sugar
  if (!m.bloodSugar.value && !m.bloodSugar.hba1c) {
    unknowns.push({
      category: 'Measurements',
      description: 'Blood sugar or HbA1c level',
      autoFromStage2: true,
      priority: 'high',
      howToFindOut: null,
    });
  }

  // BMI
  if (!m.bmi.weight && !m.bmi.height) {
    unknowns.push({
      category: 'Measurements',
      description: 'Weight and height (to assess BMI)',
      autoFromStage2: true,
      priority: 'medium',
      howToFindOut: null,
    });
  }

  // Lifestyle
  const l = person.lifestyle;
  if (!l.smokingStatus || l.smokingStatus === "I don't know") {
    unknowns.push({ category: 'Lifestyle', description: 'Smoking status', autoFromStage2: true, priority: 'high', howToFindOut: null });
  }
  if (!l.physicalActivity || l.physicalActivity === "I don't know") {
    unknowns.push({ category: 'Lifestyle', description: 'Physical activity level', autoFromStage2: true, priority: 'medium', howToFindOut: null });
  }
  if (!l.alcoholConsumption || l.alcoholConsumption === "I don't know") {
    unknowns.push({ category: 'Lifestyle', description: 'Alcohol consumption', autoFromStage2: true, priority: 'medium', howToFindOut: null });
  }
  if (!l.dietPatterns || l.dietPatterns === "I don't know") {
    unknowns.push({ category: 'Lifestyle', description: 'Diet patterns', autoFromStage2: true, priority: 'low', howToFindOut: null });
  }

  // Medical history
  const mh = person.medicalHistory;
  if (mh.conditions.length === 0) {
    unknowns.push({ category: 'Medical history', description: 'Known medical conditions (especially those affecting heart risk)', autoFromStage2: true, priority: 'high', howToFindOut: null });
  }
  if (mh.medications.length === 0) {
    unknowns.push({ category: 'Medical history', description: 'Current medications', autoFromStage2: true, priority: 'high', howToFindOut: null });
  }
  if (mh.previousHeartEvents.length === 0) {
    unknowns.push({ category: 'Medical history', description: 'Previous heart events or cardiovascular procedures', autoFromStage2: true, priority: 'high', howToFindOut: null });
  }

  // Family history
  const fh = person.familyHistory;
  if (!fh.hasFamilyHistory || fh.hasFamilyHistory === "I don't know") {
    unknowns.push({ category: 'Family history', description: 'Family history of heart disease', autoFromStage2: true, priority: 'high', howToFindOut: null });
  } else if (fh.hasFamilyHistory === 'Yes' && fh.entries.length === 0) {
    unknowns.push({ category: 'Family history', description: 'Details of family members with heart disease', autoFromStage2: true, priority: 'high', howToFindOut: null });
  }

  return unknowns;
}

/**
 * Get a display label for a person.
 */
export function personLabel(person: Person): string {
  if (person.displayName) return person.displayName;
  if (person.role === 'self') return 'You';
  if (person.relationship) return `Your ${person.relationship.toLowerCase()}`;
  return 'Unnamed person';
}

/**
 * Format a person's identity for output, respecting privacy settings.
 */
export function personIdentityForOutput(person: Person): string {
  const parts: string[] = [];
  if (person.privacySettings.shareDisplayName && person.displayName) {
    parts.push(person.displayName);
  }
  if (person.privacySettings.shareAge && person.approximateAge && person.approximateAge !== "I don't know") {
    parts.push(`Age: ${person.approximateAge}`);
  }
  if (person.privacySettings.shareSex && person.sex && person.sex !== "I don't know" && person.sex !== 'Prefer not to say') {
    parts.push(`Sex: ${person.sex}`);
  }
  if (person.role === 'loved-one' && person.privacySettings.shareRelationship && person.relationship) {
    parts.push(`Relationship: ${person.relationship}${person.relationshipDetail ? ` (${person.relationshipDetail})` : ''}`);
  }
  return parts.join(' · ') || 'Identity withheld';
}

/**
 * Check if a person has any data entered in Stage 2.
 */
export function hasStage2Data(person: Person): boolean {
  const m = person.measurements;
  const l = person.lifestyle;
  const mh = person.medicalHistory;
  const fh = person.familyHistory;
  const of = person.otherFactors;

  const hasMeasurement = m.bloodPressure.systolic || m.bloodPressure.diastolic ||
    m.cholesterol.total || m.cholesterol.ldl || m.cholesterol.hdl || m.cholesterol.triglycerides ||
    m.bloodSugar.value || m.bloodSugar.hba1c ||
    m.bmi.weight || m.bmi.height || m.notes;

  const hasLifestyle = l.smokingStatus || l.physicalActivity || l.alcoholConsumption || l.dietPatterns || l.notes;

  const hasMedical = mh.conditions.length > 0 || mh.medications.length > 0 ||
    mh.previousHeartEvents.length > 0 || mh.customConditions || mh.notes;

  const hasFamily = fh.hasFamilyHistory || fh.entries.length > 0 || fh.notes;

  const hasOther = of.items.length > 0 || of.notes;

  return !!(hasMeasurement || hasLifestyle || hasMedical || hasFamily || hasOther);
}

/**
 * Count unknowns for a person.
 */
export function countUnknowns(person: Person): number {
  return person.unknowns.length;
}

/**
 * Count discussion points for a person.
 */
export function countDiscussionPoints(person: Person): number {
  return person.discussionPoints.length;
}

/**
 * Count decisions for a person.
 */
export function countDecisions(person: Person): number {
  return person.decisions.length;
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Get today's date as ISO string.
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Trigger browser print dialog.
 */
export function printOutput() {
  window.print();
}

/**
 * Generate a summary of what's been completed for each stage.
 */
export function getStageCompletionSummary(person: Person): {
  stage1: boolean;
  stage2: boolean;
  stage3: boolean;
  stage4: boolean;
  stage5: boolean;
} {
  return {
    stage1: true, // If the person exists, stage 1 is done
    stage2: hasStage2Data(person),
    stage3: person.unknowns.length > 0,
    stage4: person.discussionPoints.length > 0,
    stage5: person.decisions.length > 0,
  };
}