/**
 * Explicitly creates all indexes defined across the Mongoose schemas.
 * Run as a one-off Render Job / manual script (Section 13.4) rather than
 * relying on Mongoose's autoIndex, which is disabled in production
 * (see src/config/db.js) specifically so index creation is a deliberate,
 * observable migration step rather than an implicit side effect of the
 * app booting.
 */
const { connectDB, disconnectDB, mongoose } = require('../src/config/db');
const logger = require('../src/utils/logger');

// Import every model so its schema-defined indexes are registered.
require('../src/modules/users/users.model');
require('../src/modules/auth/otpRequest.model');
require('../src/modules/anonymous/anonymous.model');
require('../src/modules/geo/geo.model');
require('../src/modules/departments/departments.model');
require('../src/modules/categories/categories.model');
require('../src/modules/categories/categoryDepartmentMapping.model');
require('../src/modules/complaints/complaints.model');
require('../src/modules/evidence/evidence.model');
require('../src/modules/notifications/notifications.model');
require('../src/modules/notifications/notificationDeliveryLog.model');
require('../src/modules/audit/audit.model');
require('../src/modules/activity/activity.model');
require('../src/modules/settings/settings.model');

async function createAllIndexes() {
  await connectDB();
  logger.info('Connected to MongoDB - creating indexes for all registered models');

  const modelNames = mongoose.modelNames();
  for (const modelName of modelNames) {
    const model = mongoose.model(modelName);
    await model.createIndexes();
    logger.info(`Indexes ensured for model: ${modelName}`);
  }

  logger.info('All indexes created successfully');
  await disconnectDB();
  process.exit(0);
}

createAllIndexes().catch((err) => {
  logger.error('Index creation failed', { error: err.message, stack: err.stack });
  process.exit(1);
});
