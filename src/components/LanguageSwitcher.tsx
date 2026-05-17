import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import type { Locale } from "../i18n/translations";
import { useI18n } from "../i18n/useI18n";

export function LanguageSwitcher({ compact = false, persistAccount = false }: { compact?: boolean; persistAccount?: boolean }) {
    const { locale, setLocale, t } = useI18n();

    const handleChange = (event: SelectChangeEvent) => {
        void setLocale(event.target.value as Locale, persistAccount);
    };

    return (
        <FormControl size="small" sx={{ minWidth: compact ? 86 : 132 }}>
            {!compact ? <InputLabel id="language-switcher-label">{t("language.label")}</InputLabel> : null}
            <Select labelId="language-switcher-label" inputProps={{ "aria-label": t("language.label") }} value={locale} label={compact ? undefined : t("language.label")} onChange={handleChange}>
                <MenuItem value="ru">{compact ? "RU" : t("language.ru")}</MenuItem>
                <MenuItem value="en">{compact ? "EN" : t("language.en")}</MenuItem>
            </Select>
        </FormControl>
    );
}
