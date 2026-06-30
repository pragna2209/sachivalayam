const { ValidationError } = require('../utils/appError');
const { t, resolveLanguage } = require('../i18n');

/**
 * Builds a middleware that validates req.body / req.query / req.params
 * against the given zod schemas, before any controller logic runs.
 * Usage: validate({ body: createComplaintSchema })
 */
function validate({ body, query, params } = {}) {
  return function validationMiddleware(req, res, next) {
    try {
      if (body) {
        const result = body.safeParse(req.body);
        if (!result.success) {
          throw new ValidationError(
            t('validation.failed', resolveLanguage(req)),
            result.error.flatten().fieldErrors
          );
        }
        req.body = result.data;
      }

      if (query) {
        const result = query.safeParse(req.query);
        if (!result.success) {
          throw new ValidationError(
            t('validation.failed', resolveLanguage(req)),
            result.error.flatten().fieldErrors
          );
        }
        req.query = result.data;
      }

      if (params) {
        const result = params.safeParse(req.params);
        if (!result.success) {
          throw new ValidationError(
            t('validation.failed', resolveLanguage(req)),
            result.error.flatten().fieldErrors
          );
        }
        req.params = result.data;
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = validate;
