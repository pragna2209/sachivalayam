import { FILE_LIMITS } from './constants';

/**
 * Client-side file validation. This is UX speed only — a fast no-network
 * rejection of an obviously wrong file. The server independently
 * re-validates every upload via magic-byte content-sniffing regardless of
 * what passes here, so this function intentionally does not need to be
 * airtight; it just needs to give the citizen/staff member quick feedback.
 */
export function validateFile(file) {
  if (!file) return { valid: false, reason: 'noFile' };

  const category = Object.keys(FILE_LIMITS).find((key) => FILE_LIMITS[key].types.includes(file.type));

  if (!category) {
    return { valid: false, reason: 'invalidType' };
  }

  if (file.size > FILE_LIMITS[category].maxBytes) {
    return { valid: false, reason: 'tooLarge', category };
  }

  return { valid: true, category };
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
