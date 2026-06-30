const multer = require('multer');
const fs = require('fs');
const path = require('path');
const FileType = require('file-type');
const env = require('../../config/env');
const { FILE_TYPE, ALLOWED_MIME_TYPES } = require('../../config/constants');
const { BadRequestError } = require('../../utils/appError');

// Largest of the three size caps is used as multer's hard ceiling so the
// stream is rejected early (storage-exhaustion DoS prevention via
// streaming size-limit, not post-upload rejection - Section 9.4). The
// precise per-type cap is enforced again below once the real file type
// is known via content-sniffing.
const ABSOLUTE_MAX_BYTES = Math.max(
  env.MAX_IMAGE_SIZE_BYTES,
  env.MAX_DOCUMENT_SIZE_BYTES,
  env.MAX_VIDEO_SIZE_BYTES
);

if (!fs.existsSync(env.UPLOAD_TEMP_DIR)) {
  fs.mkdirSync(env.UPLOAD_TEMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.UPLOAD_TEMP_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: ABSOLUTE_MAX_BYTES },
  fileFilter: (req, file, cb) => {
    // First-pass filter on the client-declared MIME type, purely to reject
    // obviously-wrong uploads fast. This is NOT the security boundary -
    // the real check happens after upload via content-sniffing below.
    const allAllowed = Object.values(ALLOWED_MIME_TYPES).flat();
    if (!allAllowed.includes(file.mimetype)) {
      return cb(new BadRequestError('evidence.invalidFileType'));
    }
    return cb(null, true);
  }
});

function resolveFileTypeCategory(sniffedMime) {
  for (const [category, mimes] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (mimes.includes(sniffedMime)) return category;
  }
  return null;
}

function getMaxSizeForCategory(category) {
  if (category === FILE_TYPE.IMAGE) return env.MAX_IMAGE_SIZE_BYTES;
  if (category === FILE_TYPE.DOCUMENT) return env.MAX_DOCUMENT_SIZE_BYTES;
  if (category === FILE_TYPE.VIDEO) return env.MAX_VIDEO_SIZE_BYTES;
  return 0;
}

/**
 * Runs AFTER multer has written the file to local temp storage. Re-reads
 * the first bytes of the actual file content (magic-byte sniffing via
 * file-type) and verifies that the REAL file type matches an allowed
 * category, regardless of what extension or Content-Type header the
 * client sent. This is the actual security boundary described in
 * Section 9.4 - a renamed .exe pretending to be a .jpg is caught here
 * because its magic bytes don't match any allowed image signature.
 *
 * Also re-enforces the per-category size cap now that the real category
 * is known (a video disguised as a small "image" upload would have
 * already been capped by ABSOLUTE_MAX_BYTES at the multer layer, but this
 * gives the precise, correct-for-its-type limit).
 */
async function verifyFileContent(req, res, next) {
  try {
    if (!req.file && !req.files) return next();

    const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];

    for (const file of files) {
      const detected = await FileType.fromFile(file.path);

      if (!detected) {
        cleanupFile(file.path);
        throw new BadRequestError('evidence.invalidFileType');
      }

      const category = resolveFileTypeCategory(detected.mime);
      if (!category) {
        cleanupFile(file.path);
        throw new BadRequestError('evidence.invalidFileType');
      }

      const maxSize = getMaxSizeForCategory(category);
      if (file.size > maxSize) {
        cleanupFile(file.path);
        throw new BadRequestError('evidence.fileTooLarge');
      }

      // Attach the content-sniffed truth to the file object so the
      // evidence service trusts THIS, not the client-supplied mimetype.
      file.detectedMimeType = detected.mime;
      file.detectedCategory = category;
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

function cleanupFile(filePath) {
  fs.unlink(filePath, () => {});
}

module.exports = { upload, verifyFileContent, cleanupFile };
