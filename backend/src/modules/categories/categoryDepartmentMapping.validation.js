const { z } = require('zod');

const createMappingSchema = z.object({
  categoryId: z.string().min(1),
  departmentId: z.string().min(1),
  isPrimary: z.boolean().optional()
});

const updateMappingSchema = z.object({
  isPrimary: z.boolean().optional()
});

const mappingIdParamSchema = z.object({ id: z.string().min(1) });

const mappingQuerySchema = z.object({
  categoryId: z.string().optional(),
  departmentId: z.string().optional()
});

module.exports = { createMappingSchema, updateMappingSchema, mappingIdParamSchema, mappingQuerySchema };
