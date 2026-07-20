import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type {
  ClarifySession,
  Person,
  PersonRole,
  Measurements,
  Lifestyle,
  MedicalHistory,
  FamilyHistory,
  OtherFactors,
  Unknown,
  DiscussionPoint,
  Decision,
  Action,
  PrivacySettings,
  FamilyHistoryEntry,
  OtherFactor,
} from './clarify-types';

// ─── Factory Functions ─────────────────────────────────────────

function emptyMeasurements(): Measurements {
  return {
    bloodPressure: { systolic: null, diastolic: null, date: null, notes: null },
    cholesterol: { total: null, ldl: null, hdl: null, triglycerides: null, date: null, notes: null },
    bloodSugar: { value: null, unit: null, hba1c: null, date: null, notes: null },
    bmi: { weight: null, weightUnit: null, height: null, heightUnit: null, date: null, notes: null },
    notes: null,
  };
}

function emptyLifestyle(): Lifestyle {
  return {
    smokingStatus: null,
    smokingDetail: null,
    physicalActivity: null,
    physicalActivityDetail: null,
    alcoholConsumption: null,
    alcoholDetail: null,
    dietPatterns: null,
    dietDetail: null,
    notes: null,
  };
}

function emptyMedicalHistory(): MedicalHistory {
  return {
    conditions: [],
    customConditions: '',
    medications: [],
    medicationsNotes: null,
    previousHeartEvents: [],
    previousHeartEventsNotes: null,
    notes: null,
  };
}

function emptyFamilyHistory(): FamilyHistory {
  return {
    hasFamilyHistory: null,
    entries: [],
    notes: null,
  };
}

function emptyOtherFactors(): OtherFactors {
  return { items: [], notes: null };
}

function emptyPrivacySettings(): PrivacySettings {
  return {
    shareDisplayName: true,
    shareAge: true,
    shareSex: true,
    shareRelationship: true,
  };
}

function createPerson(role: PersonRole): Person {
  return {
    id: uuid(),
    role,
    displayName: null,
    approximateAge: null,
    sex: null,
    relationship: role === 'loved-one' ? null : undefined,
    relationshipDetail: null,
    measurements: emptyMeasurements(),
    lifestyle: emptyLifestyle(),
    medicalHistory: emptyMedicalHistory(),
    familyHistory: emptyFamilyHistory(),
    otherFactors: emptyOtherFactors(),
    unknowns: [],
    discussionPoints: [],
    decisions: [],
    privacySettings: emptyPrivacySettings(),
  };
}

function emptySession(): ClarifySession {
  return {
    id: uuid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    persons: [],
    currentStage: 0,
    activePersonId: null,
    started: false,
  };
}

// ─── Store Interface ───────────────────────────────────────────

interface ClarifyStore extends ClarifySession {
  // Navigation
  setStage: (stage: number) => void;
  setActivePersonId: (id: string | null) => void;
  startSession: () => void;

  // Person management
  addPerson: (role: PersonRole) => string;
  removePerson: (id: string) => void;
  updatePerson: (id: string, updates: Partial<Pick<Person, 'displayName' | 'approximateAge' | 'sex' | 'relationship' | 'relationshipDetail'>>) => void;

  // Measurements
  updateBloodPressure: (personId: string, updates: Partial<Measurements['bloodPressure']>) => void;
  updateCholesterol: (personId: string, updates: Partial<Measurements['cholesterol']>) => void;
  updateBloodSugar: (personId: string, updates: Partial<Measurements['bloodSugar']>) => void;
  updateBmi: (personId: string, updates: Partial<Measurements['bmi']>) => void;
  updateMeasurementsNotes: (personId: string, notes: string) => void;

  // Lifestyle
  updateLifestyle: (personId: string, updates: Partial<Lifestyle>) => void;

  // Medical history
  updateMedicalHistory: (personId: string, updates: Partial<MedicalHistory>) => void;

  // Family history
  updateFamilyHistory: (personId: string, updates: Partial<FamilyHistory>) => void;
  addFamilyEntry: (personId: string) => void;
  updateFamilyEntry: (personId: string, entryId: string, updates: Partial<FamilyHistoryEntry>) => void;
  removeFamilyEntry: (personId: string, entryId: string) => void;

