const { z } = require('zod');
const { CATEGORY_CODES } = require('../../config/constants');

const multilingualTextSchema = z.object({
  te: z.string().trim().min(1),
  en: z.string().trim().min(1),
  hi: z.string().trim().min(1)
});

const createCategorySchema = z.object({
  code: z.enum(CATEGORY_CODES),
  name: multilingualTextSchema,
  isSensitive: z.boolean().optional(),
  defaultDepartmentId: z.string().min(1),
  slaOverrideDays: z
    .object({
      assignment: z.number().int().positive().nullable().optional(),
      resolution: z.number().int().positive().nullable().optional()
    })
    .optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional()
});

const updateCategorySchema = createCategorySchema.partial();

const categoryIdParamSchema = z.object({ id: z.string().min(1) });

module.exports = { createCategorySchema, updateCategorySchema, categoryIdParamSchema };
