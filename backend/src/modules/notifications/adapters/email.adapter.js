const nodemailer = require('nodemailer');
const env = require('../../../config/env');
const logger = require('../../../utils/logger');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined
  });
  return transporter;
}

/**
 * Sends an email via SMTP. Returns a DeliveryResult-shaped object
 * { status, providerResponse } regardless of success/failure - callers
 * (the NotificationService dispatch pipeline) never need to catch/throw,
 * they just log whatever this resolves to into notification_delivery_logs.
 */
async function send({ to, subject, text, html }) {
  if (!to) {
    return { status: 'FAILED', providerResponse: 'No recipient email address available' };
  }
  if (!env.SMTP_HOST) {
    // No SMTP configured (e.g. local dev) - treat as a no-op success so the
    // rest of the pipeline (which logs every attempt) still functions.
    logger.warn('Email adapter: SMTP not configured, skipping send', { to, subject });
    return { status: 'SENT', providerResponse: 'SMTP not configured - skipped in this environment' };
  }

  try {
    const info = await getTransporter().sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`
    });
    return { status: 'SENT', providerResponse: info.messageId || 'OK' };
  } catch (err) {
    logger.error('Email adapter send failure', { error: err.message, to });
    return { status: 'FAILED', providerResponse: err.message };
  }
}

module.exports = { send };
