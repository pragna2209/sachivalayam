const cloudinary = require('cloudinary').v2;
const env = require('./env');

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Uploads a local file buffer/path to object storage and returns a stable
 * storage descriptor. This is the ONLY place in the codebase that talks to
 * the storage provider directly - swapping providers means editing this
 * file alone, nothing in the evidence module changes.
 */
async function uploadToStorage(localFilePath, { folder, resourceType }) {
  const result = await cloudinary.uploader.upload(localFilePath, {
    folder,
    resource_type: resourceType, // 'image' | 'video' | 'raw'
    use_filename: true,
    unique_filename: true,
    overwrite: false
  });

  return {
    storageUrl: result.secure_url,
    storageKey: result.public_id,
    bytes: result.bytes
  };
}

async function deleteFromStorage(storageKey, resourceType) {
  await cloudinary.uploader.destroy(storageKey, { resource_type: resourceType });
}

function getSignedUrl(storageKey, resourceType) {
  // Short-lived signed URL generation so evidence files are never served
  // as permanently-public direct links.
  const expiresAtSeconds = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes
  return cloudinary.utils.private_download_url(storageKey, undefined, {
    resource_type: resourceType,
    type: 'upload',
    expires_at: expiresAtSeconds
  });
}

module.exports = { uploadToStorage, deleteFromStorage, getSignedUrl };
