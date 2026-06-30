const { z } = require('zod');
const path = require('path');

require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  API_BASE_PATH: z.string().default('/api/v1'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  OTP_LENGTH: z.coerce.number().default(6),
  OTP_EXPIRES_IN_MINUTES: z.coerce.number().default(5),
  OTP_MAX_REQUESTS_PER_WINDOW: z.coerce.number().default(3),
  OTP_REQUEST_WINDOW_MINUTES: z.coerce.number().default(10),
  OTP_MAX_VERIFY_ATTEMPTS: z.coerce.number().default(5),

  ANONYMOUS_PIN_LENGTH: z.coerce.number().default(6),

  REOPEN_WINDOW_DAYS: z.coerce.number().default(7),
  REOPEN_MAX_COUNT: z.coerce.number().default(2),

  ESCALATION_ASSIGNMENT_BREACH_DAYS: z.coerce.number().default(2),
  ESCALATION_MANDAL_LEVEL1_DAYS: z.coerce.number().default(7),
  ESCALATION_DISTRICT_LEVEL2_DAYS: z.coerce.number().default(15),
  ESCALATION_SCHEDULER_CRON: z.string().default('*/15 * * * *'),

  MAX_IMAGE_SIZE_BYTES: z.coerce.number().default(10485760),
  MAX_DOCUMENT_SIZE_BYTES: z.coerce.number().default(20971520),
  MAX_VIDEO_SIZE_BYTES: z.coerce.number().default(52428800),

  UPLOAD_TEMP_DIR: z.string().default('./tmp/uploads'),

  STORAGE_PROVIDER: z.string().default('cloudinary'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  EMAIL_PROVIDER: z.string().default('smtp'),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_SECURE: z.coerce.boolean().optional().default(false),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASSWORD: z.string().optional().default(''),
  SMTP_FROM_NAME: z.string().default('Sachivalayam Grievance System'),
  SMTP_FROM_EMAIL: z.string().default('no-reply@example.gov.in'),

  SMS_PROVIDER: z.string().default('sandbox'),
  SMS_API_KEY: z.string().optional().default(''),
  SMS_SENDER_ID: z.string().default('SCMSYS'),

  WHATSAPP_PROVIDER: z.string().default('sandbox'),
  WHATSAPP_API_KEY: z.string().optional().default(''),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional().default(''),

  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),

  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().default(15),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(300),

  LOG_LEVEL: z.string().default('info')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

env.CORS_ALLOWED_ORIGINS_LIST = env.CORS_ALLOWED_ORIGINS.split(',').map((s) => s.trim());
env.IS_PRODUCTION = env.NODE_ENV === 'production';
env.IS_TEST = env.NODE_ENV === 'test';

module.exports = env;
