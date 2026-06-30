/**
 * Every API response follows the same envelope:
 * { success, data, error, message }
 * `message` is already resolved server-side into the caller's language.
 */

function success(res, { data = null, message = null, statusCode = 200, meta = null }) {
  const body = { success: true, data, error: null, message };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

function created(res, { data = null, message = null, meta = null }) {
  return success(res, { data, message, statusCode: 201, meta });
}

function failure(res, { message = 'Something went wrong', statusCode = 500, error = null }) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: error || message,
    message
  });
}

module.exports = { success, created, failure };
