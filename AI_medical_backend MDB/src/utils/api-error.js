/**
 * Standardised API error class.
 * Extends the native Error so it can be thrown / caught like any other error
 * while also carrying HTTP-specific metadata (status code, structured errors).
 */
class ApiError extends Error {
  /**
   * @param {number}   statusCode - HTTP status code (e.g. 400, 404, 500).
   * @param {string}   [message="Something went wrong"] - Human-readable error message.
   * @param {Array}    [errors=[]] - Array of granular error details (e.g. validation errors).
   * @param {string}   [stack=""] - Optional stack trace override.
   */
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);

    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
