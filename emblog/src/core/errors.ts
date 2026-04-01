export class AppError extends Error {
	readonly code: string;
	readonly details?: string;

	constructor(message: string, options?: { code?: string; details?: string; cause?: unknown }) {
		super(message, options?.cause ? { cause: options.cause } : undefined);
		this.name = new.target.name;
		this.code = options?.code ?? "APP_ERROR";
		this.details = options?.details;
	}
}

export class ValidationError extends AppError {
	constructor(message: string, details?: string) {
		super(message, { code: "VALIDATION_ERROR", details });
	}
}

export class BuildError extends AppError {
	constructor(message: string, details?: string, cause?: unknown) {
		super(message, { code: "BUILD_ERROR", details, cause });
	}
}

export class PathSafetyError extends AppError {
	constructor(message: string, details?: string) {
		super(message, { code: "PATH_SAFETY_ERROR", details });
	}
}

export const formatError = (error: unknown): string => {
	if (error instanceof AppError) {
		return error.details ? `${error.message} (${error.details})` : error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
};
