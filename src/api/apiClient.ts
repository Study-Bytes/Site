import { env } from "../config/env";
import { ApiError } from "./apiError";
import type { ApiErrorResponse, ApiValidationError, AuthResponse } from "./bffContracts";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type AuthMode = "required" | "optional" | "none";
export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export type RequestOptions = {
    method?: HttpMethod;
    body?: unknown;
    query?: QueryParams;
    auth?: AuthMode;
    skipRefresh?: boolean;
    suppressSessionExpired?: boolean;
    returnNullOnUnauthorized?: boolean;
};

const accessTokenStorageKey = "studybytes_access_token";
const refreshTokenStorageKey = "studybytes_refresh_token";
const sessionHintStorageKey = "studybytes_has_session";
export const sessionExpiredEventName = "studybytes:session-expired";

export function getStoredAccessToken() {
    return localStorage.getItem(accessTokenStorageKey);
}

export function getStoredRefreshToken() {
    return localStorage.getItem(refreshTokenStorageKey);
}

export function hasStoredSessionHint() {
    return localStorage.getItem(sessionHintStorageKey) === "true";
}

export function markSessionPresent() {
    localStorage.setItem(sessionHintStorageKey, "true");
}

export function storeAuthTokens(accessToken?: string, refreshToken?: string) {
    markSessionPresent();
    if (accessToken) localStorage.setItem(accessTokenStorageKey, accessToken);
    if (refreshToken) localStorage.setItem(refreshTokenStorageKey, refreshToken);
}

export function clearAuthTokens() {
    localStorage.removeItem(accessTokenStorageKey);
    localStorage.removeItem(refreshTokenStorageKey);
    localStorage.removeItem(sessionHintStorageKey);
}

function notifySessionExpired() {
    window.dispatchEvent(new CustomEvent(sessionExpiredEventName));
}

function normalizePath(path: string) {
    return path.startsWith("/") ? path : `/${path}`;
}

function buildUrl(path: string, query?: QueryParams) {
    const normalizedPath = normalizePath(path);
    const url = `${env.bffBaseUrl}${env.bffApiPrefix}${normalizedPath}`;
    if (!query) return url;

    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    });

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
}

function networkError(error: unknown) {
    const message = error instanceof Error ? error.message : "Network request failed";
    return new ApiError(message, 0, [], "NETWORK_ERROR");
}

async function parseError(response: Response): Promise<ApiError> {
    let message = `Request failed with status ${response.status}`;
    let validationErrors: ApiValidationError[] = [];
    let code: string | undefined;
    let requestId: string | undefined = response.headers.get("x-request-id") ?? response.headers.get("x-correlation-id") ?? undefined;

    try {
        const payload = (await response.json()) as Partial<ApiErrorResponse>;
        if (typeof payload?.message === "string") message = payload.message;
        else if (typeof payload?.error === "string") message = payload.error;
        if (typeof payload?.code === "string") code = payload.code;
        if (typeof payload?.requestId === "string") requestId = payload.requestId;
        if (Array.isArray(payload?.validationErrors)) validationErrors = payload.validationErrors;
    } catch {
        // keep default message
    }

    return new ApiError(message, response.status, validationErrors, code, requestId);
}

function createHeaders(includeAuth: boolean) {
    const accessToken = getStoredAccessToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (includeAuth && accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return headers;
}

function createFetchOptions(options: RequestOptions) {
    const includeAuth = options.auth !== "none";
    return {
        method: options.method ?? "GET",
        credentials: includeAuth ? "include" as RequestCredentials : "omit" as RequestCredentials,
        headers: createHeaders(includeAuth),
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
    };
}

function shouldAttemptRefresh(path: string, options: RequestOptions, hasKnownSession: boolean) {
    if (!hasKnownSession) return false;
    if (options.auth === "none" || options.skipRefresh) return false;
    const normalizedPath = normalizePath(path);
    return !["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].some((authPath) => normalizedPath.startsWith(authPath));
}

async function refreshSession(): Promise<boolean> {
    const refreshToken = getStoredRefreshToken();

    try {
        const response = await fetch(buildUrl("/auth/refresh"), {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
        });

        if (!response.ok) return false;
        const payload = (await response.json()) as AuthResponse;
        storeAuthTokens(payload.accessToken, payload.refreshToken);
        return true;
    } catch {
        return false;
    }
}

async function retryRequest<T>(path: string, options: RequestOptions): Promise<T> {
    let retryResponse: Response;
    try {
        retryResponse = await fetch(buildUrl(path, options.query), createFetchOptions(options));
    } catch (error) {
        throw networkError(error);
    }
    if (!retryResponse.ok) throw await parseError(retryResponse);
    if (retryResponse.status === 204) return undefined as T;
    return (await retryResponse.json()) as T;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const hasKnownSession = Boolean(getStoredAccessToken() || getStoredRefreshToken() || hasStoredSessionHint());
    let response: Response;
    try {
        response = await fetch(buildUrl(path, options.query), createFetchOptions(options));
    } catch (error) {
        throw networkError(error);
    }

    if (response.status === 401) {
        if (shouldAttemptRefresh(path, options, hasKnownSession)) {
            const refreshed = await refreshSession();
            if (refreshed) return retryRequest<T>(path, options);
        }

        const shouldExpireSession = options.auth !== "none" && (hasKnownSession || options.auth === "required");
        if (shouldExpireSession) clearAuthTokens();
        if (!options.suppressSessionExpired && shouldExpireSession) notifySessionExpired();
        if (options.returnNullOnUnauthorized) return null as T;
        throw await parseError(response);
    }

    if (!response.ok) throw await parseError(response);
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
}
