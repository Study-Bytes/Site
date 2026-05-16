const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const configuredMockMode = import.meta.env.VITE_USE_MOCK_BFF;

export const env = {
    bffBaseUrl: trimTrailingSlash(import.meta.env.VITE_BFF_BASE_URL ?? "/api"),
    useMockBff: configuredMockMode === undefined ? import.meta.env.DEV : configuredMockMode === "true",
};
