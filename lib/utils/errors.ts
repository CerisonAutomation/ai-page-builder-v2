/**
 * AppError & Error Codes — Standardised Error Handling
 * ✅ All errors follow this pattern across the app
 */

// ✅ ERROR CODES (constant values, not magic strings)
export const ErrorCode = {
  // Auth
  AUTH_REQUIRED: "AUTH_REQUIRED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_TOKEN: "INVALID_TOKEN",
  
  // Data
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT",
  
  // Rate limiting
  RATE_LIMITED: "RATE_LIMITED",
  
  // AI
  AI_ERROR: "AI_ERROR",
  AI_TIMEOUT: "AI_TIMEOUT",
  AI_QUOTA_EXCEEDED: "AI_QUOTA_EXCEEDED",
  
  // Storage
  STORAGE_ERROR: "STORAGE_ERROR",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  
  // Database
  DB_ERROR: "DB_ERROR",
  DB_CONSTRAINT: "DB_CONSTRAINT",
  
  // Internal
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
} as const;

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];

// ✅ HTTP STATUS CODES FOR ERRORS
export const ErrorHttpStatus: Record<ErrorCodeType, number> = {
  [ErrorCode.AUTH_REQUIRED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.AI_ERROR]: 500,
  [ErrorCode.AI_TIMEOUT]: 504,
  [ErrorCode.AI_QUOTA_EXCEEDED]: 429,
  [ErrorCode.STORAGE_ERROR]: 500,
  [ErrorCode.FILE_TOO_LARGE]: 413,
  [ErrorCode.INVALID_FILE_TYPE]: 400,
  [ErrorCode.DB_ERROR]: 500,
  [ErrorCode.DB_CONSTRAINT]: 409,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.NOT_IMPLEMENTED]: 501,
};

// ✅ STANDARDISED ERROR CLASS
export class AppError extends Error {
  code: ErrorCodeType;
  status: number;
  context: Record<string, unknown>;
  timestamp: Date;

  constructor(
    code: ErrorCodeType,
    message: string,
    context: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = ErrorHttpStatus[code];
    this.context = context;
    this.timestamp = new Date();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

// ✅ ERROR RESPONSE HELPER
export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      status: error.status,
      error: {
        code: error.code,
        message: error.message,
        details: error.context,
      },
    };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: error.message,
        details: { originalError: error.constructor.name },
      },
    };
  }

  return {
    status: 500,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: "Unknown error occurred",
      details: {},
    },
  };
}

// ✅ SAFE TYPE GUARD
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// ✅ WRAP NATIVE ERRORS
export function wrapError(error: unknown, code: ErrorCodeType, context: Record<string, unknown> = {}) {
  if (isAppError(error)) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  return new AppError(code, message, {
    ...context,
    originalError: error instanceof Error ? error.constructor.name : typeof error,
  });
}
