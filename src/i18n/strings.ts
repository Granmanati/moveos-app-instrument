// MOVE OS — i18n strings
// EN = default | ES = Spanish

export type Lang = 'en' | 'es';

type Strings = {
    // Common
    moveOS: string;
    loading: string;
    error: string;
    back: string;
    continue: string;
    skip: string;
    save: string;
    cancel: string;
    logout: string;
    loggingOut: string;
    // Nav labels
    navHome: string;
    navToday: string;
    navExplore: string;
    navProgress: string;
    navProfile: string;
    navMission: string;
    navSystem: string;
    // Home
    homeGreeting: string;
    homePhase: string;
    homeSystemStatus: string;
    homeSessionReady: string;
    homeSessionCompleted: string;
    homeGenerateSession: string;
    homeOpenToday: string;
    homeViewProgress: string;
    homeConsistency: string;
    homeGenerating: string;
    homeCalibrating: string;
    // Today
    todayTitle: string;
    todayGenerated: string;
    todayCompleted: string;
    todayBlocksRemaining: string;
    todayCompleteSession: string;
    todayReportPain: string;
    todayPainLevel: string;
    todayNotes: string;
    todayLogPain: string;
    todaySaving: string;
    // Explore
    exploreTitle: string;
    exploreSearch: string;
    exploreSearchPlaceholder: string;
    exploreAll: string;
    exploreLockMessage: string;
    exploreUnlockCTA: string;
    exploreComingSoon: string;
    // Progress
    progressTitle: string;
    progress7d: string;
    progress30d: string;
    progressPainTrend: string;
    progressAdherence: string;
    progressAvgPain: string;
    progressSessions: string;
    progressAdherencePercent: string;
    progressNoData: string;
    progressLockedMessage: string;
    progressUnlockCTA: string;
    // Profile
    profileTitle: string;
    profileVersion: string;
    profileSessions: string;
    profileAdherence: string;
    profilePain: string;
    profileUnlockPremium: string;
    profileFeatureLibrary: string;
    profileFeatureEngine: string;
    profileFeatureInsights: string;
    profileStartTrial: string;
    profileViewPlans: string;
    profileSubscription: string;
    profileActive: string;
    profileTrialing: string;
    profileTrialDaysLeft: string;
    profileManageSubscription: string;
    profileSettings: string;
    profilePersonalData: string;
    profileNotifications: string;
    profileClinicalHistory: string;
    profilePrivacy: string;
    profileLanguage: string;
    // Onboarding
    onboardingStepOf: string;
    onboardingCalibration: string;
    onboardingStep1Title: string;
    onboardingStep1Subtitle: string;
    onboardingFullName: string;
    onboardingFullNamePlaceholder: string;
    onboardingPrimaryObjective: string;
    onboardingObj1: string;
    onboardingObj2: string;
    onboardingObj3: string;
    onboardingObj4: string;
    onboardingStep2Title: string;
    onboardingStep2Subtitle: string;
    onboardingPainCurrent: string;
    onboardingPain7d: string;
    onboardingPrimaryArea: string;
    onboardingAreaNone: string;
    onboardingAreaLumbar: string;
    onboardingAreaKnee: string;
    onboardingAreaShoulder: string;
    onboardingAreaHip: string;
    onboardingAreaAnkle: string;
    onboardingAreaCervical: string;
    onboardingInjuryHistory: string;
    onboardingInjuryPlaceholder: string;
    onboardingRedFlags: string;
    onboardingRedFlagNight: string;
    onboardingRedFlagNeuro: string;
    onboardingRedFlagTrauma: string;
    onboardingRedFlagCallout: string;
    onboardingStep3Title: string;
    onboardingStep3Subtitle: string;
    onboardingActivityLevel: string;
    onboardingActivitySedentary: string;
    onboardingActivityRec: string;
    onboardingActivityAthlete: string;
    onboardingTrainingFreq: string;
    onboardingSleep: string;
    onboardingStress: string;
    onboardingStressLow: string;
    onboardingStressOptimal: string;
    onboardingStressHigh: string;
    onboardingStep4Title: string;
    onboardingStep4Subtitle: string;
    onboardingPatternSquat: string;
    onboardingPatternHinge: string;
    onboardingPatternPush: string;
    onboardingPatternPull: string;
    onboardingPatternCarry: string;
    onboardingPatternLow: string;
    onboardingPatternModerate: string;
    onboardingPatternGood: string;
    onboardingStep5Title: string;
    onboardingStep5Subtitle: string;
    onboardingWearableComingSoon: string;
    onboardingStep6Title: string;
    onboardingStep6Subtitle: string;
    onboardingPhaseLabel: string;
    onboardingConfidence: string;
    onboardingSystemNote: string;
    onboardingGenerateSession: string;
    onboardingInitializing: string;
    // Paywall
    paywallTitle: string;
    paywallSubtitle: string;
    paywallMonthly: string;
    paywallAnnually: string;
    paywallBestValue: string;
    paywallBilledAnnually: string;
    paywallBilledMonthly: string;
    paywallTrialPill: string;
    paywallStartTrial: string;
    paywallNotNow: string;
    // Pain labels
    painLow: string;
    painModerate: string;
    painHigh: string;
    // Generic
    noPain: string;
    severe: string;
};

