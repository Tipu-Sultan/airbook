class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.status = 404;
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.status = 409;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.status = 401;
  }
}

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
};
const BadRequestError = class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
};
module.exports = { errorHandler, NotFoundError, BadRequestError,ConflictError, UnauthorizedError };