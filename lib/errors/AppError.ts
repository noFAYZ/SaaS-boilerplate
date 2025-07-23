// lib/errors/AppError.ts
export enum ErrorCode {
    AUTH_REQUIRED = 'AUTH_REQUIRED',
    INVALID_TOKEN = 'INVALID_TOKEN',
    INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    CACHE_ERROR = 'CACHE_ERROR',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
  }
  
  export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: ErrorCode;
    public readonly isOperational: boolean;
    public readonly timestamp: string;
  
    constructor(
      message: string,
      statusCode: number = 500,
      code: ErrorCode = ErrorCode.INTERNAL_ERROR,
      isOperational: boolean = true
    ) {
      super(message);
      this.name = 'AppError';
      this.statusCode = statusCode;
      this.code = code;
      this.isOperational = isOperational;
      this.timestamp = new Date().toISOString();
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class ValidationError extends AppError {
    constructor(message: string) {
      super(message, 400, ErrorCode.VALIDATION_ERROR);
    }
  }
  
  export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
      super(message, 401, ErrorCode.AUTH_REQUIRED);
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
      super(`${resource} not found`, 404, ErrorCode.NOT_FOUND);
    }
  }
  
  export class ExternalServiceError extends AppError {
    constructor(service: string, originalError?: Error) {
      super(
        `External service error: ${service}`,
        502,
        ErrorCode.EXTERNAL_SERVICE_ERROR
      );
    }
  }