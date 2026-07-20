# HeartFirst Clarify — Worklog

---
Task ID: 1
Agent: Main
Task: Create the Clarify Experience & Functional Specification

## Product Contract

**What Clarify is:** A structured, local-first web tool that helps a person gather what is known about heart risk, identify gaps, prepare for a health team conversation, and record decisions and next actions — for themselves or someone they love.

**What Clarify is not:** A diagnostic tool, clinical risk calculator, treatment recommendation system, or substitute for a qualified health professional.

**Definition of completion for version one:**
A user can open the application, identify who needs clarity (self and/or loved ones), enter known heart risk information, flag what is unknown, prepare discussion points, record outcomes, and produce at minimum three standalone, printable outputs — without creating an account, with automatic save and resume, and with privacy controls that let the user decide what is combined for sharing.

## Principal User Situations

1. **Self-directed inquiry:** A person concerned about their own heart risk, wanting to organise what they know before seeing a doctor or nurse.
2. **Caring for a loved one:** A person gathering and organising heart risk information for someone close to them — a partner, parent, friend, sibling, or child.
3. **Combined self + loved one:** A person working through the process for themselves and one or more loved ones, keeping records appropriately separate.
4. **Post-appointment follow-up:** A person returning after a health team conversation to record what was decided and what to do next.
5. **Resuming after a break:** A person who started the process, saved their work, and returns days or weeks later.

## Five-Stage Experience Map

### Stage 1: Who needs clarity?
- **Purpose:** Establish whose heart risk is being examined and set up the person record(s).
- **Inputs:** Whether the user is working on themselves, a loved one, or both. For each person: a display name (optional), approximate age, sex assigned at birth, and (for loved ones only) their relationship to the user.
- **Outputs:** One or more person records that all subsequent stages reference.
- **Conditional routes:** If the user selects "someone I love," a loved-one record is created. The user may add more than one loved one. Each person's data is kept separate throughout.
- **"I don't know" handling:** All fields optional except the role (self vs loved one). If age or sex is unknown, the user may select "I don't know" and this is noted in outputs.

### Stage 2: What do we know?
- **Purpose:** Capture known heart risk information for each person, organised into clear categories.
- **Categories:**
  - Measurements (blood pressure, cholesterol, blood sugar, BMI/weight/height)
  - Lifestyle (smoking, physical activity, alcohol, diet)
  - Medical history (existing conditions, current medications, previous heart events)
  - Family history (first-degree relatives with heart disease, age of onset if known)
  - Other factors (stress, sleep, environmental exposures)
- **Inputs:** Structured fields within each category. Each field has an "I don't know" option. Free-text notes for context.
- **Outputs:** Heart Risk Audit Record (per person) — a structured summary of everything entered.
- **Conditional routes:** If the user indicates no known information, they proceed to Stage 3 directly with a message that the Missing-Information Summary will help identify what to find out.
- **"I don't know" handling:** Every field supports "I don't know." Unknowns are automatically carried forward to Stage 3 as items to investigate.

### Stage 3: What remains unknown or unclear?
- **Purpose:** Systematically identify gaps and create a prioritised list of information to obtain.
- **Inputs:** Auto-populated from Stage 2 "I don't know" responses. The user may add additional items, mark priority, and note how they might find out.
- **Outputs:** Missing-Information Summary (per person).
- **Conditional routes:** If no unknowns remain, the user sees a confirmation and may skip to Stage 4.

### Stage 4: What needs to be discussed?
- **Purpose:** Prepare specific questions, concerns, and preferences for a health team conversation.
- **Inputs:** The user writes discussion points, optionally linked to specific unknowns from Stage 3 or known information from Stage 2. They may indicate urgency and who should be present.
- **Outputs:** Health Team Discussion Brief (per person).
- **Conditional routes:** The user may skip this stage if they are not preparing for a conversation yet.

### Stage 5: What happens next?
- **Purpose:** Record decisions, agreed actions, follow-up appointments, and scheduled tests after a health team conversation.
- **Inputs:** Free-text decision entries, action items with optional due dates, appointment details.
- **Outputs:** Decision and Next-Action Record (per person). This also feeds into the Take-Forward Pack.
- **Conditional routes:** The user may complete this immediately or return later.

## Information Model

