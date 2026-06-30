const { z } = require('zod');
const { GEO_LEVELS } = require('../../config/constants');

const multilingualNameSchema = z.object({
  te: z.string().trim().min(1),
  en: z.string().trim().min(1),
  hi: z.string().trim().min(1)
});

const createGeoNodeSchema = z.object({
  parentId: z.string().min(1).optional(),
  code: z.string().trim().min(1).max(20),
  name: multilingualNameSchema,
  isActive: z.boolean().optional()
});

const updateGeoNodeSchema = z.object({
  code: z.string().trim().min(1).max(20).optional(),
  name: multilingualNameSchema.partial().optional(),
  isActive: z.boolean().optional()
});

const geoLevelParamSchema = z.object({
  level: z.enum(GEO_LEVELS)
});

const geoLevelIdParamSchema = z.object({
  level: z.enum(GEO_LEVELS),
  id: z.string().min(1)
});

const geoIdParamSchema = z.object({
  id: z.string().min(1)
});

module.exports = {
  createGeoNodeSchema,
  updateGeoNodeSchema,
  geoLevelParamSchema,
  geoLevelIdParamSchema,
  geoIdParamSchema
};
