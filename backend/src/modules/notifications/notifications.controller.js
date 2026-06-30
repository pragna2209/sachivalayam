const notificationsService = require('./notifications.service');
const { success } = require('../../utils/apiResponse');
const { t, resolveLanguage } = require('../../i18n');

function translateKnownError(err, req) {
  if (err && err.isOperational && typeof err.message === 'string') {
    err.message = t(err.message, resolveLanguage(req));
  }
  return err;
}

async function listMine(req, res, next) {
  try {
    const { page, limit, isRead } = req.query;
    const result = await notificationsService.listForUser({ userId: req.user._id, isRead, page, limit });
    return success(res, { data: result.items, meta: { ...result.meta, unreadCount: result.unreadCount } });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function listAnonymous(req, res, next) {
  try {
    const result = await notificationsService.listForAnonymous(req.body);
    return success(res, { data: result.items });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function markRead(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    await notificationsService.markAsRead({ notificationId: req.params.id, userId: req.user._id });
    return success(res, { data: null, message: t('notification.markedRead', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function markAllRead(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    await notificationsService.markAllAsRead({ userId: req.user._id });
    return success(res, { data: null, message: t('notification.markedRead', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

module.exports = { listMine, listAnonymous, markRead, markAllRead };