```
Session
├── id: string
├── createdAt: datetime
├── updatedAt: datetime
├── persons: Person[]
│   ├── id: string
│   ├── role: 'self' | 'loved-one'
│   ├── displayName: string | null
│   ├── approximateAge: string | null  // "I don't know" supported
│   ├── sex: string | null             // "I don't know" supported
│   ├── relationship: string | null    // loved-one only
│   ├── measurements: Measurements
│   │   ├── bloodPressure: { systolic, diastolic, date, notes } | null
│   │   ├── cholesterol: { total, ldl, hdl, triglycerides, date, notes } | null
│   │   ├── bloodSugar: { value, hba1c, date, notes, type } | null
│   │   ├── bmi: { weight, height, date, notes } | null
│   ├── lifestyle: Lifestyle
│   │   ├── smokingStatus: string | null
│   │   ├── physicalActivity: string | null
│   │   ├── alcoholConsumption: string | null
│   │   ├── dietPatterns: string | null
│   │   ├── notes: string | null
│   ├── medicalHistory: MedicalHistory
│   │   ├── conditions: string[]
│   │   ├── medications: string[]
│   │   ├── previousHeartEvents: string[]
│   │   ├── notes: string | null
│   ├── familyHistory: FamilyHistory
│   │   ├── relatives: { relation, condition, ageOfOnset, notes }[]
│   │   ├── notes: string | null
│   ├── otherFactors: OtherFactors
│   │   ├── items: { factor, details }[]
│   │   ├── notes: string | null
│   ├── unknowns: Unknown[]
│   │   ├── id: string
│   │   ├── category: string
│   │   ├── description: string
│   │   ├── autoFromStage2: boolean
│   │   ├── priority: 'low' | 'medium' | 'high'
│   │   ├── howToFindOut: string | null
│   ├── discussionPoints: DiscussionPoint[]
│   │   ├── id: string
│   │   ├── question: string
│   │   ├── linkedUnknownId: string | null
│   │   ├── urgency: 'low' | 'medium' | 'high'
│   │   ├── whoShouldBePresent: string | null
│   │   ├── notes: string | null
│   ├── decisions: Decision[]
│   │   ├── id: string
│   │   ├── summary: string
│   │   ├── date: string | null
│   │   ├── actions: Action[]
│   │   │   ├── id: string
│   │   │   ├── description: string
│   │   │   ├── dueDate: string | null
│   │   │   ├── completed: boolean
│   │   ├── appointmentDetails: string | null
│   │   ├── notes: string | null
│   └── privacySettings: PrivacySettings
│       ├── shareDisplayName: boolean
│       ├── shareAge: boolean
│       ├── shareSex: boolean
│       ├── shareRelationship: boolean
├── currentStage: number
└── completedStages: number[]
```

## Required Outputs (Version One)

1. **Heart Risk Audit Record** — Structured summary of all known information per person. Print-friendly.
2. **Missing-Information Summary** — List of unknowns with priority and suggested next steps per person.
3. **Health Team Discussion Brief** — Prepared questions and concerns per person, ready to bring to an appointment.
4. **Decision and Next-Action Record** — Record of decisions and actions per person.
5. **People You Love follow-up** — Overview across all loved-one records with pending items.
6. **Clarify Take-Forward Pack** — Combined, user-selected outputs in a single printable document.

## Privacy and Sharing Behaviour

- PII (display name, age, sex, relationship) is stored separately from health data in the data model.
- Each person record has privacy toggles controlling which PII fields appear in shared/exported outputs.
- The user explicitly selects which outputs to include in the Take-Forward Pack.
- No data leaves the browser unless the user deliberately prints, exports, or shares.
- No account, no server-side storage in version one.

## First Functional Vertical Slice

The minimum viable path through the application:
1. User opens the application, sees the welcome screen.
2. User selects "myself" and provides optional name, age, sex.
3. User enters at least one measurement (e.g., blood pressure) or selects "I don't know."
4. User reviews auto-populated unknowns and adds one discussion point.
5. User previews the Heart Risk Audit Record.
6. User prints or saves the output.

## Testable Acceptance Criteria

1. **Save and resume:** A user who closes the browser and returns within 30 days finds their data intact and can continue from the last active stage.
2. **Person separation:** Data entered for one person never appears in another person's outputs.
3. **"I don't know" flow:** Selecting "I don't know" on any Stage 2 field automatically creates an entry in Stage 3.
4. **Print output:** At least one output (Heart Risk Audit Record) renders correctly in a browser print preview with no overflow, no missing content, and no interactive elements.
5. **Privacy toggle:** Disabling "share display name" in privacy settings removes the name from all exported/shared outputs.
6. **No account required:** A user completes the full five-stage process without being asked for an email, password, or phone number.
7. **Responsive design:** The application is fully usable on a 375px-wide mobile screen.

## Deliberately Excluded from Version One

- User accounts and cloud sync
- Clinical risk score calculation (e.g., QRISK, ASCVD)
- Integration with health records or wearables
- Multi-language support (English only)
- Dark mode (light mode only for health tool clarity)
- Push notifications or email reminders
- Collaboration features (multiple editors)
- Version history / undo beyond browser undo

## Build Architecture

- **Framework:** Next.js 16 with App Router (already in place)
- **State:** Zustand with localStorage persist middleware (local-first, no backend needed)
- **UI:** shadcn/ui (New York style) with Tailwind CSS 4
- **Print:** Dedicated print CSS media queries; each output has a print-optimised view
- **Routing:** Single-page application on `/` — all stages and outputs rendered client-side within the same route
- **No database** in version one — all data in browser localStorage
- **No API routes** needed for core functionality
- **Accessibility:** Semantic HTML, ARIA labels, keyboard navigation, focus management

## Decisions Requiring Founder's Judgement

1. Whether to include a "suggested questions" library in Stage 4 (pre-written questions the user can select from) or rely entirely on free-text.
2. The precise wording of the medical disclaimer that must appear on every output.
3. Whether the People You Love follow-up should show a summary table or individual cards.
4. Pricing page integration — how the paywall/gate works for the €17 product.
5. Whether to include a data export (JSON) feature in addition to print/PDF.