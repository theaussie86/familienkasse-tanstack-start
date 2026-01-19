/**
 * API error handling utilities with typed error responses.
 */

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export interface ApiError {
  message: string;
  code: ApiErrorCode;
}

const statusCodeMap: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

/**
 * Create a standardized API error response.
 * @param code - Error code
 * @param message - Human-readable error message
 * @returns Response object with appropriate status code and JSON body
 */
export function createApiError(code: ApiErrorCode, message: string): Response {
  const error: ApiError = { code, message };
  return new Response(JSON.stringify(error), {
    status: statusCodeMap[code],
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Create a 400 Bad Request error response.
 */
export function badRequest(message: string): Response {
  return createApiError("BAD_REQUEST", message);
}

/**
 * Create a 401 Unauthorized error response.
 */
export function unauthorized(message = "Authentifizierung erforderlich"): Response {
  return createApiError("UNAUTHORIZED", message);
}

/**
 * Create a 403 Forbidden error response.
 */
export function forbidden(message = "Zugriff verweigert"): Response {
  return createApiError("FORBIDDEN", message);
}

/**
 * Create a 404 Not Found error response.
 */
export function notFound(message = "Ressource nicht gefunden"): Response {
  return createApiError("NOT_FOUND", message);
}

/**
 * Create a 500 Internal Server Error response.
 */
export function internalError(
  message = "Ein unerwarteter Fehler ist aufgetreten"
): Response {
  return createApiError("INTERNAL_ERROR", message);
}

/**
 * Create a successful JSON response.
 * @param data - Data to serialize as JSON
 * @param status - HTTP status code (default: 200)
 */
export function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
