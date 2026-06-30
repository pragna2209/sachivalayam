const { z } = require('zod');

const uploadEvidenceParamsSchema = z.object({
  id: z.string().min(1)
});

const uploadEvidenceBodySchema = z.object({
  uploadedAtStage: z.string().trim().min(1).max(50).optional()
});

const evidenceIdParamSchema = z.object({
  id: z.string().min(1)
});

module.exports = { uploadEvidenceParamsSchema, uploadEvidenceBodySchema, evidenceIdParamSchema };
