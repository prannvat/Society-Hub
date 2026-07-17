export class AppError extends Error {
  readonly statusCode: number;

  constructor(
    readonly code: string,
    message: string,
    statusCode: number,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}
