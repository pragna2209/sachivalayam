const { AppError } = require('../utils/appError');
const { failure } = require('../utils/apiResponse');
const { t, resolveLanguage } = require('../i18n');
const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * Single, final error handler. Converts known operational errors
 * (AppError subclasses), Mongoose validation/cast errors, and JWT errors
 * into the uniform { success, data, error, message } envelope. Anything
 * unrecognized is logged with full detail server-side but never leaks
 * internals to the client.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const lang = resolveLanguage(req);

  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Non-operational AppError', { error: err.message, stack: err.stack });
    }
    return failure(res, {
      statusCode: err.statusCode,
      message: err.message,
      error: err.details ? { details: err.details } : err.message
    });
  }

  if (err.name === 'ValidationError' && err.errors) {
    // Mongoose schema validation error
    const fieldErrors = Object.fromEntries(
      Object.entries(err.errors).map(([key, value]) => [key, value.message])
    );
    return failure(res, {
      statusCode: 422,
      message: t('validation.failed', lang),
      error: { details: fieldErrors }
    });
  }

  if (err.name === 'CastError') {
    return failure(res, {
      statusCode: 400,
      message: t('validation.failed', lang),
      error: `Invalid value for field "${err.path}"`
    });
  }

  if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return failure(res, {
      statusCode: 409,
      message: `Duplicate value for ${field}`,
      error: `DUPLICATE_${field.toUpperCase()}`
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return failure(res, {
      statusCode: 401,
      message: t('auth.token.invalid', lang),
      error: err.name
    });
  }

  if (err.type === 'entity.too.large') {
    return failure(res, {
      statusCode: 413,
      message: t('evidence.fileTooLarge', lang),
      error: 'PAYLOAD_TOO_LARGE'
    });
  }

  // Unrecognized / programming error - log full detail, never expose internals.
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  return failure(res, {
    statusCode: 500,
    message: t('server.error', lang),
    error: env.IS_PRODUCTION ? 'INTERNAL_SERVER_ERROR' : err.message
  });
}

function notFoundHandler(req, res) {
  const lang = resolveLanguage(req);
  return failure(res, {
    statusCode: 404,
    message: t('server.notFound', lang),
    error: 'ROUTE_NOT_FOUND'
  });
}

module.exports = { errorHandler, notFoundHandler };
