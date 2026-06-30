const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const env = require('./config/env');
const requestLogger = require('./middlewares/requestLogger.middleware');
const { globalLimiter } = require('./middlewares/rateLimiter.middleware');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler.middleware');
const { success } = require('./utils/apiResponse');

// Module routers
const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const staffRoutes = require('./modules/staff/staff.routes');
const complaintsRoutes = require('./modules/complaints/complaints.routes');
const anonymousRoutes = require('./modules/anonymous/anonymous.routes');
const { nestedRouter: evidenceNestedRouter, standaloneRouter: evidenceStandaloneRouter } = require('./modules/evidence/evidence.routes');
const geoRoutes = require('./modules/geo/geo.routes');
const { router: categoriesRoutes, mappingsRouter: categoryDepartmentMappingsRoutes } = require('./modules/categories/categories.routes');
const departmentsRoutes = require('./modules/departments/departments.routes');
const { router: notificationsRoutes, anonymousRouter: anonymousNotificationsRoutes } = require('./modules/notifications/notifications.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const reportsRoutes = require('./modules/reports/reports.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const activityRoutes = require('./modules/activity/activity.routes');
const settingsRoutes = require('./modules/settings/settings.routes');

const app = express();

// --- Security & cross-cutting middleware (Section 9 of approved architecture) ---
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ALLOWED_ORIGINS_LIST,
    credentials: true
  })
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(mongoSanitize()); // strips $ and . operators from req.body/query/params to prevent NoSQL injection
app.use(hpp()); // protects against HTTP parameter pollution
app.use(requestLogger);
app.use(globalLimiter);

// --- Health check (Section 13.1: monitored by Render's health-check) ---
app.get(`${env.API_BASE_PATH}/health`, (req, res) => {
  return success(res, { data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// --- Module routes, mounted under the versioned API base path ---
const base = env.API_BASE_PATH;

app.use(`${base}/auth`, authRoutes);
app.use(`${base}/users`, usersRoutes);
app.use(`${base}/staff`, staffRoutes);
app.use(`${base}/complaints`, complaintsRoutes);
app.use(`${base}/complaints/:id/evidence`, evidenceNestedRouter);
app.use(`${base}/evidence`, evidenceStandaloneRouter);
app.use(`${base}/anonymous`, anonymousRoutes);
app.use(`${base}/anonymous/notifications`, anonymousNotificationsRoutes);
app.use(`${base}/geo`, geoRoutes);
app.use(`${base}/categories`, categoriesRoutes);
app.use(`${base}/category-department-mappings`, categoryDepartmentMappingsRoutes);
app.use(`${base}/departments`, departmentsRoutes);
app.use(`${base}/notifications`, notificationsRoutes);
app.use(`${base}/analytics`, analyticsRoutes);
app.use(`${base}/reports`, reportsRoutes);
app.use(`${base}/audit-logs`, auditRoutes);
app.use(`${base}/activity-logs`, activityRoutes);
app.use(`${base}/settings`, settingsRoutes);

// --- 404 and central error handler (must be mounted last, in this order) ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
