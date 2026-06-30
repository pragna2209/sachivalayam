const crypto = require('crypto');

/**
 * Generates a numeric OTP of the given length using a cryptographically
 * secure random source (never Math.random for anything security-relevant).
 */
function generateNumericCode(length) {
  const digits = '0123456789';
  let code = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i += 1) {
    code += digits[bytes[i] % 10];
  }
  return code;
}

function generateOtp(length = 6) {
  return generateNumericCode(length);
}

function generatePin(length = 6) {
  return generateNumericCode(length);
}

module.exports = { generateOtp, generatePin };
