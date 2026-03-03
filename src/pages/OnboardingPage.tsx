import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from '../components/Icon';
import styles from './OnboardingPage.module.css';

export default function OnboardingPage() {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState({
        full_name: '',
        primary_goal: '',
        height_cm: '',
        weight_kg: '',
        weekly_training_freq: 3,
        sleep_hours: 7,
        stress_level: 3,
        pain_now: 0,
        pain_avg_7d: 0,
        primary_affected_area: 'none',
        injury_history: '',
        squat_control: 'moderate',
        hinge_control: 'moderate',
        push_tolerance: 'moderate',
        pull_tolerance: 'moderate',
        carry_tolerance: 'moderate',
        wearable_type: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelect = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        setErrorMsg('');
        if (step === 1) {
            if (!formData.full_name.trim()) {
                setErrorMsg('Please enter your full name to initialize.');
                return;
            }
            if (!formData.primary_goal) {
                setErrorMsg('Please select a primary objective.');
                return;
            }
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const assignedPhase = () => {
        const p = Number(formData.pain_now);
        const goodCount = [
            formData.squat_control,
            formData.hinge_control,
            formData.push_tolerance,
            formData.pull_tolerance,
            formData.carry_tolerance
        ].filter(v => v === 'good').length;

        if (p >= 6) return 'return';
        if (p >= 3 && p <= 5) return 'regulate';
        if (p <= 2 && goodCount >= 3) return 'load';
        return 'regulate';
    };

    const getPainText = (val: number) => {
        if (val <= 2) return "Low inflammatory state";
        if (val <= 5) return "Moderate tissue irritability";
        return "High nociceptive activity";
    };

    const handleWearableSync = (type: string) => {
        setFormData(prev => ({ ...prev, wearable_type: type }));
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        setErrorMsg('');

        try {
            const phase = assignedPhase();

            // 1) Insert in evaluations
            const { error: evalError } = await supabase
                .from('evaluations')
                .insert({
                    user_id: user.id,
                    pain_now: Number(formData.pain_now),
                    injury_history: formData.injury_history,
                    activity_level: formData.weekly_training_freq >= 4 ? 'high' : formData.weekly_training_freq <= 1 ? 'low' : 'moderate',
                    primary_goal: formData.primary_goal,
                    squat_control: formData.squat_control,
                    hinge_control: formData.hinge_control,
                    push_tolerance: formData.push_tolerance,
                    pull_tolerance: formData.pull_tolerance,
                    carry_tolerance: formData.carry_tolerance,
                });

            if (evalError) console.error("Eval Error:", evalError);

            // 2) Insert in biometrics (if filled)
            if (formData.height_cm || formData.weight_kg) {
                const { error: bioError } = await supabase
                    .from('biometrics')
                    .insert({
                        user_id: user.id,
                        height_cm: formData.height_cm ? Number(formData.height_cm) : null,
                        weight_kg: formData.weight_kg ? Number(formData.weight_kg) : null,
                        weekly_training_freq: Number(formData.weekly_training_freq),
                        sleep_hours: Number(formData.sleep_hours),
                        stress_level: Number(formData.stress_level),
                        wearable_type: formData.wearable_type || null,
                        wearable_connected: false
                    });
                if (bioError) console.error("Bio Error:", bioError);
            }

            // 3) Update user_profile
            const { error: profileError } = await supabase
                .from('user_profile')
                .update({
                    onboarding_completed: true,
                    current_phase: phase,
                    full_name: formData.full_name,
                    onboarding_version: 'v2.0'
                })
                .eq('user_id', user.id);

            if (profileError) throw profileError;

            // 4) Try generate session directly
            const { error: genError } = await supabase.rpc('generate_session');
            if (genError) console.warn("Session generation explicit error:", genError);

            await refreshProfile();
            navigate('/today', { state: { isNewOnboarding: true } });

        } catch (err: any) {
            setErrorMsg(err.message || 'System error. Please try again.');
            setLoading(false);
        }
    };

    const phaseConfig: Record<string, any> = {
        return: {
            title: 'RETURN',
            color: '#E74C3C',
            bullets: [
                'Focus on acute pain reduction',
                'Restore baseline active range of motion',
                'Isometrics and low-load tissue stimulation'
            ]
        },
        regulate: {
            title: 'REGULATE',
            color: '#2D7CFF',
            bullets: [
                'Build local tissue tolerance',
                'Repattern faulty movement mechanics',
                'Progressive concentric/eccentric loading'
            ]
        },
        load: {
            title: 'LOAD',
            color: '#2ECC71',
            bullets: [
                'Increase systemic load capacity',
                'Advanced compound movements',
                'Performance and resilience optimization'
            ]
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                {step > 1 && step <= 6 ? (
                    <button className={styles.backBtn} onClick={handleBack}>
                        <Icon name="arrow_back" />
                    </button>
                ) : (
                    <div className={styles.backSpace} />
                )}

                <div className={styles.progressContainer}>
                    <div className={styles.progressText}>STEP {step} OF 6</div>
                    <div className={styles.progressSubtitle}>Calibration {Math.round((step / 6) * 100)}%</div>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${(step / 6) * 100}%` }} />
                    </div>
                </div>

                <div className={styles.backSpace} />
            </div>

            <div className={styles.content}>
                {errorMsg && (
                    <div className={styles.systemAlert}>
                        <Icon name="info" size={16} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {step === 1 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>System Initialization</h1>
                        <p className={styles.subtitle}>Establish your biological baseline to calibrate the engine.</p>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Primary Objective</label>
                            <div className={styles.cardsGrid}>
                                {[
                                    { id: 'reduce_pain', title: 'Reduce Pain' },
                                    { id: 'restore_movement', title: 'Restore Movement' },
                                    { id: 'improve_performance', title: 'Improve Performance' },
                                    { id: 'build_load_capacity', title: 'Build Load Capacity' }
                                ].map(goal => (
                                    <button
                                        key={goal.id}
                                        className={`${styles.selectCard} ${formData.primary_goal === goal.id ? styles.selectedCard : ''}`}
                                        onClick={() => handleSelect('primary_goal', goal.id)}
                                    >
                                        {goal.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>Physiological Profile</h1>
                        <p className={styles.subtitle}>Provide key biological indicators (optional).</p>

                        <div className={styles.grid2}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Height (cm)</label>
                                <input type="number" name="height_cm" value={formData.height_cm} onChange={handleChange} className={styles.input} placeholder="e.g. 180" />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Weight (kg)</label>
                                <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleChange} className={styles.input} placeholder="e.g. 75" />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Weekly Training Freq. ({formData.weekly_training_freq}x)</label>
                            <input type="range" name="weekly_training_freq" min="0" max="7" value={formData.weekly_training_freq} onChange={handleChange} className={styles.rangeInput} />
                            <div className={styles.rangeLabels}><span>0x</span><span>7x</span></div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Average Sleep ({formData.sleep_hours}h)</label>
                            <input type="range" name="sleep_hours" min="4" max="10" step="0.5" value={formData.sleep_hours} onChange={handleChange} className={styles.rangeInput} />
                            <div className={styles.rangeLabels}><span>4h</span><span>10h+</span></div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Perceived Stress (Lv. {formData.stress_level})</label>
                            <input type="range" name="stress_level" min="1" max="5" value={formData.stress_level} onChange={handleChange} className={styles.rangeInput} />
                            <div className={styles.rangeLabels}><span>Low</span><span>Optimal</span><span>High</span></div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>Current Load & Pain Status</h1>
                        <p className={styles.subtitle}>Adjust initial load vectors.</p>

                        <div className={styles.formGroup}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className={styles.label}>Current Pain Level ({formData.pain_now}/10)</label>
                                <span className={styles.dynamicLabel} style={{ color: Number(formData.pain_now) >= 6 ? 'var(--danger)' : Number(formData.pain_now) >= 3 ? 'var(--warning)' : 'var(--accent)' }}>
                                    {getPainText(Number(formData.pain_now))}
                                </span>
                            </div>
                            <input type="range" name="pain_now" min="0" max="10" value={formData.pain_now} onChange={handleChange} className={styles.rangeInput} />
                            <div className={styles.rangeLabels}><span>No pain</span><span>Moderate</span><span>Severe</span></div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>7-Day Pain Average ({formData.pain_avg_7d}/10)</label>
                            <input type="range" name="pain_avg_7d" min="0" max="10" value={formData.pain_avg_7d} onChange={handleChange} className={styles.rangeInput} />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Primary Affected Area</label>
                            <select name="primary_affected_area" value={formData.primary_affected_area} onChange={handleChange} className={styles.input}>
                                <option value="none">None</option>
                                <option value="lumbar">Lumbar / Lower Back</option>
                                <option value="knee">Knee</option>
                                <option value="shoulder">Shoulder</option>
                                <option value="hip">Hip</option>
                                <option value="ankle">Ankle / Foot</option>
                                <option value="cervical">Cervical / Neck</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Injury History (Optional)</label>
                            <textarea
                                name="injury_history"
                                value={formData.injury_history}
                                onChange={handleChange}
                                placeholder="e.g., right ankle sprain 6 months ago"
                                className={styles.textarea}
                                rows={2}
                            />
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>Pattern Control Assessment</h1>
                        <p className={styles.subtitle}>Select perceived competency in primary patterns.</p>

                        {[
                            { id: 'squat_control', label: 'Squat Control' },
                            { id: 'hinge_control', label: 'Hinge Control' },
                            { id: 'push_tolerance', label: 'Push Tolerance' },
                            { id: 'pull_tolerance', label: 'Pull Tolerance' },
                            { id: 'carry_tolerance', label: 'Carry Tolerance' }
                        ].map(pattern => (
                            <div key={pattern.id} className={styles.formGroup}>
                                <label className={styles.label}>{pattern.label}</label>
                                <div className={styles.segmentControl}>
                                    {['low', 'moderate', 'good'].map(val => (
                                        <button
                                            key={val}
                                            className={`${styles.segmentBtn} ${(formData as any)[pattern.id] === val ? styles.segmentActive : ''}`}
                                            onClick={() => handleSelect(pattern.id, val)}
                                        >
                                            {val.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {step === 5 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>Wearable Sync</h1>
                        <p className={styles.subtitle}>Enhance calibration with real performance data.</p>

                        <div className={styles.wearableList}>
                            {[
                                { id: 'apple_health', title: 'Apple Health', icon: 'favorite' },
                                { id: 'google_fit', title: 'Google Fit', icon: 'monitor_heart' },
                                { id: 'garmin', title: 'Garmin', icon: 'watch' }
                            ].map(w => (
                                <button
                                    key={w.id}
                                    className={`${styles.wearableBtn} ${formData.wearable_type === w.id ? styles.wearableActive : ''}`}
                                    onClick={() => handleWearableSync(w.id)}
                                >
                                    <Icon name={w.icon} />
                                    <span>Connect {w.title}</span>
                                    {formData.wearable_type === w.id && <Icon name="check_circle" size={18} style={{ marginLeft: 'auto', color: 'var(--accent)' }} />}
                                </button>
                            ))}

                            {formData.wearable_type && formData.wearable_type !== 'skip' && (
                                <div className={styles.sysNote} style={{ marginTop: '8px', border: 'none' }}>
                                    Integration coming soon. Biometrics will be captured manually for now.
                                </div>
                            )}

                            <button
                                className={`${styles.wearableBtn} ${formData.wearable_type === 'skip' ? styles.wearableActive : ''}`}
                                style={{ marginTop: 'var(--sp-4)' }}
                                onClick={() => handleWearableSync('skip')}
                            >
                                <span>Skip for now</span>
                            </button>
                        </div>
                    </div>
                )}

                {step === 6 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>System Calibrated</h1>
                        <p className={styles.subtitle}>Your biological parameters yield the following initial protocol.</p>

                        <div className={styles.phaseCard}>
                            <div className={styles.phaseHeader}>
                                <span className={styles.phaseLabel}>ASSIGNED PHASE</span>
                                <h2 className={styles.phaseTitle} style={{ color: phaseConfig[assignedPhase()].color }}>
                                    {phaseConfig[assignedPhase()].title}
                                </h2>
                            </div>
                            <ul className={styles.phaseBullets}>
                                {phaseConfig[assignedPhase()].bullets.map((b: string, i: number) => (
                                    <li key={i}>
                                        <Icon name="check" size={16} />
                                        <span>{b}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.sysNote}>System Note: Clinical protocol v2.1 applied.</div>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.bottomBar}>
                {step < 6 ? (
                    <button className={styles.primaryBtn} onClick={handleNext}>Continue</button>
                ) : (
                    <button className={styles.primaryBtn} onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Initializing Engine...' : 'Generate First Session ⚡'}
                    </button>
                )}
            </div>
        </div>
    );
}