  // Other factors
  addOtherFactor: (personId: string) => void;
  updateOtherFactor: (personId: string, factorId: string, updates: Partial<OtherFactor>) => void;
  removeOtherFactor: (personId: string, factorId: string) => void;
  updateOtherFactorsNotes: (personId: string, notes: string) => void;

  // Unknowns (Stage 3)
  addUnknown: (personId: string, unknown: Omit<Unknown, 'id'>) => void;
  updateUnknown: (personId: string, unknownId: string, updates: Partial<Unknown>) => void;
  removeUnknown: (personId: string, unknownId: string) => void;

  // Discussion points (Stage 4)
  addDiscussionPoint: (personId: string) => void;
  updateDiscussionPoint: (personId: string, pointId: string, updates: Partial<DiscussionPoint>) => void;
  removeDiscussionPoint: (personId: string, pointId: string) => void;

  // Decisions (Stage 5)
  addDecision: (personId: string) => void;
  updateDecision: (personId: string, decisionId: string, updates: Partial<Decision>) => void;
  removeDecision: (personId: string, decisionId: string) => void;
  addAction: (personId: string, decisionId: string) => void;
  updateAction: (personId: string, decisionId: string, actionId: string, updates: Partial<Action>) => void;
  removeAction: (personId: string, decisionId: string, actionId: string) => void;

  // Privacy
  updatePrivacySettings: (personId: string, updates: Partial<PrivacySettings>) => void;

  // Utility
  getPerson: (id: string) => Person | undefined;
  getActivePerson: () => Person | undefined;
  resetSession: () => void;

  // Helpers
  touch: () => void;
}

// ─── Store ─────────────────────────────────────────────────────

