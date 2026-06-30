export function isValidPhoneNumber(value) {
  return /^[0-9]{10}$/.test(value || '');
}

export function isValidOtp(value) {
  return /^[0-9]{4,8}$/.test(value || '');
}

export function isValidPincode(value) {
  return /^[0-9]{6}$/.test(value || '');
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
}

export function isValidAadhaar(value) {
  return /^[0-9]{12}$/.test(value || '');
}

export function isValidPin6(value) {
  return /^[0-9]{6}$/.test(value || '');
}

export function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function minLength(value, n) {
  return typeof value === 'string' && value.trim().length >= n;
}
