export type ErrorType = 'ValidationError' | 'NotFoundError' | 'StockError' | 'AuthError' | 'InternalError';

export class AppError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('ValidationError', message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super('NotFoundError', message, 404);
  }
}

export class StockError extends AppError {
  constructor(message: string) {
    super('StockError', message, 400);
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super('AuthError', message, 401);
  }
}
