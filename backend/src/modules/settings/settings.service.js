const SystemSetting = require('./settings.model');

async function listSettings() {
  return SystemSetting.find().sort({ key: 1 }).lean();
}

async function getSetting(key) {
  return SystemSetting.findOne({ key }).lean();
}

/**
 * Upserts a setting. System settings are deliberately schemaless on the
 * value field (Mixed type) so new tunables (SLA day thresholds, reopen
 * window, file size caps, language defaults - Section 3.5) can be added
 * without a migration, while still being centrally listable/auditable.
 */
async function upsertSetting(key, { value, description }, updatedBy) {
  const setting = await SystemSetting.findOneAndUpdate(
    { key },
    { $set: { value, description: description || '', updatedBy } },
    { new: true, upsert: true, runValidators: true }
  );
  return setting;
}

module.exports = { listSettings, getSetting, upsertSetting };