const en: Strings = {
    moveOS: 'MOVE OS',
    loading: 'Loading...',
    error: 'Error',
    back: 'Back',
    continue: 'Continue',
    skip: 'Skip',
    save: 'Save',
    cancel: 'Cancel',
    logout: 'Sign out',
    loggingOut: 'Signing out...',
    navHome: 'Home',
    navToday: 'Today',
    navExplore: 'Explore',
    navProgress: 'Progress',
    navProfile: 'Profile',
    navMission: 'Mission',
    navSystem: 'System',
    homeGreeting: 'Hello',
    homePhase: 'Phase',
    homeSystemStatus: 'System Status',
    homeSessionReady: 'Action Required',
    homeSessionCompleted: 'Completed',
    homeGenerateSession: "Generate Today's Session",
    homeOpenToday: 'Open Today',
    homeViewProgress: 'View Progress',
    homeConsistency: '7-Day Consistency',
    homeGenerating: 'Generating...',
    homeCalibrating: 'Calibrating system snapshot...',
    todayTitle: "Today's Session",
    todayGenerated: 'Generated',
    todayCompleted: 'Completed',
    todayBlocksRemaining: 'blocks remaining',
    todayCompleteSession: 'Complete Session',
    todayReportPain: 'Report pain',
    todayPainLevel: 'Pain level',
    todayNotes: 'Notes (optional)',
    todayLogPain: 'Log pain',
    todaySaving: 'Saving...',
    exploreTitle: 'Library',
    exploreSearch: 'Search',
    exploreSearchPlaceholder: 'Search exercises...',
    exploreAll: 'All',
    exploreLockMessage: 'Upgrade to Premium to unlock the full library',
    exploreUnlockCTA: 'Start 7-day trial',
    exploreComingSoon: 'Coming soon',
    progressTitle: 'Progress',
    progress7d: '7 Days',
    progress30d: '30 Days',
    progressPainTrend: 'Pain Trend',
    progressAdherence: 'Adherence',
    progressAvgPain: 'Avg Pain',
    progressSessions: 'Sessions',
    progressAdherencePercent: 'Adherence',
    progressNoData: 'No pain logs in selected period.',
    progressLockedMessage: 'Advanced charts available on Premium',
    progressUnlockCTA: 'Start 7-day trial',
    profileTitle: 'Profile',
    profileVersion: 'MOVE OS • v0.1.0',
    profileSessions: 'Sessions',
    profileAdherence: 'Adherence',
    profilePain: 'Avg Pain',
    profileUnlockPremium: 'Unlock Premium',
    profileFeatureLibrary: 'Full execution library',
    profileFeatureEngine: 'Adaptive clinical engine',
    profileFeatureInsights: 'Advanced insights',
    profileStartTrial: 'Start 7-day trial',
    profileViewPlans: 'View plans',
    profileSubscription: 'Subscription',
    profileActive: 'Active',
    profileTrialing: 'Trial',
    profileTrialDaysLeft: 'days left in trial',
    profileManageSubscription: 'Manage subscription',
    profileSettings: 'Settings',
    profilePersonalData: 'Personal data',
    profileNotifications: 'Notifications',
    profileClinicalHistory: 'Clinical history',
    profilePrivacy: 'Privacy & data',
    profileLanguage: 'Language',
    onboardingStepOf: 'of',
    onboardingCalibration: 'Calibration',
    onboardingStep1Title: 'System Initialization',
    onboardingStep1Subtitle: 'Set your biological baseline to calibrate the engine.',
    onboardingFullName: 'Full Name',
    onboardingFullNamePlaceholder: 'Enter your full name',
    onboardingPrimaryObjective: 'Primary Objective',
    onboardingObj1: 'Reduce Pain',
    onboardingObj2: 'Restore Movement',
    onboardingObj3: 'Improve Performance',
    onboardingObj4: 'Build Capacity',
    onboardingStep2Title: 'Current Load & Pain Status',
    onboardingStep2Subtitle: 'Quantify your musculoskeletal system\'s irritability.',
    onboardingPainCurrent: 'Current Pain Level',
    onboardingPain7d: '7-Day Average Pain',
    onboardingPrimaryArea: 'Primary Affected Area',
    onboardingAreaNone: 'None',
    onboardingAreaLumbar: 'Lumbar / Lower Back',
    onboardingAreaKnee: 'Knee',
    onboardingAreaShoulder: 'Shoulder',
    onboardingAreaHip: 'Hip',
    onboardingAreaAnkle: 'Ankle / Foot',
    onboardingAreaCervical: 'Cervical / Neck',
    onboardingInjuryHistory: 'Injury History (Optional)',
    onboardingInjuryPlaceholder: 'e.g., right ankle sprain 6 months ago',
    onboardingRedFlags: 'Safety Flags',
    onboardingRedFlagNight: 'Severe night pain',
    onboardingRedFlagNeuro: 'Neurological symptoms',
    onboardingRedFlagTrauma: 'Recent trauma or fever',
    onboardingRedFlagCallout: 'You selected medical red flags. MOVE OS is designed for musculoskeletal rehab — please consult a professional for direct evaluation.',
    onboardingStep3Title: 'Baseline Capacity',
    onboardingStep3Subtitle: 'Provide your recovery and activity context.',
    onboardingActivityLevel: 'Activity Level',
    onboardingActivitySedentary: 'Sedentary',
    onboardingActivityRec: 'Recreational',
    onboardingActivityAthlete: 'Athlete',
    onboardingTrainingFreq: 'Weekly Training Frequency',
    onboardingSleep: 'Average Sleep',
    onboardingStress: 'Perceived Stress',
    onboardingStressLow: 'Low',
    onboardingStressOptimal: 'Optimal',
    onboardingStressHigh: 'High',
    onboardingStep4Title: 'Pattern Control Assessment',
    onboardingStep4Subtitle: 'Self-assess your movement competency without pain bias.',
    onboardingPatternSquat: 'Squat Control',
    onboardingPatternHinge: 'Hinge Control',
    onboardingPatternPush: 'Push Tolerance',
    onboardingPatternPull: 'Pull Tolerance',
    onboardingPatternCarry: 'Carry Tolerance',
    onboardingPatternLow: 'Low',
    onboardingPatternModerate: 'Moderate',
    onboardingPatternGood: 'Good',
    onboardingStep5Title: 'Wearable Sync',
    onboardingStep5Subtitle: 'Future integrations — available in next update.',
    onboardingWearableComingSoon: 'Coming soon',
    onboardingStep6Title: 'System Calibrated',
    onboardingStep6Subtitle: 'Your biological parameters yield the following initial protocol.',
    onboardingPhaseLabel: 'ASSIGNED PHASE',
    onboardingConfidence: 'Confidence',
    onboardingSystemNote: 'System Note: Clinical protocol v3.1 applied.',
    onboardingGenerateSession: 'Generate First Session ⚡',
    onboardingInitializing: 'Initializing Engine...',
    paywallTitle: 'Unlock Your Engine',
    paywallSubtitle: 'Get full access to the adaptive clinical library and personalized execution tracking.',
    paywallMonthly: 'Monthly',
    paywallAnnually: 'Annually',
    paywallBestValue: 'Best Value',
    paywallBilledAnnually: 'Billed annually at $180',
    paywallBilledMonthly: 'Billed monthly',
    paywallTrialPill: 'Includes 7-day free trial',
    paywallStartTrial: 'Start 7-day trial',
    paywallNotNow: 'Not now, continue to Home',
    painLow: 'Low inflammatory state',
    painModerate: 'Moderate tissue irritability',
    painHigh: 'High nociceptive activity',
    noPain: 'No pain',
    severe: 'Severe',
};

