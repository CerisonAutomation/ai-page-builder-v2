/**
 * API Response Standardisation
 * ✅ All API responses follow unified format
 */

import { NextResponse } from "next/server";
import { AppError, ErrorCode, ErrorHttpStatus } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

// ✅ STANDARD RESPONSE ENVELOPE
export interface ApiResponse<T = unknown> {
  status: number;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    requestId?: string;
    timestamp?: string;
    duration?: number;
  };
}

// ✅ SUCCESS RESPONSE
export function success<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      status,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

// ✅ ERROR RESPONSE
export function error(
  code: string,
  message: string,
  statusCode?: number,
  details?: Record<string, unknown>
): NextResponse<ApiResponse> {
  const status = statusCode || ErrorHttpStatus[code as keyof typeof ErrorHttpStatus] || 500;

  return NextResponse.json(
    {
      status,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

// ✅ HANDLE ERRORS
export function handleError(err: unknown): NextResponse<ApiResponse> {
  if (err instanceof AppError) {
    logger.error(err.message, err, { code: err.code });
    return error(err.code, err.message, err.status, err.context);
  }

  if (err instanceof Error) {
    logger.error(err.message, err);
    return error(
      ErrorCode.INTERNAL_ERROR,
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message
    );
  }

  logger.error("Unknown error", String(err));
  return error(ErrorCode.INTERNAL_ERROR, "Internal server error");
}

// ✅ RATE LIMIT RESPONSE
export function rateLimited(retryAfter: number = 60): NextResponse<ApiResponse> {
  const response = NextResponse.json(
    {
      status: 429,
      error: {
        code: ErrorCode.RATE_LIMITED,
        message: "Too many requests",
        details: { retryAfter },
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 429 }
  );

  response.headers.set("Retry-After", retryAfter.toString());
  return response;
}
