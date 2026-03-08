// =============================================================================
// Module 4: Protocol Selector
// Maps systemState + targetPhase → protocolType + sessionGoal
// =============================================================================

import type { Phase, ProtocolType, SystemState } from './types';

export interface ProtocolSelection {
    protocolType: ProtocolType;
    sessionGoal: string;
    reason: string;
}

/**
 * Decision matrix: systemState × phase → protocolType
 *
 * ┌─────────────┬────────────┬───────────────────────────────────────────────┐
 * │ State       │ Phase      │ Protocol                                      │
 * ├─────────────┼────────────┼───────────────────────────────────────────────┤
 * │ risk        │ *          │ recovery                                      │
 * │ compensating│ return     │ recovery                                      │
 * │ compensating│ regulate   │ mobility                                      │
 * │ compensating│ load/adapt │ activation                                    │
 * │ compensating│ become     │ mixed (limited load)                          │
 * │ aligned     │ return     │ mobility                                      │
 * │ aligned     │ regulate   │ activation                                    │
 * │ aligned     │ load       │ strength                                      │
 * │ aligned     │ adapt      │ mixed                                         │
 * │ aligned     │ become     │ strength                                      │
 * └─────────────┴────────────┴───────────────────────────────────────────────┘
 */
export function selectProtocol(systemState: SystemState, phase: Phase): ProtocolSelection {
    if (systemState === 'risk') {
        return {
            protocolType: 'recovery',
            sessionGoal: 'Restore baseline comfort. Zero loading. Focus on neural calming.',
            reason: `RISK state — recovery protocol enforced regardless of phase`,
        };
    }

    const map: Record<Phase, ProtocolSelection> = {
        return: systemState === 'compensating'
            ? { protocolType: 'recovery', sessionGoal: 'Reintroduce movement with minimal loading. Pain-free range priority.', reason: 'Compensating in return phase' }
            : { protocolType: 'mobility', sessionGoal: 'Restore full-range movement and deload sensitized tissue.', reason: 'Aligned in return phase' },

        regulate: systemState === 'compensating'
            ? { protocolType: 'mobility', sessionGoal: 'Maintain range without loading. Reduce pain sensitization.', reason: 'Compensating in regulate phase' }
            : { protocolType: 'activation', sessionGoal: 'Activate key stabilizers. Introduce controlled motor patterns.', reason: 'Aligned in regulate phase' },

        load: systemState === 'compensating'
            ? { protocolType: 'activation', sessionGoal: 'Reinforce activation patterns under low load. Block strength work.', reason: 'Compensating in load phase' }
            : { protocolType: 'strength', sessionGoal: 'Progressively load primary movers. Stimulus for structural adaptation.', reason: 'Aligned in load phase' },

        adapt: systemState === 'compensating'
            ? { protocolType: 'mixed', sessionGoal: 'Maintain conditioning with reduced strength component.', reason: 'Compensating in adapt phase' }
            : { protocolType: 'mixed', sessionGoal: 'Integrate all movement qualities — strength, mobility, and endurance.', reason: 'Aligned in adapt phase' },

        become: systemState === 'compensating'
            ? { protocolType: 'mixed', sessionGoal: 'Functional maintenance with conservative loading.', reason: 'Compensating in become phase' }
            : { protocolType: 'strength', sessionGoal: 'Peak adaptive potential. Full conditioning protocol.', reason: 'Aligned in become phase' },
    };

    return map[phase];
}
