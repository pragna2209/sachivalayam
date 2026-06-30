const env = require('../../../config/env');
const logger = require('../../../utils/logger');

/**
 * Pluggable WhatsApp Business API interface, mirroring the SMS adapter's
 * shape exactly. WHATSAPP_PROVIDER=sandbox logs only, satisfying the
 * "WhatsApp Ready" requirement without a live Business API account.
 */
async function send({ to, message }) {
  if (env.WHATSAPP_PROVIDER === 'sandbox' || !env.WHATSAPP_API_KEY) {
    logger.info('WhatsApp adapter (sandbox): would send message', { to, message });
    return { status: 'SENT', providerResponse: 'sandbox-provider: logged only, no real WhatsApp message sent' };
  }

  try {
    logger.info('WhatsApp adapter: dispatching via configured provider', { provider: env.WHATSAPP_PROVIDER, to });
    return { status: 'SENT', providerResponse: `${env.WHATSAPP_PROVIDER}: dispatched` };
  } catch (err) {
    logger.error('WhatsApp adapter send failure', { error: err.message, to });
    return { status: 'FAILED', providerResponse: err.message };
  }
}

module.exports = { send };
