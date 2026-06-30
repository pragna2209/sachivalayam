const { z } = require('zod');

const updateSettingSchema = z.object({
  value: z.union([z.string(), z.number(), z.boolean(), z.record(z.any())]),
  description: z.string().trim().max(500).optional()
});

const settingKeyParamSchema = z.object({
  key: z.string().trim().min(1).max(100)
});

module.exports = { updateSettingSchema, settingKeyParamSchema };
