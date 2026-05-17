import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { i18nApi } from "../api/services/i18nApi";
import { defaultLocale, localeFromBrowser, normalizeLocale, translations } from "./translations";
import type { Locale, TranslationKey } from "./translations";
import { I18nContext } from "./i18n-context";
import type { I18nContextValue } from "./i18n-context";

const storageKey = "studybytes_locale";

function getStoredLocale() {
    return normalizeLocale(localStorage.getItem(storageKey));
}

function resolveInitialLocale() {
    return getStoredLocale() ?? localeFromBrowser() ?? defaultLocale;
}

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(resolveInitialLocale);

    useEffect(() => {
        let mounted = true;
        if (getStoredLocale()) return;
        void i18nApi.getDefaultLocale().then((response) => {
            if (!mounted) return;
            setLocaleState(response.locale);
            localStorage.setItem(storageKey, response.locale);
        }).catch(() => undefined);
        return () => { mounted = false; };
    }, []);

    const setLocale = useCallback(async (nextLocale: Locale, persistAccount = false) => {
        setLocaleState(nextLocale);
        localStorage.setItem(storageKey, nextLocale);
        if (persistAccount) {
            try {
                await i18nApi.updatePreferredLocale(nextLocale);
            } catch {
                // Keep local preference even if account setting endpoint is unavailable.
            }
        }
    }, []);

    const t = useCallback((key: TranslationKey) => translations[locale][key] ?? translations.en[key] ?? key, [locale]);

    const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
