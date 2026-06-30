const mongoose = require('mongoose');

const { Schema } = mongoose;

const multilingualNameSchema = new Schema(
  {
    te: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
    hi: { type: String, required: true, trim: true }
  },
  { _id: false }
);

/**
 * Factory that builds a Mongoose schema for one level of the geo-hierarchy
 * tree. All four levels (District, Mandal, Village, Sachivalayam) share an
 * identical shape - only the parentRef and collection name differ - so the
 * schema is generated once here instead of being hand-duplicated four times.
 *
 * isTopLevel marks District as having NO required parent - State exists in
 * the model only for schema completeness (so a future multi-state rollout
 * has somewhere to extend to) but is never created or selected through the
 * API in this deployment. District is the real top of the hierarchy that
 * Admin actually manages, matching geo.service.js's PARENT_LEVEL_BY_LEVEL
 * (district: null) and the Admin UI, which never asks for a District's
 * parent. Previously this was wired with parentRef='State' for District,
 * which made Mongoose require a parentId that nothing in the system could
 * ever supply - every District creation failed validation as a result.
 */
function buildGeoLevelSchema(parentRef, { isTopLevel = false } = {}) {
  const hasRequiredParent = !!parentRef && !isTopLevel;

  const parentIdField = parentRef
    ? { type: Schema.Types.ObjectId, ref: parentRef, default: null, required: hasRequiredParent }
    : { type: Schema.Types.ObjectId, default: null, required: false };

  const schema = new Schema(
    {
      parentId: parentIdField,
      code: { type: String, required: true, trim: true, uppercase: true },
      name: { type: multilingualNameSchema, required: true },
      isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
  );

  schema.index({ parentId: 1, isActive: 1 });
  schema.index({ parentId: 1, code: 1 }, { unique: true });

  return schema;
}

const stateSchema = buildGeoLevelSchema(null);
const districtSchema = buildGeoLevelSchema('State', { isTopLevel: true });
const mandalSchema = buildGeoLevelSchema('District');
const villageSchema = buildGeoLevelSchema('Mandal');
const sachivalayamSchema = buildGeoLevelSchema('Village');

const State = mongoose.model('State', stateSchema);
const District = mongoose.model('District', districtSchema);
const Mandal = mongoose.model('Mandal', mandalSchema);
const Village = mongoose.model('Village', villageSchema);
const Sachivalayam = mongoose.model('Sachivalayam', sachivalayamSchema);

module.exports = { State, District, Mandal, Village, Sachivalayam };
