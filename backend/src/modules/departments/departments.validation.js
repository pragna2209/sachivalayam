const { z } = require('zod');

const multilingualTextSchema = z.object({
  te: z.string().trim().min(1),
  en: z.string().trim().min(1),
  hi: z.string().trim().min(1)
});

const createDepartmentSchema = z.object({
  name: multilingualTextSchema,
  description: multilingualTextSchema,
  isActive: z.boolean().optional()
});

const updateDepartmentSchema = z.object({
  name: multilingualTextSchema.partial().optional(),
  description: multilingualTextSchema.partial().optional(),
  isActive: z.boolean().optional()
});

const departmentIdParamSchema = z.object({ id: z.string().min(1) });

module.exports = { createDepartmentSchema, updateDepartmentSchema, departmentIdParamSchema };
