// =============================================================================
// MOVE OS — Adaptive Protocol Engine: Shared Types
// All engine inputs, outputs, and data contracts live here.
// =============================================================================

// ── Inputs ────────────────────────────────────────────────────────────────────

export interface HealthData {
    sleepHours?: number;      // 0–12
    stepCount?: number;       // daily steps
    restingHR?: number;       // bpm
    hrv?: number;             // ms — heart rate variability
}

export interface SessionHistoryEntry {
    date: string;             // ISO date
    completed: boolean;
    painAfter?: number;       // 0–10
    effortAfter?: number;     // 0–10
    skipped?: boolean;
}

export interface SafetyFlag {
    code: string;             // e.g., 'ACUTE_INJURY', 'POST_SURGERY_7D', 'RED_FLAG_NEURO'
    severity: 'mild' | 'moderate' | 'critical';
    description: string;
}

/** Full input to the Adaptive Protocol Engine */
export interface EngineInput {
    // User-reported session data
    pain: number;             // 0–10
    stiffness: number;        // 0–10
    fatigue: number;          // 0–10
    readiness: number;        // 0–10 (confidence / motivation)

    // System metrics
    weeklyAdherence: number;  // 0–100 (%)
    painTrend: number[];      // last 7 days pain scores, oldest first
    recentSessions: SessionHistoryEntry[];

    // Clinical context
    conditionId: string;      // e.g., 'lumbar_disc', 'knee_oa', 'shoulder_impingement'
    currentPhase: Phase;      // current phase before engine evaluates

    // Safety
    safetyFlags: SafetyFlag[];

    // Optional biometrics
    healthData?: HealthData;
}

// ── Core Enums ────────────────────────────────────────────────────────────────

export type SystemState = 'aligned' | 'compensating' | 'risk';

/**
 * Clinical progression phases:
 * return → regulate → load → adapt → become
 */
export type Phase = 'return' | 'regulate' | 'load' | 'adapt' | 'become';

export type ProgressionDecision = 'progress' | 'hold' | 'regress';

export type ProtocolType = 'recovery' | 'mobility' | 'activation' | 'strength' | 'mixed';

export type LoadModifier = 'reduce' | 'maintain' | 'increase';

// ── Blocks & Exercises ─────────────────────────────────────────────────────────

export type BlockGroup = 'Recovery' | 'Mobility' | 'Activation' | 'Strength';

export interface ExerciseSlot {
    pattern: string;          // e.g., 'cat_cow', 'hip_hinge'
    setsOverride?: number;
    repsOverride?: string;    // e.g., '8–12'
    restOverride?: number;    // seconds
}

export interface EngineBlock {
    group: BlockGroup;
    exercises: ExerciseSlot[];
    loadModifier: LoadModifier;
    rationale: string;        // audit trail — why this block was selected
}

// ── Output ────────────────────────────────────────────────────────────────────

export interface EngineOutput {
    systemState: SystemState;
    phase: Phase;
    readinessScore: number;        // 0–100
    progressionDecision: ProgressionDecision;
    protocolType: ProtocolType;
    sessionGoal: string;
    adaptiveMessage: string;
    blocks: EngineBlock[];
    safetyBlocked: boolean;
    audit: AuditTrail;
}

// ── Audit Trail ───────────────────────────────────────────────────────────────

/** Every decision module logs its reasoning for clinical auditability */
export interface AuditTrail {
    stateReason: string;
    readinessFactors: string[];
    progressionReason: string;
    protocolReason: string;
    loadReason: string;
    safetyNotes: string[];
    timestamp: string;
}
