export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const Unauthorized = (msg = "Unauthorized") =>
  new AppError(401, "UNAUTHORIZED", msg);
export const NotFound = (msg = "Not found") =>
  new AppError(404, "NOT_FOUND", msg);
export const BadRequest = (msg, details) =>
  new AppError(400, "BAD_REQUEST", msg, details);
export const TooMany = (msg = "Too many requests") =>
  new AppError(429, "RATE_LIMITED", msg);
export const Conflict = (msg) => new AppError(409, "CONFLICT", msg);

export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const payload = {
    error: err.code || "INTERNAL",
    message: err.message || "Something went wrong"
  };
  if (err.details) payload.details = err.details;
  if (status >= 500) {
    req.log?.error({ err }, "server_error");
  } else {
    req.log?.info({ err: err.message, status }, "client_error");
  }
  res.status(status).json(payload);
}
