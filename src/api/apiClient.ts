import { env } from "../config/env";
import { ApiError } from "./apiError";
import type { ApiErrorResponse, ApiValidationError, AuthResponse } from "./bffContracts";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export type RequestOptions = {
    method?: HttpMethod;
    body?: unknown;
    query?: QueryParams;
};

const accessTokenStorageKey = "studybytes_access_token";
const refreshTokenStorageKey = "studybytes_refresh_token";
export const sessionExpiredEventName = "studybytes:session-expired";

export function getStoredAccessToken() {
    return localStorage.getItem(accessTokenStorageKey);
}

export function getStoredRefreshToken() {
    return localStorage.getItem(refreshTokenStorageKey);
}

export function storeAuthTokens(accessToken?: string, refreshToken?: string) {
    if (accessToken) localStorage.setItem(accessTokenStorageKey, accessToken);
    if (refreshToken) localStorage.setItem(refreshTokenStorageKey, refreshToken);
}

export function clearAuthTokens() {
    localStorage.removeItem(accessTokenStorageKey);
    localStorage.removeItem(refreshTokenStorageKey);
}

function notifySessionExpired() {
    window.dispatchEvent(new CustomEvent(sessionExpiredEventName));
}

function buildUrl(path: string, query?: QueryParams) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${env.bffBaseUrl}${env.bffApiPrefix}${normalizedPath}`;
    if (!query) return url;

    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    });

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
}

async function parseError(response: Response): Promise<ApiError> {
    let message = `Request failed with status ${response.status}`;
    let validationErrors: ApiValidationError[] = [];
    let code: string | undefined;
    let requestId: string | undefined;

    try {
        const payload = (await response.json()) as Partial<ApiErrorResponse>;
        if (typeof payload?.message === "string") message = payload.message;
        if (typeof payload?.code === "string") code = payload.code;
        if (typeof payload?.requestId === "string") requestId = payload.requestId;
        if (Array.isArray(payload?.validationErrors)) validationErrors = payload.validationErrors;
    } catch {
        // keep default message
    }

    return new ApiError(message, response.status, validationErrors, code, requestId);
}

function createHeaders() {
    const accessToken = getStoredAccessToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return headers;
}

function createFetchOptions(options: RequestOptions) {
    return {
        method: options.method ?? "GET",
        credentials: "include" as RequestCredentials,
        headers: createHeaders(),
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
    };
}

function shouldAttemptRefresh(path: string) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return !["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].some((authPath) => normalizedPath.startsWith(authPath));
}

async function refreshSession(): Promise<boolean> {
    const refreshToken = getStoredRefreshToken();

    try {
        const response = await fetch(buildUrl("/auth/refresh"), {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(refreshToken ? { refreshToken } : {}),
        });

        if (!response.ok) return false;
        const payload = (await response.json()) as AuthResponse;
        storeAuthTokens(payload.accessToken, payload.refreshToken);
        return true;
    } catch {
        return false;
    }
}

async function handleUnauthorized(path: string, response: Response, hadStoredTokens: boolean) {
    if (shouldAttemptRefresh(path)) {
        const refreshed = await refreshSession();
        if (refreshed) return null;
    }

    clearAuthTokens();
    if (hadStoredTokens || path !== "/me") notifySessionExpired();
    return parseError(response);
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const hadStoredTokens = Boolean(getStoredAccessToken() || getStoredRefreshToken());
    const response = await fetch(buildUrl(path, options.query), createFetchOptions(options));

    if (response.status === 401) {
        const unauthorizedError = await handleUnauthorized(path, response, hadStoredTokens);
        if (!unauthorizedError) {
            const retryResponse = await fetch(buildUrl(path, options.query), createFetchOptions(options));
            if (!retryResponse.ok) throw await parseError(retryResponse);
            if (retryResponse.status === 204) return undefined as T;
            return (await retryResponse.json()) as T;
        }
        throw unauthorizedError;
    }

    if (!response.ok) throw await parseError(response);
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
}
