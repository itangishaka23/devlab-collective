/** Error with an HTTP status code, handled by middlewares/errorHandler.js */
export default class AppError extends Error {
  constructor(message, status = 500, errors = null) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.isOperational = true;
  }
}
