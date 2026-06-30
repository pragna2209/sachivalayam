const Notification = require('../notifications.model');
const NotificationDeliveryLog = require('../notificationDeliveryLog.model');
const { NOTIFICATION_CHANNEL, DELIVERY_STATUS } = require('../../../config/constants');

/**
 * In-app delivery is always synchronous: it is just a database write, so
 * the citizen/staff/officer sees it instantly on their next dashboard load.
 * This adapter both creates the Notification document AND its own delivery
 * log entry (channel=IN_APP is always "DELIVERED" the moment it's written).
 */
async function send({ userId, anonymousTrackingId, complaintId, type, title, body }) {
  const notification = await Notification.create({
    userId: userId || null,
    anonymousTrackingId: anonymousTrackingId || null,
    complaintId: complaintId || null,
    type,
    title,
    body,
    isRead: false
  });

  await NotificationDeliveryLog.create({
    notificationId: notification._id,
    channel: NOTIFICATION_CHANNEL.IN_APP,
    providerName: 'internal',
    status: DELIVERY_STATUS.DELIVERED,
    providerResponse: 'OK'
  });

  return notification;
}

module.exports = { send };
