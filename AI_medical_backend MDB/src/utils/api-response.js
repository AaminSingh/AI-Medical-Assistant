/**
 * Standardised API response wrapper.
 * Ensures every successful response follows a consistent shape:
 * { statusCode, data, message, success }
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code (e.g. 200, 201).
   * @param {*}      data       - Response payload.
   * @param {string} [message="Success"] - Human-readable status message.
   */
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
