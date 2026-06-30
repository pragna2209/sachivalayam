const bcrypt = require('bcryptjs');
const inAppAdapter = require('./adapters/inApp.adapter');
const emailAdapter = require('./adapters/email.adapter');
const smsAdapter = require('./adapters/sms.adapter');
const whatsappAdapter = require('./adapters/whatsapp.adapter');
const Notification = require('./notifications.model');
const NotificationDeliveryLog = require('./notificationDeliveryLog.model');
const AnonymousComplainantCredentials = require('../anonymous/anonymous.model');
const { NOTIFICATION_CHANNEL, DELIVERY_STATUS } = require('../../config/constants');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { NotFoundError, UnauthorizedError } = require('../../utils/appError');
const env = require('../../config/env');
const logger = require('../../utils/logger');

/**
 * Fans a single notification event out to In-App (always, synchronous)
 * plus Email/SMS/WhatsApp (dispatched fire-and-forget so a slow/down
 * provider never blocks the citizen-facing request/response cycle -
 * Section 10.2 of the approved architecture). This function is the ONLY
 * place that knows about "all four channels"; nothing else in the
 * codebase calls the adapters directly.
 *
 * recipient: { userId?, anonymousTrackingId?, email?, phoneNumber? }
 */
async function dispatch({ recipient, complaintId, type, content, channels }) {
  const targetChannels = channels || [NOTIFICATION_CHANNEL.IN_APP, NOTIFICATION_CHANNEL.EMAIL];

  const notification = await inAppAdapter.send({
    userId: recipient.userId,
    anonymousTrackingId: recipient.anonymousTrackingId,
    complaintId,
    type,
    title: content.title,
    body: content.body
  });

  const plainText = content.body.en;
  const dispatches = [];

  if (targetChannels.includes(NOTIFICATION_CHANNEL.EMAIL) && recipient.email) {
    dispatches.push(
      emailAdapter
        .send({ to: recipient.email, subject: content.title.en, text: plainText })
        .then((result) => logDelivery(notification._id, NOTIFICATION_CHANNEL.EMAIL, env.EMAIL_PROVIDER, result))
    );
  }

  if (targetChannels.includes(NOTIFICATION_CHANNEL.SMS) && recipient.phoneNumber) {
    dispatches.push(
      smsAdapter
        .send({ to: recipient.phoneNumber, message: plainText })
        .then((result) => logDelivery(notification._id, NOTIFICATION_CHANNEL.SMS, env.SMS_PROVIDER, result))
    );
  }

  if (targetChannels.includes(NOTIFICATION_CHANNEL.WHATSAPP) && recipient.phoneNumber) {
    dispatches.push(
      whatsappAdapter
        .send({ to: recipient.phoneNumber, message: plainText })
        .then((result) => logDelivery(notification._id, NOTIFICATION_CHANNEL.WHATSAPP, env.WHATSAPP_PROVIDER, result))
    );
  }

  Promise.allSettled(dispatches).catch((err) => {
    logger.error('Notification dispatch batch error', { error: err.message });
  });

  return notification;
}

async function logDelivery(notificationId, channel, providerName, result) {
  try {
    await NotificationDeliveryLog.create({
      notificationId,
      channel,
      providerName: providerName || 'unknown',
      status: result.status || DELIVERY_STATUS.FAILED,
      providerResponse: result.providerResponse || ''
    });
  } catch (err) {
    logger.error('Failed to write notification delivery log', { error: err.message, channel });
  }
}

/**
 * OTP dispatch bypasses the generic dispatch() pipeline (no in-app feed
 * entry makes sense before the user is authenticated) and calls the SMS
 * adapter directly.
 */
async function dispatchOtpSms({ phoneNumber, otp }) {
  return smsAdapter.send({
    to: phoneNumber,
    message: `Your Sachivalayam Grievance System OTP is ${otp}. It expires in ${env.OTP_EXPIRES_IN_MINUTES} minutes.`
  });
}

async function listForUser({ userId, isRead, page, limit }) {
  const filter = { userId };
  if (isRead !== undefined) filter.isRead = isRead === 'true';

  const { skip } = parsePagination({ page, limit });
  const safeLimit = Math.min(parseInt(limit, 10) || 20, 100);

  const [items, totalCount, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, isRead: false })
  ]);

  return {
    items,
    unreadCount,
    meta: buildPaginationMeta({ page: parseInt(page, 10) || 1, limit: safeLimit, totalCount })
  };
}

async function listForAnonymous({ trackingId, pin }) {
  const credentials = await AnonymousComplainantCredentials.findOne({ trackingId });
  if (!credentials) {
    throw new UnauthorizedError('anonymous.invalidCredentials');
  }
  const isMatch = await bcrypt.compare(pin, credentials.pinHash);
  if (!isMatch) {
    throw new UnauthorizedError('anonymous.invalidCredentials');
  }

  const items = await Notification.find({ anonymousTrackingId: trackingId }).sort({ createdAt: -1 }).lean();
  return { items };
}

async function markAsRead({ notificationId, userId }) {
  const notification = await Notification.findOne({ _id: notificationId, userId });
  if (!notification) {
    throw new NotFoundError('notification.notFound');
  }
  notification.isRead = true;
  await notification.save();
  return notification;
}

async function markAllAsRead({ userId }) {
  await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
  return { success: true };
}

module.exports = {
  dispatch,
  dispatchOtpSms,
  listForUser,
  listForAnonymous,
  markAsRead,
  markAllAsRead
};
