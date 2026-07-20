// HeartFirst Clarify — Type Definitions

// ─── Person & Role ─────────────────────────────────────────────

export type PersonRole = 'self' | 'loved-one';

export interface Person {
  id: string;
  role: PersonRole;
  displayName: string | null;
  approximateAge: string | null; // e.g. "45", "early 60s", or "I don't know"
  sex: string | null; // "Male" | "Female" | "Intersex" | "I don't know" | "Prefer not to say"
  relationship: string | null; // loved-one only: "Parent", "Partner", "Sibling", "Friend", "Child", "Other"
  relationshipDetail: string | null; // free text if "Other"

  measurements: Measurements;
  lifestyle: Lifestyle;
  medicalHistory: MedicalHistory;
  familyHistory: FamilyHistory;
  otherFactors: OtherFactors;

  unknowns: Unknown[];
  discussionPoints: DiscussionPoint[];
  decisions: Decision[];

  privacySettings: PrivacySettings;
}

// ─── Measurements ──────────────────────────────────────────────

export interface BloodPressure {
  systolic: string | null;
  diastolic: string | null;
  date: string | null;
  notes: string | null;
}

export interface Cholesterol {
  total: string | null;
  ldl: string | null;
  hdl: string | null;
  triglycerides: string | null;
  date: string | null;
  notes: string | null;
}

export interface BloodSugar {
  value: string | null;
  unit: 'mmol/L' | 'mg/dL' | null;
  hba1c: string | null;
  date: string | null;
  notes: string | null;
}

export interface BmiRecord {
  weight: string | null;
  weightUnit: 'kg' | 'lbs' | null;
  height: string | null;
  heightUnit: 'cm' | 'ft/in' | null;
  date: string | null;
  notes: string | null;
}

export interface Measurements {
  bloodPressure: BloodPressure;
  cholesterol: Cholesterol;
  bloodSugar: BloodSugar;
  bmi: BmiRecord;
  notes: string | null;
}

// ─── Lifestyle ─────────────────────────────────────────────────

export interface Lifestyle {
  smokingStatus: string | null; // "Never" | "Former" | "Current" | "I don't know"
  smokingDetail: string | null;
  physicalActivity: string | null; // "Very active" | "Moderately active" | "Lightly active" | "Sedentary" | "I don't know"
  physicalActivityDetail: string | null;
  alcoholConsumption: string | null; // "None" | "Occasional" | "Moderate" | "Heavy" | "I don't know"
  alcoholDetail: string | null;
  dietPatterns: string | null; // "Balanced" | "High processed food" | "High salt" | "High fat" | "I don't know" or free text
  dietDetail: string | null;
  notes: string | null;
}

// ─── Medical History ───────────────────────────────────────────

export interface MedicalHistory {
  conditions: string[]; // selected from list + custom entries
  customConditions: string;
  medications: string[]; // free-text entries
  medicationsNotes: string | null;
  previousHeartEvents: string[]; // "Heart attack" | "Stroke" | "Angina" | "Heart failure" | "None" | custom
  previousHeartEventsNotes: string | null;
  notes: string | null;
}

// ─── Family History ────────────────────────────────────────────

export interface FamilyHistoryEntry {
  id: string;
  relation: string; // "Mother" | "Father" | "Sibling" | "Grandparent" | "Other"
  relationDetail: string | null;
  condition: string; // "Heart attack" | "Stroke" | "High blood pressure" | "High cholesterol" | "Heart failure" | "Other"
  conditionDetail: string | null;
  ageOfOnset: string | null;
  notes: string | null;
}

export interface FamilyHistory {
  hasFamilyHistory: string | null; // "Yes" | "No" | "I don't know" | "Not applicable"
  entries: FamilyHistoryEntry[];
  notes: string | null;
}

// ─── Other Factors ─────────────────────────────────────────────

export interface OtherFactor {
  id: string;
  factor: string; // "Stress" | "Sleep" | "Environmental" | "Occupational" | "Other"
  details: string;
}

export interface OtherFactors {
  items: OtherFactor[];
  notes: string | null;
}

// ─── Unknowns (Stage 3) ────────────────────────────────────────

export type Priority = 'low' | 'medium' | 'high';

export interface Unknown {
  id: string;
  category: string; // "Measurements" | "Lifestyle" | "Medical history" | "Family history" | "Other"
  description: string;
  autoFromStage2: boolean;
  priority: Priority;
  howToFindOut: string | null;
}

// ─── Discussion Points (Stage 4) ───────────────────────────────

export interface DiscussionPoint {
  id: string;
  question: string;
  linkedUnknownId: string | null;
  urgency: Priority;
  whoShouldBePresent: string | null;
  notes: string | null;
}

// ─── Decisions (Stage 5) ───────────────────────────────────────

export interface Action {
  id: string;
  description: string;
  dueDate: string | null;
  completed: boolean;
}

export interface Decision {
  id: string;
  summary: string;
  date: string | null;
  actions: Action[];
  appointmentDetails: string | null;
  notes: string | null;
}

// ─── Privacy Settings ──────────────────────────────────────────

export interface PrivacySettings {
  shareDisplayName: boolean;
  shareAge: boolean;
  shareSex: boolean;
  shareRelationship: boolean;
}

// ─── Session ───────────────────────────────────────────────────

export interface ClarifySession {
  id: string;
  createdAt: string;
  updatedAt: string;
  persons: Person[];
  currentStage: number; // 0 = welcome, 1-5 = stages, 6 = outputs
  activePersonId: string | null;
  started: boolean;
}