const es: Strings = {
    moveOS: 'MOVE OS',
    loading: 'Cargando...',
    error: 'Error',
    back: 'Atrás',
    continue: 'Continuar',
    skip: 'Omitir',
    save: 'Guardar',
    cancel: 'Cancelar',
    logout: 'Cerrar sesión',
    loggingOut: 'Cerrando sesión...',
    navHome: 'Inicio',
    navToday: 'Hoy',
    navExplore: 'Explorar',
    navProgress: 'Progreso',
    navProfile: 'Perfil',
    navMission: 'Misión',
    navSystem: 'Sistema',
    homeGreeting: 'Hola',
    homePhase: 'Fase',
    homeSystemStatus: 'Estado del sistema',
    homeSessionReady: 'Acción requerida',
    homeSessionCompleted: 'Completado',
    homeGenerateSession: 'Generar sesión de hoy',
    homeOpenToday: 'Abrir Hoy',
    homeViewProgress: 'Ver Progreso',
    homeConsistency: 'Consistencia 7 días',
    homeGenerating: 'Generando...',
    homeCalibrating: 'Calibrando snapshot del sistema...',
    todayTitle: 'Sesión de Hoy',
    todayGenerated: 'Generada',
    todayCompleted: 'Completada',
    todayBlocksRemaining: 'bloques restantes',
    todayCompleteSession: 'Completar sesión',
    todayReportPain: 'Reportar dolor',
    todayPainLevel: 'Nivel de dolor',
    todayNotes: 'Notas (opcional)',
    todayLogPain: 'Registrar dolor',
    todaySaving: 'Guardando...',
    exploreTitle: 'Biblioteca',
    exploreSearch: 'Buscar',
    exploreSearchPlaceholder: 'Buscar ejercicios...',
    exploreAll: 'Todos',
    exploreLockMessage: 'Mejora a Premium para desbloquear la biblioteca completa',
    exploreUnlockCTA: 'Iniciar prueba de 7 días',
    exploreComingSoon: 'Próximamente',
    progressTitle: 'Progreso',
    progress7d: '7 Días',
    progress30d: '30 Días',
    progressPainTrend: 'Tendencia de Dolor',
    progressAdherence: 'Adherencia',
    progressAvgPain: 'Dolor medio',
    progressSessions: 'Sesiones',
    progressAdherencePercent: 'Adherencia',
    progressNoData: 'Sin registros de dolor en el período seleccionado.',
    progressLockedMessage: 'Gráficos avanzados disponibles en Premium',
    progressUnlockCTA: 'Iniciar prueba de 7 días',
    profileTitle: 'Perfil',
    profileVersion: 'MOVE OS • v0.1.0',
    profileSessions: 'Sesiones',
    profileAdherence: 'Adherencia',
    profilePain: 'Dolor medio',
    profileUnlockPremium: 'Desbloquear Premium',
    profileFeatureLibrary: 'Biblioteca de ejercicios completa',
    profileFeatureEngine: 'Motor clínico adaptativo',
    profileFeatureInsights: 'Insights avanzados',
    profileStartTrial: 'Iniciar prueba de 7 días',
    profileViewPlans: 'Ver planes',
    profileSubscription: 'Suscripción',
    profileActive: 'Activa',
    profileTrialing: 'Prueba',
    profileTrialDaysLeft: 'días restantes en prueba',
    profileManageSubscription: 'Gestionar suscripción',
    profileSettings: 'Configuración',
    profilePersonalData: 'Datos personales',
    profileNotifications: 'Notificaciones',
    profileClinicalHistory: 'Historial clínico',
    profilePrivacy: 'Privacidad y datos',
    profileLanguage: 'Idioma',
    onboardingStepOf: 'de',
    onboardingCalibration: 'Calibración',
    onboardingStep1Title: 'Inicialización del Sistema',
    onboardingStep1Subtitle: 'Establece tu baseline biológica para calibrar el motor.',
    onboardingFullName: 'Nombre completo',
    onboardingFullNamePlaceholder: 'Introduce tu nombre completo',
    onboardingPrimaryObjective: 'Objetivo Principal',
    onboardingObj1: 'Reducir Dolor',
    onboardingObj2: 'Restaurar Movimiento',
    onboardingObj3: 'Mejorar Rendimiento',
    onboardingObj4: 'Construir Capacidad',
    onboardingStep2Title: 'Carga Actual y Estado de Dolor',
    onboardingStep2Subtitle: 'Cuantifica la irritabilidad de tu sistema musculoesquelético.',
    onboardingPainCurrent: 'Nivel de dolor actual',
    onboardingPain7d: 'Dolor promedio 7 días',
    onboardingPrimaryArea: 'Área principal afectada',
    onboardingAreaNone: 'Ninguna',
    onboardingAreaLumbar: 'Lumbar / Zona baja',
    onboardingAreaKnee: 'Rodilla',
    onboardingAreaShoulder: 'Hombro',
    onboardingAreaHip: 'Cadera',
    onboardingAreaAnkle: 'Tobillo / Pie',
    onboardingAreaCervical: 'Cervical / Cuello',
    onboardingInjuryHistory: 'Historial de lesiones (Opcional)',
    onboardingInjuryPlaceholder: 'Ej: esguince tobillo derecho hace 6 meses',
    onboardingRedFlags: 'Indicadores de Seguridad',
    onboardingRedFlagNight: 'Dolor nocturno severo',
    onboardingRedFlagNeuro: 'Síntomas neurológicos',
    onboardingRedFlagTrauma: 'Trauma reciente o fiebre',
    onboardingRedFlagCallout: 'Seleccionaste indicadores médicos de alerta. MOVE OS está diseñado para rehabilitación musculoesquelética — consulta a un profesional para evaluación directa.',
    onboardingStep3Title: 'Capacidad Basal',
    onboardingStep3Subtitle: 'Proporciona tu contexto de recuperación y actividad.',
    onboardingActivityLevel: 'Nivel de Actividad',
    onboardingActivitySedentary: 'Sedentario',
    onboardingActivityRec: 'Recreativo',
    onboardingActivityAthlete: 'Atleta',
    onboardingTrainingFreq: 'Frecuencia de entrenamiento semanal',
    onboardingSleep: 'Sueño promedio',
    onboardingStress: 'Estrés percibido',
    onboardingStressLow: 'Bajo',
    onboardingStressOptimal: 'Óptimo',
    onboardingStressHigh: 'Alto',
    onboardingStep4Title: 'Evaluación de Control de Patrones',
    onboardingStep4Subtitle: 'Autoevalúa tu competencia motriz sin sesgo por dolor.',
    onboardingPatternSquat: 'Control de Sentadilla',
    onboardingPatternHinge: 'Control de Bisagra',
    onboardingPatternPush: 'Tolerancia de Empuje',
    onboardingPatternPull: 'Tolerancia de Tracción',
    onboardingPatternCarry: 'Tolerancia de Carga',
    onboardingPatternLow: 'Bajo',
    onboardingPatternModerate: 'Moderado',
    onboardingPatternGood: 'Bueno',
    onboardingStep5Title: 'Sincronización de Wearables',
    onboardingStep5Subtitle: 'Integraciones futuras — disponible en próxima actualización.',
    onboardingWearableComingSoon: 'Próximamente',
    onboardingStep6Title: 'Sistema Calibrado',
    onboardingStep6Subtitle: 'Tus parámetros biológicos determinan el siguiente protocolo inicial.',
    onboardingPhaseLabel: 'FASE ASIGNADA',
    onboardingConfidence: 'Confianza',
    onboardingSystemNote: 'Nota del sistema: Protocolo clínico v3.1 aplicado.',
    onboardingGenerateSession: 'Generar Primera Sesión ⚡',
    onboardingInitializing: 'Inicializando Motor...',
    paywallTitle: 'Desbloquea tu Motor',
    paywallSubtitle: 'Acceso completo a la biblioteca clínica adaptativa y seguimiento personalizado.',
    paywallMonthly: 'Mensual',
    paywallAnnually: 'Anual',
    paywallBestValue: 'Mejor Valor',
    paywallBilledAnnually: 'Facturado anualmente por $180',
    paywallBilledMonthly: 'Facturado mensualmente',
    paywallTrialPill: 'Incluye prueba gratuita de 7 días',
    paywallStartTrial: 'Iniciar prueba de 7 días',
    paywallNotNow: 'Ahora no, continuar gratis',
    painLow: 'Estado inflamatorio bajo',
    painModerate: 'Irritabilidad tisular moderada',
    painHigh: 'Alta actividad nociceptiva',
    noPain: 'Sin dolor',
    severe: 'Severo',
};

export const strings: Record<Lang, Strings> = { en, es };

// ------------------------------------
// t() helper — standalone, no React
// ------------------------------------
let _fallbackLang: Lang = 'en';

try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('moveos_lang') : null;
    if (stored === 'en' || stored === 'es') _fallbackLang = stored as Lang;
} catch { /* SSR safe */ }

export function t(key: keyof Strings, lang?: Lang): string {
    const l = lang || _fallbackLang;
    return strings[l]?.[key] ?? strings.en[key] ?? key;
}

export function setFallbackLang(lang: Lang) {
    _fallbackLang = lang;
    try { localStorage.setItem('moveos_lang', lang); } catch { /* SSR safe */ }
}

export function getCurrentLang(): Lang {
    return _fallbackLang;
}
