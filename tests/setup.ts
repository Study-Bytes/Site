import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { mockBff } from "../src/mocks/mockBff";

vi.stubEnv("VITE_USE_MOCK_BFF", "true");
vi.stubEnv("VITE_BFF_API_PREFIX", "/api/v1");
vi.stubEnv("VITE_BFF_BASE_URL", "");

beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("matchMedia", (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
});

afterEach(async () => {
    vi.restoreAllMocks();
    await mockBff.logout();
    cleanup();
    vi.unstubAllGlobals();
});
