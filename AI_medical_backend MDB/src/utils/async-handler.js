/**
 * Higher-order function that wraps an async Express route handler,
 * automatically catching rejected promises and forwarding them to next().
 *
 * Usage:
 *   router.get("/endpoint", asyncHandler(async (req, res) => { ... }));
 *
 * @param {Function} requestHandler - An async (req, res, next) function.
 * @returns {Function} Express-compatible middleware.
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
