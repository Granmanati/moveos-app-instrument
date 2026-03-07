import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from '../components/Icon';
import styles from './OnboardingPage.module.css';

// Local storage key for persistence
const ONBOARDING_STATE_KEY = 'moveos:onboarding:v3';

export default function OnboardingPage() {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showPaywall, setShowPaywall] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');

    const [formData, setFormData] = useState({
        full_name: '',
        primary_objective: '',
        pain_current: 0,
        primary_area: 'none',
        injury_history: '',
        pain_7d_avg: 0,
        training_freq: 3,
        activity_level: 'recreational',
        sleep_avg: 7,
        stress_level: 3,
        pattern_squat: 'moderate',
        pattern_hinge: 'moderate',
        pattern_push: 'moderate',
        pattern_pull: 'moderate',
        pattern_carry: 'moderate',
        red_flag_night_pain: false,
        red_flag_neuro: false,
        red_flag_trauma: false,
        wearable_type: ''
    });

    // Load persisted state on mount
    useEffect(() => {
        const saved = localStorage.getItem(ONBOARDING_STATE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.step) setStep(parsed.step);
                if (parsed.formData) setFormData(parsed.formData);
            } catch (e) {
                console.error('Failed to parse onboarding state', e);
            }
        }
    }, []);

    // Save state on change
    useEffect(() => {
        if (step <= 6) {
            localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify({ step, formData }));
        }
    }, [step, formData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSelect = (name: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        setErrorMsg('');
        if (step === 1) {
            if (!formData.full_name.trim()) {
                setErrorMsg('Please enter your full name to initialize.');
                return;
            }
            if (!formData.primary_objective) {
                setErrorMsg('Please select a primary objective.');
                return;
            }
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const calculatePhase = () => {
        const p = Number(formData.pain_current);
        const hasRedFlags = formData.red_flag_night_pain || formData.red_flag_neuro || formData.red_flag_trauma;

        const lowCount = [
            formData.pattern_squat,
            formData.pattern_hinge,
            formData.pattern_push,
            formData.pattern_pull,
            formData.pattern_carry
        ].filter(v => v === 'low').length;

        if (p >= 6 || hasRedFlags) return 'return';
        if ((p >= 3 && p <= 5) || Number(formData.training_freq) <= 2 || lowCount >= 3) return 'regulate';
        return 'load';
    };

    const assignedPhase = calculatePhase();

    const getPainText = (val: number) => {
        if (val <= 2) return "Low inflammatory state";
        if (val <= 5) return "Moderate tissue irritability";
        return "High nociceptive activity";
    };

    const handleWearableSync = (type: string) => {
        setFormData(prev => ({ ...prev, wearable_type: type }));
    };

    const handleGenerateSession = async () => {
        if (!user) return;
        setLoading(true);
        setErrorMsg('');

        try {
            // 1. Log Onboarding Event
            await supabase.from('onboarding_events').insert({
                user_id: user.id,
                step: 6,
                event: 'system_calibrated',
                payload: { ...formData, assigned_phase: assignedPhase }
            });

            // 2. Update user_profile with all the new fields
            const { error: profileError } = await supabase
                .from('user_profile')
                .update({
                    onboarding_completed: true,
                    onboarding_version: 'v3',
                    full_name: formData.full_name,
                    primary_objective: formData.primary_objective,
                    primary_area: formData.primary_area,
                    pain_current: Number(formData.pain_current),
                    pain_7d_avg: Number(formData.pain_7d_avg),
                    training_freq: Number(formData.training_freq),
                    activity_level: formData.activity_level,
                    sleep_avg: Number(formData.sleep_avg),
                    stress_level: Number(formData.stress_level),
                    pattern_squat: formData.pattern_squat,
                    pattern_hinge: formData.pattern_hinge,
                    pattern_push: formData.pattern_push,
                    pattern_pull: formData.pattern_pull,
                    pattern_carry: formData.pattern_carry,
                    red_flag_night_pain: formData.red_flag_night_pain,
                    red_flag_neuro: formData.red_flag_neuro,
                    red_flag_trauma: formData.red_flag_trauma,
                    assigned_phase: assignedPhase,
                    current_phase: assignedPhase // Fallback for existing logic
                })
                .eq('user_id', user.id);

            if (profileError) {
                // Ignore column not found errors if migration hasn't applied to cache
                console.warn("Profile update parsing error, may be missing columns", profileError);
            }

            // 3. Try generate session directly
            const { error: genError } = await supabase.rpc('generate_session');
            if (genError) console.warn("Session generation explicit error:", genError);

            // 4. Show Paywall Gate instead of navigating immediately
            setShowPaywall(true);
            setLoading(false);

        } catch (err: any) {
            setErrorMsg(err.message || 'System error. Please try again.');
            setLoading(false);
        }
    };

    const handleStartTrial = async () => {
        setLoading(true);
        try {
            if (user) {
                await supabase.from('subscription_status')
                    .upsert({ user_id: user.id, tier: 'premium', status: 'trialing' });
            }
            await refreshProfile();
            localStorage.removeItem(ONBOARDING_STATE_KEY);
            navigate('/mission', { state: { isNewOnboarding: true } });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleNotNow = async () => {
        setLoading(true);
        try {
            if (user) {
                await supabase.from('subscription_status')
                    .upsert({ user_id: user.id, tier: 'free', status: 'active' });
            }
            await refreshProfile();
            localStorage.removeItem(ONBOARDING_STATE_KEY);
            navigate('/mission', { state: { isNewOnboarding: true } });
        } catch (e) {
            console.error(e);
        } finally {
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
            color: 'var(--accent)',
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

    if (showPaywall) {
        return (
            <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className={styles.paywallOverlay}>
                    <div className={styles.paywallContent}>
                        <div className={styles.paywallHeader}>
                            <Icon name="workspace_premium" size={48} active={true} style={{ marginBottom: 16 }} />
                            <h2>Unlock Your Engine</h2>
                            <p>Get full access to the adaptive clinical library and personalized execution tracking.</p>
                        </div>

                        <div className={styles.billingToggle}>
                            <button
                                className={`${styles.toggleBtn} ${billingCycle === 'monthly' ? styles.toggleActive : ''}`}
                                onClick={() => setBillingCycle('monthly')}
                            >
                                Monthly
                            </button>
                            <button
                                className={`${styles.toggleBtn} ${billingCycle === 'annually' ? styles.toggleActive : ''}`}
                                onClick={() => setBillingCycle('annually')}
                            >
                                Annually <span className={styles.saveBadge}>Best Value</span>
                            </button>
                        </div>

                        <div className={styles.paywallPriceBox}>
                            <span className={styles.priceLabel}>{billingCycle === 'annually' ? 'Billed annually at $180' : 'Billed monthly'}</span>
                            <div className={styles.priceAmount}>
                                {billingCycle === 'annually' ? '$15' : '$25'}<span>/mo</span>
                            </div>
                            <div className={styles.trialPill}>Includes 7-day free trial</div>
                        </div>

                        <div className={styles.paywallActions}>
                            <button className={styles.primaryBtn} onClick={handleStartTrial} disabled={loading}>
                                {loading ? 'Initializing...' : 'Start 7-day trial'}
                            </button>
                            <button className={styles.secondaryBtn} onClick={handleNotNow} disabled={loading}>
                                Not now, continue to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const hasRedFlags = formData.red_flag_night_pain || formData.red_flag_neuro || formData.red_flag_trauma;

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                {step > 1 && step <= 6 ? (
                    <button className={styles.backBtn} onClick={handleBack}>
                        <Icon name="arrow_left" />
                    </button>
                ) : (
                    <div className={styles.backSpace} />
                )}

                <div className={styles.progressContainer}>
                    <div className={styles.progressText}>STEP {step} OF 6</div>
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

                {/* Step 1: System Initialization */}
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
                                    { id: 'build_capacity', title: 'Build Capacity' }
                                ].map(goal => (
                                    <button
                                        key={goal.id}
                                        className={`${styles.selectCard} ${formData.primary_objective === goal.id ? styles.selectedCard : ''}`}
                                        onClick={() => handleSelect('primary_objective', goal.id)}
                                    >
                                        {goal.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Current Load & Pain Status */}
                {step === 2 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>Current Load & Pain Status</h1>
                        <p className={styles.subtitle}>Quantify your musculoskeletal system's irritability.</p>

                        <div className={styles.formGroup}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className={styles.label}>Current Pain Level ({formData.pain_current}/10)</label>
                                <span className={styles.dynamicLabel} style={{ color: Number(formData.pain_current) >= 6 ? 'var(--state-alert)' : Number(formData.pain_current) >= 3 ? 'var(--state-warning)' : 'var(--accent)' }}>
                                    {getPainText(Number(formData.pain_current))}
                                </span>
                            </div>
                            <input type="range" name="pain_current" min="0" max="10" value={formData.pain_current} onChange={handleChange} className={styles.rangeInput} />
                            <div className={styles.rangeLabels}><span>No pain</span><span>Moderate</span><span>Severe</span></div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>7-Day Pain Average ({formData.pain_7d_avg}/10)</label>
                            <input type="range" name="pain_7d_avg" min="0" max="10" value={formData.pain_7d_avg} onChange={handleChange} className={styles.rangeInput} />
                            <div className={styles.rangeLabels}><span>No pain</span><span>Moderate</span><span>Severe</span></div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Primary Affected Area</label>
                            <select name="primary_area" value={formData.primary_area} onChange={handleChange} className={styles.input}>
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

                {/* Step 3: Baseline Capacity */}
                {step === 3 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>Baseline Capacity</h1>
                        <p className={styles.subtitle}>Provide your recovery and activity metrics.</p>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Activity Level</label>
                            <div className={styles.cardsGrid}>
                                {[
                                    { id: 'sedentary', title: 'Sedentary' },
                                    { id: 'recreational', title: 'Recreational' },
                                    { id: 'athlete', title: 'Athlete/High' }
                                ].map(lvl => (
                                    <button
                                        key={lvl.id}
                                        className={`${styles.selectCard} ${formData.activity_level === lvl.id ? styles.selectedCard : ''}`}
                                        onClick={() => handleSelect('activity_level', lvl.id)}
                                    >
                                        {lvl.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Weekly Training Freq. ({formData.training_freq}x)</label>
                            <input type="range" name="training_freq" min="0" max="7" value={formData.training_freq} onChange={handleChange} className={styles.rangeInput} />
                            <div className={styles.rangeLabels}><span>0x</span><span>7x</span></div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Average Sleep ({formData.sleep_avg}h)</label>
                            <input type="range" name="sleep_avg" min="4" max="10" step="0.5" value={formData.sleep_avg} onChange={handleChange} className={styles.rangeInput} />
                            <div className={styles.rangeLabels}><span>4h</span><span>10h+</span></div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Perceived Stress (Lv. {formData.stress_level})</label>
                            <input type="range" name="stress_level" min="1" max="5" value={formData.stress_level} onChange={handleChange} className={styles.rangeInput} />
                            <div className={styles.rangeLabels}><span>Low</span><span>Optimal</span><span>High</span></div>
                        </div>
                    </div>
                )}

                {/* Step 4: Pattern Control Assessment */}
                {step === 4 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>Pattern Control Assessment</h1>
                        <p className={styles.subtitle}>Self-assess your movement competency without pain.</p>

                        {[
                            { id: 'pattern_squat', label: 'Squat Control' },
                            { id: 'pattern_hinge', label: 'Hinge Control' },
                            { id: 'pattern_push', label: 'Push Tolerance' },
                            { id: 'pattern_pull', label: 'Pull Tolerance' },
                            { id: 'pattern_carry', label: 'Carry Tolerance' }
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

                {/* Step 5: Safety & Constraints */}
                {step === 5 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>Safety & Constraints</h1>
                        <p className={styles.subtitle}>Identify any potential medical red flags.</p>

                        <div className={styles.formGroup} style={{ gap: '16px', marginTop: '16px' }}>
                            <label className={styles.toggleRow}>
                                <div className={styles.toggleText}>
                                    <span>Severe Night Pain</span>
                                    <small>Pain that wakes you up and cannot be relieved.</small>
                                </div>
                                <input type="checkbox" className={styles.toggleCheckbox} name="red_flag_night_pain" checked={formData.red_flag_night_pain} onChange={handleChange} />
                            </label>

                            <label className={styles.toggleRow}>
                                <div className={styles.toggleText}>
                                    <span>Neurological Symptoms</span>
                                    <small>Numbness, tingling, or sudden weakness in limbs.</small>
                                </div>
                                <input type="checkbox" className={styles.toggleCheckbox} name="red_flag_neuro" checked={formData.red_flag_neuro} onChange={handleChange} />
                            </label>

                            <label className={styles.toggleRow}>
                                <div className={styles.toggleText}>
                                    <span>Recent Trauma or Fever</span>
                                    <small>Recent accidents or unexplained fever accompanying pain.</small>
                                </div>
                                <input type="checkbox" className={styles.toggleCheckbox} name="red_flag_trauma" checked={formData.red_flag_trauma} onChange={handleChange} />
                            </label>
                        </div>

                        {hasRedFlags && (
                            <div className={styles.systemAlert} style={{ marginTop: '24px' }}>
                                <Icon name="error" size={20} />
                                <span><strong>Clinical Callout:</strong> Your selections indicate potential medical red flags. MOVE OS is designed for musculoskeletal rehabilitation, but please consult a healthcare professional for a direct evaluation.</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 6: Wearable Sync */}
                {step === 6 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>Wearable Sync</h1>
                        <p className={styles.subtitle}>Enhance calibration with real performance data.</p>

                        <div className={styles.wearableList}>
                            {[
                                { id: 'apple_health', title: 'Apple Health', icon: 'healing' },
                                { id: 'google_fit', title: 'Google Fit', icon: 'data_usage' },
                                { id: 'garmin', title: 'Garmin', icon: 'monitoring' }
                            ].map(w => (
                                <button
                                    key={w.id}
                                    className={`${styles.wearableBtn} ${formData.wearable_type === w.id ? styles.wearableActive : ''}`}
                                    onClick={() => handleWearableSync(w.id)}
                                >
                                    <Icon name={w.icon as any} />
                                    <span>Connect {w.title}</span>
                                    {formData.wearable_type === w.id && <Icon name="check_circle" size={18} active={true} style={{ marginLeft: 'auto' }} />}
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

                {/* System Calibrated */}
                {step === 7 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>System Calibrated</h1>
                        <p className={styles.subtitle}>Your biological parameters yield the following initial protocol.</p>

                        <div className={styles.phaseCard}>
                            <div className={styles.phaseHeader}>
                                <span className={styles.phaseLabel}>ASSIGNED PHASE</span>
                                <h2 className={styles.phaseTitle} style={{ color: phaseConfig[assignedPhase].color }}>
                                    {phaseConfig[assignedPhase].title}
                                </h2>
                            </div>
                            <ul className={styles.phaseBullets}>
                                {phaseConfig[assignedPhase].bullets.map((b: string, i: number) => (
                                    <li key={i}>
                                        <Icon name="check" size={16} />
                                        <span>{b}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.sysNote}>System Note: Clinical protocol v3.0 applied.</div>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.bottomBar}>
                {step <= 6 ? (
                    <button className={styles.primaryBtn} onClick={handleNext}>Continue</button>
                ) : (
                    <button className={styles.primaryBtn} onClick={handleGenerateSession} disabled={loading}>
                        {loading ? 'Initializing Engine...' : 'Generate First Session ⚡'}
                    </button>
                )}
            </div>
        </div>
    );
}
