import { useState } from 'react';
import styles from './EngineAuditPanel.module.css';
import type { EngineInput, EngineOutput } from '../../engine/adaptiveProtocolEngine';

interface Props {
    input: EngineInput;
    output: EngineOutput;
}

function Row({ label, value, mono = true }: { label: string; value: string | number; mono?: boolean }) {
    return (
        <div className={styles.row}>
            <span className={styles.rowLabel}>{label}</span>
            <span className={`${styles.rowValue} ${mono ? styles.mono : ''}`}>{value}</span>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className={styles.section}>
            <span className={styles.sectionTitle}>{title}</span>
            {children}
        </div>
    );
}

export function EngineAuditPanel({ input, output }: Props) {
    const [open, setOpen] = useState(false);

    const stateColors: Record<string, string> = {
        aligned: '#4CAF7D',
        compensating: '#F5A623',
        risk: '#F05A67',
    };

    const decisionColors: Record<string, string> = {
        progress: '#4CAF7D',
        hold: '#F5A623',
        regress: '#F05A67',
    };

    return (
        <div className={styles.panel}>
            <button className={styles.toggle} onClick={() => setOpen(o => !o)}>
                <span className={styles.toggleLabel}>
                    <span className={styles.dot} style={{ background: stateColors[output.systemState] }} />
                    ENGINE AUDIT
                </span>
                <span className={styles.toggleChevron}>{open ? '▲' : '▼'}</span>
            </button>

            {open && (
                <div className={styles.body}>
                    {/* Summary badges */}
                    <div className={styles.badges}>
                        <span className={styles.badge} style={{ color: stateColors[output.systemState], borderColor: stateColors[output.systemState] + '40' }}>
                            {output.systemState.toUpperCase()}
                        </span>
                        <span className={styles.badge} style={{ color: '#aaa', borderColor: '#333' }}>
                            PHASE: {output.phase.toUpperCase()}
                        </span>
                        <span className={styles.badge} style={{ color: decisionColors[output.progressionDecision], borderColor: decisionColors[output.progressionDecision] + '40' }}>
                            {output.progressionDecision.toUpperCase()}
                        </span>
                        <span className={styles.badge} style={{ color: '#aaa', borderColor: '#333' }}>
                            {output.protocolType.toUpperCase()}
                        </span>
                    </div>

                    {/* Engine Inputs */}
                    <Section title="INPUTS">
                        <Row label="Pain" value={`${input.pain}/10`} />
                        <Row label="Stiffness" value={`${input.stiffness}/10`} />
                        <Row label="Fatigue" value={`${input.fatigue}/10`} />
                        <Row label="Readiness" value={`${input.readiness}/10`} />
                        <Row label="Adherence" value={`${input.weeklyAdherence}%`} />
                        <Row label="Condition" value={input.conditionId} />
                        <Row label="Current Phase" value={input.currentPhase} />
                        <Row label="Safety Flags" value={input.safetyFlags.length === 0 ? 'None' : input.safetyFlags.map(f => f.code).join(', ')} />
                    </Section>

                    {/* State */}
                    <Section title="STATE INTERPRETER">
                        <Row label="System State" value={output.systemState} />
                        <Row label="Reason" value={output.audit.stateReason} mono={false} />
                    </Section>

                    {/* Readiness */}
                    <Section title="READINESS SCORER">
                        <Row label="Score" value={`${output.readinessScore}/100`} />
                        {output.audit.readinessFactors.map((f, i) => (
                            <Row key={i} label={`Factor ${i + 1}`} value={f} mono={false} />
                        ))}
                    </Section>

                    {/* Progression */}
                    <Section title="PROGRESSION LOGIC">
                        <Row label="Decision" value={output.progressionDecision} />
                        <Row label="Target Phase" value={output.phase} />
                        <Row label="Reason" value={output.audit.progressionReason} mono={false} />
                    </Section>

                    {/* Protocol */}
                    <Section title="PROTOCOL SELECTOR">
                        <Row label="Protocol" value={output.protocolType} />
                        <Row label="Session Goal" value={output.sessionGoal} mono={false} />
                        <Row label="Reason" value={output.audit.protocolReason} mono={false} />
                    </Section>

                    {/* Load */}
                    <Section title="LOAD REGULATOR">
                        <Row label="Load Reason" value={output.audit.loadReason} mono={false} />
                    </Section>

                    {/* Blocks */}
                    <Section title="BLOCKS">
                        {output.blocks.map((b, i) => (
                            <Row
                                key={i}
                                label={b.group}
                                value={`${b.exercises.length} exercises · ${b.loadModifier.toUpperCase()}`}
                            />
                        ))}
                        {output.blocks.length === 0 && <Row label="Blocks" value="None — session blocked" />}
                    </Section>

                    {/* Safety */}
                    <Section title="SAFETY GUARD">
                        <Row label="Blocked" value={output.safetyBlocked ? '⛔ YES' : '✅ NO'} />
                        {output.audit.safetyNotes.map((n, i) => (
                            <Row key={i} label={`Note ${i + 1}`} value={n} mono={false} />
                        ))}
                    </Section>

                    {/* Timestamp */}
                    <div className={styles.timestamp}>
                        Generated: {new Date(output.audit.timestamp).toLocaleTimeString()}
                    </div>
                </div>
            )}
        </div>
    );
}
