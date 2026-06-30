const { v4: uuidv4 } = require('uuid');

/**
 * Generates a human-readable, sufficiently-unique complaint number.
 * Format: SCM-<YEAR>-<7 random digits derived from a UUID>
 * Uniqueness is enforced at the database layer via a unique index on
 * complaintNumber; this generator is statistically collision-resistant
 * but the model layer still treats the unique index as the source of truth.
 */
function generateComplaintNumber() {
  const year = new Date().getFullYear();
  const raw = uuidv4().replace(/-/g, '');
  const numericPart = raw
    .split('')
    .map((ch) => parseInt(ch, 16) % 10)
    .join('')
    .slice(0, 7);
  return `SCM-${year}-${numericPart}`;
}

module.exports = { generateComplaintNumber };
