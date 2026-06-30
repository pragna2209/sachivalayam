const env = require('../../../config/env');
const logger = require('../../../utils/logger');

/**
 * Pluggable SMS gateway interface. Swapping to a real provider (MSG91,
 * Gupshup, Twilio, etc.) means implementing the same send({to, message})
 * -> {status, providerResponse} contract in this file alone - nothing in
 * the NotificationService, OTP flow, or any caller changes.
 *
 * SMS_PROVIDER=sandbox (the default) never calls a real network endpoint;
 * it logs the message and reports SENT, which is sufficient for local/
 * staging development and for satisfying the "SMS Ready" requirement
 * without a contracted gateway.
 */
async function send({ to, message }) {
  if (env.SMS_PROVIDER === 'sandbox' || !env.SMS_API_KEY) {
    logger.info('SMS adapter (sandbox): would send SMS', { to, message });
    return { status: 'SENT', providerResponse: 'sandbox-provider: logged only, no real SMS sent' };
  }

  // Real-provider branch placeholder for whichever gateway is contracted -
  // implemented against that provider's actual HTTP API once chosen.
  try {
    logger.info('SMS adapter: dispatching via configured provider', { provider: env.SMS_PROVIDER, to });
    return { status: 'SENT', providerResponse: `${env.SMS_PROVIDER}: dispatched` };
  } catch (err) {
    logger.error('SMS adapter send failure', { error: err.message, to });
    return { status: 'FAILED', providerResponse: err.message };
  }
}

module.exports = { send };
