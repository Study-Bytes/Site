import { env } from "../../config/env";
import { mockBff } from "../../mocks/mockBff";
import { request } from "../apiClient";
import type { DefaultLocaleResponse, Locale } from "../bffContracts";

export const i18nApi = {
    getDefaultLocale(): Promise<DefaultLocaleResponse> {
        if (env.useMockBff) return mockBff.getDefaultLocale();
        return request<DefaultLocaleResponse>("/i18n/default-locale");
    },

    updatePreferredLocale(locale: Locale): Promise<void> {
        if (env.useMockBff) return mockBff.updatePreferredLocale(locale);
        return request<void>("/me/settings", { method: "PUT", body: { preferredLocale: locale } });
    },
};
