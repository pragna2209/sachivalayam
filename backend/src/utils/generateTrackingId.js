const { v4: uuidv4 } = require('uuid');

/**
 * Generates a tracking ID for anonymous complaints, deliberately formatted
 * identically to a normal complaint number style (SCM-<year>-<digits>) so
 * the format itself never signals "this complaint is anonymous" to anyone
 * intercepting it.
 */
function generateTrackingId() {
  const year = new Date().getFullYear();
  const raw = uuidv4().replace(/-/g, '');
  const numericPart = raw
    .split('')
    .map((ch) => parseInt(ch, 16) % 10)
    .join('')
    .slice(0, 7);
  return `SCM-${year}-${numericPart}`;
}

module.exports = { generateTrackingId };
