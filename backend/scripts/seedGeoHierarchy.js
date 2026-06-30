/**
 * Seeds a minimal but realistic geo-hierarchy tree so the complaint form,
 * staff jurisdiction assignment, and analytics dashboards have real data
 * to work against in a fresh environment. Idempotent: re-running this
 * script will not create duplicates because each level's compound index
 * (parentId + code) is checked before insertion.
 */
const { connectDB, disconnectDB } = require('../src/config/db');
const { State, District, Mandal, Village, Sachivalayam } = require('../src/modules/geo/geo.model');
const logger = require('../src/utils/logger');

async function upsertNode(Model, filter, data) {
  const existing = await Model.findOne(filter);
  if (existing) return existing;
  return Model.create({ ...filter, ...data });
}

async function seed() {
  await connectDB();
  logger.info('Seeding geo-hierarchy...');

  const state = await upsertNode(
    State,
    { code: 'AP' },
    { name: { te: 'ఆంధ్రప్రదేశ్', en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश' }, parentId: null }
  );

  const district = await upsertNode(
    District,
    { code: 'KRNL', parentId: state._id },
    { name: { te: 'కర్నూలు', en: 'Kurnool', hi: 'कुर्नूल' } }
  );

  const mandal = await upsertNode(
    Mandal,
    { code: 'KRNL-M01', parentId: district._id },
    { name: { te: 'కర్నూలు మండలం', en: 'Kurnool Mandal', hi: 'कुर्नूल मंडल' } }
  );

  const village = await upsertNode(
    Village,
    { code: 'KRNL-M01-V01', parentId: mandal._id },
    { name: { te: 'గ్రామం 1', en: 'Village 1', hi: 'गांव 1' } }
  );

  await upsertNode(
    Sachivalayam,
    { code: 'KRNL-M01-V01-S01', parentId: village._id },
    { name: { te: 'సచివాలయం 1', en: 'Sachivalayam 1', hi: 'सचिवालय 1' } }
  );

  logger.info('Geo-hierarchy seed complete');
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  logger.error('Geo-hierarchy seed failed', { error: err.message, stack: err.stack });
  process.exit(1);
});
