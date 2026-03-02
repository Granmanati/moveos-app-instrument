import styles from './AuthPage.module.css';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

export default function AuthPage() {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Redirige al frontend tras autorizar
                redirectTo: window.location.origin + '/',
            }
        });

        if (error) {
            console.error('Error logging in:', error.message);
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.logo}>M</div>
            <h1 className={styles.title}>MOVE OS</h1>
            <p className={styles.subtitle}>Sistema clínico adaptativo para gestión de movimiento.</p>

            <div className={styles.authBox}>
                <button
                    className={styles.googleBtn}
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>autorenew</span>
                    ) : (
                        <>
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className={styles.googleIcon} />
                            Continue with Google
                        </>
                    )}
                </button>
            </div>

            <p className={styles.disclaimer}>
                A system by FisiovanguardIA
            </p>
        </div>
    );
}