export const useClarifyStore = create<ClarifyStore>()(
  persist(
    (set, get) => ({
      ...emptySession(),

      touch: () => set({ updatedAt: new Date().toISOString() }),

      // Navigation
      setStage: (stage) => set({ currentStage: stage, updatedAt: new Date().toISOString() }),
      setActivePersonId: (id) => set({ activePersonId: id, updatedAt: new Date().toISOString() }),
      startSession: () => set({ started: true, currentStage: 1, updatedAt: new Date().toISOString() }),

      // Person management
      addPerson: (role) => {
        const person = createPerson(role);
        set((s) => ({
          persons: [...s.persons, person],
          activePersonId: person.id,
          updatedAt: new Date().toISOString(),
        }));
        return person.id;
      },

      removePerson: (id) =>
        set((s) => {
          const remaining = s.persons.filter((p) => p.id !== id);
          return {
            persons: remaining,
            activePersonId: s.activePersonId === id
              ? (remaining[0]?.id ?? null)
              : s.activePersonId,
            updatedAt: new Date().toISOString(),
          };
        }),

      updatePerson: (id, updates) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: undefined } : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      // Measurements
      updateBloodPressure: (personId, updates) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? { ...p, measurements: { ...p.measurements, bloodPressure: { ...p.measurements.bloodPressure, ...updates } } }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      updateCholesterol: (personId, updates) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? { ...p, measurements: { ...p.measurements, cholesterol: { ...p.measurements.cholesterol, ...updates } } }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      updateBloodSugar: (personId, updates) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? { ...p, measurements: { ...p.measurements, bloodSugar: { ...p.measurements.bloodSugar, ...updates } } }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      updateBmi: (personId, updates) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? { ...p, measurements: { ...p.measurements, bmi: { ...p.measurements.bmi, ...updates } } }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      updateMeasurementsNotes: (personId, notes) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? { ...p, measurements: { ...p.measurements, notes } }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      // Lifestyle
      updateLifestyle: (personId, updates) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? { ...p, lifestyle: { ...p.lifestyle, ...updates } }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      // Medical history
      updateMedicalHistory: (personId, updates) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? { ...p, medicalHistory: { ...p.medicalHistory, ...updates } }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      // Family history
      updateFamilyHistory: (personId, updates) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? { ...p, familyHistory: { ...p.familyHistory, ...updates } }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      addFamilyEntry: (personId) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  familyHistory: {
                    ...p.familyHistory,
                    entries: [...p.familyHistory.entries, { id: uuid(), relation: '', relationDetail: null, condition: '', conditionDetail: null, ageOfOnset: null, notes: null }],
                  },
                }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      updateFamilyEntry: (personId, entryId, updates) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  familyHistory: {
                    ...p.familyHistory,
                    entries: p.familyHistory.entries.map((e) =>
                      e.id === entryId ? { ...e, ...updates } : e
                    ),
                  },
                }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      removeFamilyEntry: (personId, entryId) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  familyHistory: {
                    ...p.familyHistory,
                    entries: p.familyHistory.entries.filter((e) => e.id !== entryId),
                  },
                }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      // Other factors
      addOtherFactor: (personId) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  otherFactors: {
                    ...p.otherFactors,
                    items: [...p.otherFactors.items, { id: uuid(), factor: '', details: '' }],
                  },
                }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      updateOtherFactor: (personId, factorId, updates) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  otherFactors: {
                    ...p.otherFactors,
                    items: p.otherFactors.items.map((f) =>
                      f.id === factorId ? { ...f, ...updates } : f
                    ),
                  },
                }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      removeOtherFactor: (personId, factorId) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  otherFactors: {
                    ...p.otherFactors,
                    items: p.otherFactors.items.filter((f) => f.id !== factorId),
                  },
                }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      updateOtherFactorsNotes: (personId, notes) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? { ...p, otherFactors: { ...p.otherFactors, notes } }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      // Unknowns
      addUnknown: (personId, unknown) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? { ...p, unknowns: [...p.unknowns, { ...unknown, id: uuid() }] }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      updateUnknown: (personId, unknownId, updates) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  unknowns: p.unknowns.map((u) =>
                    u.id === unknownId ? { ...u, ...updates } : u
                  ),
                }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      removeUnknown: (personId, unknownId) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? { ...p, unknowns: p.unknowns.filter((u) => u.id !== unknownId) }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      // Discussion points
      addDiscussionPoint: (personId) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  discussionPoints: [
                    ...p.discussionPoints,
                    { id: uuid(), question: '', linkedUnknownId: null, urgency: 'medium', whoShouldBePresent: null, notes: null },
                  ],
                }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      updateDiscussionPoint: (personId, pointId, updates) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  discussionPoints: p.discussionPoints.map((dp) =>
                    dp.id === pointId ? { ...dp, ...updates } : dp
                  ),
                }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      removeDiscussionPoint: (personId, pointId) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? { ...p, discussionPoints: p.discussionPoints.filter((dp) => dp.id !== pointId) }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      // Decisions
      addDecision: (personId) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  decisions: [
                    ...p.decisions,
                    { id: uuid(), summary: '', date: null, actions: [], appointmentDetails: null, notes: null },
                  ],
                }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      updateDecision: (personId, decisionId, updates) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  decisions: p.decisions.map((d) =>
                    d.id === decisionId ? { ...d, ...updates } : d
                  ),
                }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      removeDecision: (personId, decisionId) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? { ...p, decisions: p.decisions.filter((d) => d.id !== decisionId) }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      addAction: (personId, decisionId) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  decisions: p.decisions.map((d) =>
                    d.id === decisionId
                      ? { ...d, actions: [...d.actions, { id: uuid(), description: '', dueDate: null, completed: false }] }
                      : d
                  ),
                }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      updateAction: (personId, decisionId, actionId, updates) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  decisions: p.decisions.map((d) =>
                    d.id === decisionId
                      ? {
                          ...d,
                          actions: d.actions.map((a) =>
                            a.id === actionId ? { ...a, ...updates } : a
                          ),
                        }
                      : d
                  ),
                }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      removeAction: (personId, decisionId, actionId) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  decisions: p.decisions.map((d) =>
                    d.id === decisionId
                      ? { ...d, actions: d.actions.filter((a) => a.id !== actionId) }
                      : d
                  ),
                }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      // Privacy
      updatePrivacySettings: (personId, updates) =>
        set((s) => ({
          persons: s.persons.map((p) =>
            p.id === personId
              ? { ...p, privacySettings: { ...p.privacySettings, ...updates } }
              : p
          ),
          updatedAt: new Date().toISOString(),
        })),

      // Utility
      getPerson: (id) => get().persons.find((p) => p.id === id),
      getActivePerson: () => {
        const s = get();
        return s.persons.find((p) => p.id === s.activePersonId);
      },

      resetSession: () => {
        const fresh = emptySession();
        set(fresh);
      },
    }),
    {
      name: 'heartfirst-clarify-session',
      // Only persist the session data, not the store functions
      partialize: (state) => ({
        id: state.id,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
        persons: state.persons,
        currentStage: state.currentStage,
        activePersonId: state.activePersonId,
        started: state.started,
      }),
    }
  )
);