// ─── Stage Definitions ─────────────────────────────────────────

export interface StageDef {
  number: number;
  title: string;
  subtitle: string;
  description: string;
}

export const STAGES: StageDef[] = [
  {
    number: 1,
    title: 'Who needs clarity?',
    subtitle: 'Set up the person or people you are gathering information for.',
    description: 'Tell us whether you are working on your own heart risk or gathering information for someone you love. You can add more than one person and switch between them at any time.',
  },
  {
    number: 2,
    title: 'What do we know?',
    subtitle: 'Record the heart risk information already available.',
    description: 'Enter measurements, lifestyle information, medical history, family history, and any other factors you are aware of. If you do not know something, select "I don\'t know" — it will be carried forward to the next stage.',
  },
  {
    number: 3,
    title: 'What remains unknown or unclear?',
    subtitle: 'Identify gaps and plan how to fill them.',
    description: 'Review the information gaps identified automatically from Stage 2, add any others, set priorities, and note how you might find out. This feeds directly into your Missing-Information Summary.',
  },
  {
    number: 4,
    title: 'What needs to be discussed?',
    subtitle: 'Prepare for a health team conversation.',
    description: 'Write down the questions and concerns you want to raise with your health team. Link them to specific unknowns if relevant, and indicate who should be present at the conversation.',
  },
  {
    number: 5,
    title: 'What happens next?',
    subtitle: 'Record decisions, actions, and follow-up plans.',
    description: 'After your health team conversation (or whenever you are ready), record what was decided, what actions were agreed, and any follow-up appointments or tests that are needed.',
  },
];

// ─── Output Definitions ────────────────────────────────────────

export interface OutputDef {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
}

export const OUTPUTS: OutputDef[] = [
  {
    id: 'heart-risk-audit',
    title: 'Heart Risk Audit Record',
    description: 'A structured summary of all known heart risk information for one person.',
    icon: 'ClipboardList',
  },
  {
    id: 'missing-info',
    title: 'Missing-Information Summary',
    description: 'A prioritised list of information gaps and how to address them.',
    icon: 'HelpCircle',
  },
  {
    id: 'discussion-brief',
    title: 'Health Team Discussion Brief',
    description: 'Prepared questions and concerns ready for a health appointment.',
    icon: 'MessageSquare',
  },
  {
    id: 'decision-record',
    title: 'Decision and Next-Action Record',
    description: 'A record of decisions made and actions agreed with your health team.',
    icon: 'CheckSquare',
  },
  {
    id: 'people-followup',
    title: 'People You Love Follow-Up',
    description: 'An overview across all loved-one records with pending items.',
    icon: 'Users',
  },
  {
    id: 'take-forward-pack',
    title: 'Clarify Take-Forward Pack',
    description: 'A combined, user-selected set of outputs in one printable document.',
    icon: 'Package',
  },
];

// ─── Constants ─────────────────────────────────────────────────

export const RELATIONSHIP_OPTIONS = [
  'Parent',
  'Partner',
  'Spouse',
  'Sibling',
  'Child',
  'Close friend',
  'Other',
] as const;

export const SEX_OPTIONS = [
  'Male',
  'Female',
  'Intersex',
  'I don\'t know',
  'Prefer not to say',
] as const;

export const SMOKING_OPTIONS = [
  'Never smoked',
  'Former smoker',
  'Current smoker',
  'I don\'t know',
] as const;

export const ACTIVITY_OPTIONS = [
  'Very active (150+ min vigorous/week)',
  'Moderately active (150+ min moderate/week)',
  'Lightly active (60–150 min/week)',
  'Sedentary (less than 60 min/week)',
  'I don\'t know',
] as const;

export const ALCOHOL_OPTIONS = [
  'None',
  'Occasional (1–2 units/week)',
  'Moderate (3–14 units/week)',
  'Heavy (15+ units/week)',
  'I don\'t know',
] as const;

export const CONDITION_OPTIONS = [
  'High blood pressure (hypertension)',
  'High cholesterol (hyperlipidaemia)',
  'Type 2 diabetes',
  'Type 1 diabetes',
  'Chronic kidney disease',
  'Atrial fibrillation',
  'Heart failure',
  'Peripheral arterial disease',
  'None known',
] as const;

export const HEART_EVENT_OPTIONS = [
  'Heart attack (myocardial infarction)',
  'Stroke',
  'Transient ischaemic attack (TIA / mini-stroke)',
  'Angina',
  'Heart failure diagnosis',
  'Coronary artery bypass or stent',
  'None',
] as const;

export const FAMILY_RELATION_OPTIONS = [
  'Mother',
  'Father',
  'Brother',
  'Sister',
  'Maternal grandmother',
  'Maternal grandfather',
  'Paternal grandmother',
  'Paternal grandfather',
  'Other',
] as const;

export const FAMILY_CONDITION_OPTIONS = [
  'Heart attack',
  'Stroke',
  'High blood pressure',
  'High cholesterol',
  'Heart failure',
  'Atrial fibrillation',
  'Sudden cardiac death',
  'Other',
] as const;

export const OTHER_FACTOR_OPTIONS = [
  'Chronic stress',
  'Poor sleep',
  'Shift work',
  'Exposure to air pollution',
  'Exposure to second-hand smoke',
  'Work-related physical inactivity',
  'Other',
] as const;