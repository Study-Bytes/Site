import { createContext } from "react";
import type { Locale, TranslationKey } from "./translations";

export type I18nContextValue = {
    locale: Locale;
    setLocale: (locale: Locale, persistAccount?: boolean) => Promise<void>;
    t: (key: TranslationKey) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);
