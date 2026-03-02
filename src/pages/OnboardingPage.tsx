import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import styles from './OnboardingPage.module.css';

export default function OnboardingPage() {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState({
        pain_now: 0,
        injury_history: '',
        activity_level: 'low',
        primary_goal: '',
        squat_control: 'moderate',
        hinge_control: 'moderate',
        push_tolerance: 'moderate',
        pull_tolerance: 'moderate',
        carry_tolerance: 'moderate',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setErrorMsg('');

        try {
            // 1) Insert in evaluations
            const { data: evalData, error: evalError } = await supabase
                .from('evaluations')
                .insert({
                    user_id: user.id,
                    pain_now: Number(formData.pain_now),
                    injury_history: formData.injury_history,
                    activity_level: formData.activity_level,
                    primary_goal: formData.primary_goal,
                    squat_control: formData.squat_control,
                    hinge_control: formData.hinge_control,
                    push_tolerance: formData.push_tolerance,
                    pull_tolerance: formData.pull_tolerance,
                    carry_tolerance: formData.carry_tolerance,
                })
                .select('id')
                .single();

            if (evalError) throw evalError;

            const evalId = evalData.id;
            let phase = 'regulate'; // baseline

            // 2) Try RPC assign_phase
            const { data: phaseData, error: rpcError } = await supabase.rpc('assign_phase', { eval_id: evalId });

            if (!rpcError && phaseData) {
                phase = phaseData;
            } else {
                // Fallback logic
                const p = Number(formData.pain_now);
                if (p >= 7) phase = 'return';
                else if (p >= 4) phase = 'regulate';
                else phase = 'load';
            }

            // 3) Update user_profile
            const { error: profileError } = await supabase
                .from('user_profile')
                .update({
                    onboarding_completed: true,
                    current_phase: phase
                })
                .eq('user_id', user.id);

            if (profileError) throw profileError;

            // Finish: refresh globally & redirect
            await refreshProfile();
            navigate('/');

        } catch (err: any) {
            setErrorMsg(err.message || 'Error guardando evaluación. Intenta de nuevo.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Evaluación Inicial</h1>
                <p className={styles.subtitle}>Para parametrizar tu sistema, necesitamos conocer tu estado actual de movimiento y tolerancia.</p>
            </header>

            <form className={styles.form} onSubmit={handleSubmit}>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Nivel de dolor actual (0-10)</label>
                    <div className={styles.rangeWrap}>
                        <input
                            type="range"
                            name="pain_now"
                            min="0"
                            max="10"
                            value={formData.pain_now}
                            onChange={handleChange}
                            className={styles.rangeInput}
                        />
                        <span className={styles.rangeValue}>{formData.pain_now}</span>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Historial de lesiones (opcional)</label>
                    <input
                        type="text"
                        name="injury_history"
                        value={formData.injury_history}
                        onChange={handleChange}
                        placeholder="Ej: esguince de tobillo derecho"
                        className={styles.input}
                    />
                </div>

                <div className={styles.gridOptions}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nivel de Actividad</label>
                        <select name="activity_level" value={formData.activity_level} onChange={handleChange} className={styles.select}>
                            <option value="low">Bajo</option>
                            <option value="moderate">Moderado</option>
                            <option value="high">Alto</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Control de Squat</label>
                        <select name="squat_control" value={formData.squat_control} onChange={handleChange} className={styles.select}>
                            <option value="low">Bajo</option>
                            <option value="moderate">Moderado</option>
                            <option value="good">Bueno</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Control de Bisagra</label>
                        <select name="hinge_control" value={formData.hinge_control} onChange={handleChange} className={styles.select}>
                            <option value="low">Bajo</option>
                            <option value="moderate">Moderado</option>
                            <option value="good">Bueno</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Tolerancia Empuje</label>
                        <select name="push_tolerance" value={formData.push_tolerance} onChange={handleChange} className={styles.select}>
                            <option value="low">Bajo</option>
                            <option value="moderate">Moderado</option>
                            <option value="good">Bueno</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Tolerancia Tracción</label>
                        <select name="pull_tolerance" value={formData.pull_tolerance} onChange={handleChange} className={styles.select}>
                            <option value="low">Bajo</option>
                            <option value="moderate">Moderado</option>
                            <option value="good">Bueno</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Tolerancia Carga</label>
                        <select name="carry_tolerance" value={formData.carry_tolerance} onChange={handleChange} className={styles.select}>
                            <option value="low">Bajo</option>
                            <option value="moderate">Moderado</option>
                            <option value="good">Bueno</option>
                        </select>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Objetivo Principal</label>
                    <input
                        type="text"
                        name="primary_goal"
                        value={formData.primary_goal}
                        onChange={handleChange}
                        placeholder="Ej: Volver a correr 10k"
                        className={styles.input}
                    />
                </div>

                {/* SystemCard output box */}
                {(loading || errorMsg) && (
                    <div className={styles.sysCard}>
                        {loading && !errorMsg ? (
                            <>
                                <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }}>autorenew</span>
                                <span className={styles.sysTitle}>Procesando evaluación</span>
                                <span className={styles.sysDesc}>Calculando tu fase inicial...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined" style={{ color: 'var(--warning)' }}>error</span>
                                <span className={styles.sysTitle}>Incidencia del sistema</span>
                                <span className={styles.errorText}>{errorMsg}</span>
                            </>
                        )}
                    </div>
                )}

                <button type="submit" className={styles.primaryBtn} disabled={loading}>
                    {loading ? 'Calculando matriz...' : 'Completar Onboarding'}
                </button>
            </form>
        </div>
    );
}
