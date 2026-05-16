const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const normalizePrefix = (value: string) => {
    const trimmed = value.trim().replace(/^\/+|\/+$/g, "");
    return trimmed ? `/${trimmed}` : "";
};

const configuredMockMode = import.meta.env.VITE_USE_MOCK_BFF;

export const env = {
    bffBaseUrl: trimTrailingSlash(import.meta.env.VITE_BFF_BASE_URL ?? ""),
    bffApiPrefix: normalizePrefix(import.meta.env.VITE_BFF_API_PREFIX ?? "/api/v1"),
    useMockBff: configuredMockMode === undefined ? import.meta.env.DEV : configuredMockMode === "true",
};
