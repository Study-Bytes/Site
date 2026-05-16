import type { ApiValidationError } from "./bffContracts";

export class ApiError extends Error {
    readonly status: number;
    readonly validationErrors: ApiValidationError[];

    constructor(message: string, status: number, validationErrors: ApiValidationError[] = []) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.validationErrors = validationErrors;
    }
}

export function getErrorMessage(error: unknown, fallback = "Request failed") {
    if (error instanceof ApiError) return error.message;
    if (error instanceof Error) return error.message;
    return fallback;
}
