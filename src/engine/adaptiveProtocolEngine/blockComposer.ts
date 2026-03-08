// =============================================================================
// Module 7: Block Composer
// Builds exercise blocks from protocolType + condition + safety constraints.
// Returns ordered EngineBlock[] ready for the Execution Engine.
// =============================================================================

import type { BlockGroup, EngineBlock, ExerciseSlot, LoadModifier, ProtocolType } from './types';
import type { LoadProfile } from './loadRegulator';

// ── Exercise Library (condition-agnostic patterns) ────────────────────────────
// These are logical slots — the Execution Engine maps them to real DB exercises.

const RECOVERY_EXERCISES: ExerciseSlot[] = [
    { pattern: 'diaphragmatic_breathing', setsOverride: 3, repsOverride: '10 breaths', restOverride: 30 },
    { pattern: 'supine_twist', setsOverride: 2, repsOverride: '30 sec/side', restOverride: 20 },
    { pattern: 'cat_cow', setsOverride: 3, repsOverride: '10', restOverride: 20 },
    { pattern: 'legs_up_wall', setsOverride: 1, repsOverride: '3 min', restOverride: 0 },
];

const MOBILITY_EXERCISES: ExerciseSlot[] = [
    { pattern: 'hip_90_90', setsOverride: 3, repsOverride: '45 sec/side' },
    { pattern: 'thread_the_needle', setsOverride: 3, repsOverride: '8/side' },
    { pattern: 'worlds_greatest_stretch', setsOverride: 2, repsOverride: '5/side' },
    { pattern: 'ankle_mobility', setsOverride: 3, repsOverride: '10 circles/side' },
    { pattern: 'thoracic_rotation', setsOverride: 3, repsOverride: '10/side' },
];

const ACTIVATION_EXERCISES: ExerciseSlot[] = [
    { pattern: 'dead_bug', setsOverride: 3, repsOverride: '8/side' },
    { pattern: 'bird_dog', setsOverride: 3, repsOverride: '8/side' },
    { pattern: 'glute_bridge', setsOverride: 3, repsOverride: '12' },
    { pattern: 'plank', setsOverride: 3, repsOverride: '30 sec' },
    { pattern: 'side_lying_abduction', setsOverride: 3, repsOverride: '12/side' },
];

const STRENGTH_EXERCISES: ExerciseSlot[] = [
    { pattern: 'goblet_squat', setsOverride: 4, repsOverride: '8–12' },
    { pattern: 'hip_hinge', setsOverride: 4, repsOverride: '8–10' },
    { pattern: 'push_up', setsOverride: 3, repsOverride: '8–15' },
    { pattern: 'row', setsOverride: 4, repsOverride: '8–12' },
    { pattern: 'farmers_carry', setsOverride: 3, repsOverride: '30 sec' },
];

// ── Block configurations per protocol type ─────────────────────────────────

type BlockConfig = { group: BlockGroup; exercises: ExerciseSlot[]; count: number }[];

const PROTOCOL_BLOCKS: Record<ProtocolType, BlockConfig> = {
    recovery: [
        { group: 'Recovery', exercises: RECOVERY_EXERCISES, count: 4 },
        { group: 'Mobility', exercises: MOBILITY_EXERCISES, count: 2 },
    ],
    mobility: [
        { group: 'Recovery', exercises: RECOVERY_EXERCISES, count: 2 },
        { group: 'Mobility', exercises: MOBILITY_EXERCISES, count: 4 },
        { group: 'Activation', exercises: ACTIVATION_EXERCISES, count: 2 },
    ],
    activation: [
        { group: 'Recovery', exercises: RECOVERY_EXERCISES, count: 1 },
        { group: 'Mobility', exercises: MOBILITY_EXERCISES, count: 2 },
        { group: 'Activation', exercises: ACTIVATION_EXERCISES, count: 4 },
    ],
    strength: [
        { group: 'Mobility', exercises: MOBILITY_EXERCISES, count: 2 },
        { group: 'Activation', exercises: ACTIVATION_EXERCISES, count: 2 },
        { group: 'Strength', exercises: STRENGTH_EXERCISES, count: 4 },
    ],
    mixed: [
        { group: 'Recovery', exercises: RECOVERY_EXERCISES, count: 1 },
        { group: 'Mobility', exercises: MOBILITY_EXERCISES, count: 2 },
        { group: 'Activation', exercises: ACTIVATION_EXERCISES, count: 2 },
        { group: 'Strength', exercises: STRENGTH_EXERCISES, count: 2 },
    ],
};

// ── Rationale strings ─────────────────────────────────────────────────────────

const GROUP_RATIONALE: Record<BlockGroup, string> = {
    Recovery: 'Neural calming and tissue preparation before movement',
    Mobility: 'Restore range of motion and reduce mechanical restriction',
    Activation: 'Reestablish motor control and stabilizer recruitment',
    Strength: 'Progressive loading for structural adaptation',
};

// ── Composer ──────────────────────────────────────────────────────────────────

export function composeBlocks(
    protocolType: ProtocolType,
    loadProfile: LoadProfile,
    allowedPatterns: string[] | null,
): EngineBlock[] {
    const config = PROTOCOL_BLOCKS[protocolType];

    return config.map(({ group, exercises, count }) => {
        let slots = exercises.slice(0, count);

        // Apply safety pattern filter
        if (allowedPatterns !== null) {
            slots = slots.filter(s => allowedPatterns.some(p => s.pattern.includes(p)));
        }

        // Apply load adjustments to each slot
        const adjusted: ExerciseSlot[] = slots.map(slot => {
            const sets = slot.setsOverride !== undefined
                ? Math.max(1, slot.setsOverride + loadProfile.setsAdjustment)
                : undefined;

            const rest = slot.restOverride !== undefined
                ? Math.max(0, slot.restOverride + loadProfile.restExtension)
                : undefined;

            return { ...slot, setsOverride: sets, restOverride: rest };
        });

        const modifier: LoadModifier = loadProfile.modifier;

        return {
            group,
            exercises: adjusted,
            loadModifier: modifier,
            rationale: GROUP_RATIONALE[group],
        };
    }).filter(block => block.exercises.length > 0);
}
