/**
 * PURPOSE: Base error class for all intentionally-thrown application errors.
 * Carries an HTTP status and a machine-readable code so the central error
 * handler can map it directly to the standard API error envelope without
 * guessing.
 * DEPENDENCIES: none
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(code: string, message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(message = 'Resource not found', details?: unknown): AppError {
    return new AppError('RESOURCE_NOT_FOUND', message, 404, details);
  }

  static unauthorized(message = 'Unauthorized', details?: unknown): AppError {
    return new AppError('UNAUTHORIZED', message, 401, details);
  }

  static forbidden(message = 'Forbidden', details?: unknown): AppError {
    return new AppError('FORBIDDEN', message, 403, details);
  }

  static validation(message = 'Validation failed', details?: unknown): AppError {
    return new AppError('VALIDATION_ERROR', message, 422, details);
  }

  static conflict(message = 'Conflict', details?: unknown): AppError {
    return new AppError('CONFLICT', message, 409, details);
  }

  static internal(message = 'Internal server error', details?: unknown): AppError {
    return new AppError('INTERNAL_ERROR', message, 500, details);
  }

  static serviceUnavailable(message = 'Service unavailable', details?: unknown): AppError {
    return new AppError('SERVICE_UNAVAILABLE', message, 503, details);
  }
}
