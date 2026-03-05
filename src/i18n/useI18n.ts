import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { strings, getCurrentLang } from './strings';
import type { Lang } from './strings';

/**
 * useI18n — React hook that reads lang from AuthContext (profile.preferred_language)
 * and falls back to the module-level storage in strings.ts.
 *
 * Kept in a separate file to avoid circular imports:
 *   strings.ts  <-- AuthContext.tsx (for setFallbackLang)
 *   useI18n.ts  --> AuthContext.tsx (for useContext)
 *   useI18n.ts  --> strings.ts (for strings dict)
 */
export function useI18n() {
    let lang: Lang = getCurrentLang();

    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const ctx = useContext(AuthContext);
        if (ctx?.profile?.preferred_language) {
            lang = ctx.profile.preferred_language as Lang;
        }
    } catch {
        // safe outside of provider
    }

    const t = (key: keyof typeof strings.en) =>
        strings[lang]?.[key] ?? strings.en[key] ?? key;

    return { t, lang };
}
