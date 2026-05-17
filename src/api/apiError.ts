import type { ApiValidationError } from "./bffContracts";

export class ApiError extends Error {
    readonly status: number;
    readonly validationErrors: ApiValidationError[];
    readonly code?: string;
    readonly requestId?: string;

    constructor(message: string, status: number, validationErrors: ApiValidationError[] = [], code?: string, requestId?: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.validationErrors = validationErrors;
        this.code = code;
        this.requestId = requestId;
    }
}

export function getErrorMessage(error: unknown, fallback = "Request failed") {
    if (error instanceof ApiError) return error.message;
    if (error instanceof Error) return error.message;
    return fallback;
}
