import { env } from "../config/env";
import { ApiError } from "./apiError";
import type { ApiValidationError } from "./bffContracts";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export type RequestOptions = {
    method?: HttpMethod;
    body?: unknown;
    query?: QueryParams;
};

const accessTokenStorageKey = "studybytes_access_token";
const refreshTokenStorageKey = "studybytes_refresh_token";

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

    try {
        const payload = await response.json();
        if (typeof payload?.message === "string") message = payload.message;
        if (Array.isArray(payload?.validationErrors)) validationErrors = payload.validationErrors;
    } catch {
        // keep default message
    }

    return new ApiError(message, response.status, validationErrors);
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const accessToken = getStoredAccessToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const response = await fetch(buildUrl(path, options.query), {
        method: options.method ?? "GET",
        credentials: "include",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    if (!response.ok) throw await parseError(response);
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
}
