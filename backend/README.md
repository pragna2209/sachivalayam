# Sachivalayam Citizen Grievance & Complaint Management System — Backend

Production backend for the Sachivalayam Citizen Grievance & Complaint Management System, implementing the architecture approved in the system design phase: Node.js + Express + MongoDB (Mongoose) + JWT + Multer.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB via Mongoose
- **Auth:** JWT (access + refresh tokens), phone-number + OTP (no passwords anywhere)
- **File uploads:** Multer + magic-byte content-sniffing (`file-type`) before anything is trusted or stored
- **Object storage:** Cloudinary (swappable — see `src/config/storage.js`)
- **Validation:** Zod, at the route boundary, before any controller logic runs
- **Scheduling:** node-cron, running in a separate worker process
- **i18n:** Telugu / English / Hindi, resolved server-side for every API message

## Project Structure

```
src/
  config/        env, db, storage, constants
  modules/       one folder per domain: auth, users, staff, complaints, anonymous,
                 assignment, escalation, evidence, notifications, geo, categories,
                 departments, analytics, reports, audit, activity, settings
  middlewares/   verifyJWT, requireRole, scopeToJurisdiction, validate, rateLimiter,
                 errorHandler, requestLogger, auditLogger, trackActivity
  i18n/          te.json / en.json / hi.json + resolver
  utils/         logger, apiResponse, jwt, otpGenerator, pagination, appError, etc.
  tests/         unit/ (no DB required) and integration/ (real MongoDB required)
  app.js         Express app assembly
  server.js      API entry point
worker.js        Background Worker entry point (escalation scheduler)
scripts/         seedGeoHierarchy.js, seedCategories.js, createIndexes.js
```

Every module follows the same internal shape: `*.model.js`, `*.service.js`, `*.controller.js`, `*.routes.js`, `*.validation.js`.

## Getting Started

```bash
npm install
cp .env.example .env
# edit .env: at minimum set MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
```

Both JWT secrets must be at least 16 characters — the app validates this at boot via `src/config/env.js` and will refuse to start otherwise.

### Run the API

```bash
npm run dev      # nodemon, local development
npm start        # production
```

The API listens on `PORT` (default 5000) under `API_BASE_PATH` (default `/api/v1`). Health check: `GET /api/v1/health`.

### Run the Background Worker

The escalation scheduler runs as a **separate process**, matching the approved architecture's two-service topology (API + Worker, both reading the same MongoDB):

```bash
npm run worker        # production
npm run worker:dev    # nodemon
```

### Seed reference data

```bash
npm run seed:geo          # State -> District -> Mandal -> Village -> Sachivalayam sample tree
npm run seed:categories   # 15 departments, all complaint categories incl. the 5 sensitive ones
npm run create:indexes    # explicit index creation (see "Indexes" below)
```

After seeding, create your first Admin account directly in MongoDB (there is deliberately no public "create admin" endpoint):

```js
db.users.insertOne({
  role: "ADMIN",
  phoneNumber: "9999999999",
  name: "System Admin",
  email: "admin@example.gov.in",
  preferredLanguage: "en",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

From there, the Admin can log in via `/auth/otp/request` + `/auth/otp/verify` (purpose `LOGIN`) and provision all other staff/officer accounts through `POST /staff`.

## Indexes

`autoIndex` is disabled in production (`src/config/db.js`) by design — index creation is an explicit, observable migration step (`npm run create:indexes`), not an implicit side effect of the app booting. Run it once per environment after deploying schema changes.

## Testing

```bash
npm test
```

- **Unit tests** (`src/tests/unit/`) — lifecycle FSM, escalation SLA-query builders, Zod validation schemas. No database required; these run anywhere, including this sandbox.
- **Integration tests** (`src/tests/integration/`) — exercise the complaint lifecycle against a **real** MongoDB connection. They self-skip unless `INTEGRATION_TEST_MONGODB_URI` is set:

```bash
INTEGRATION_TEST_MONGODB_URI=mongodb://127.0.0.1:27017/sachivalayam_test npx jest src/tests/integration
```

## Key Architectural Points Implemented Here

- **Auth:** phone + OTP only, no passwords, salted-hashed OTP storage, TTL auto-expiry, rate-limited request/verify.
- **RBAC + jurisdiction scoping:** `verifyJWT` → `requireRole` → `scopeToJurisdiction`, with every complaints-service query re-applying the jurisdiction filter at the data layer as defense-in-depth (a controller bug alone can't leak cross-jurisdiction data).
- **Complaint lifecycle:** explicit finite-state machine (`complaintLifecycle.fsm.js`) — no status transition happens without passing through `assertValidTransition`.
- **Assignment Engine:** auto-routes by Category → Department → Sachivalayam Staff; if no staff is mapped, the complaint is escalated to the Mandal Officer **immediately** rather than waiting out the 2-day SLA blind.
- **Escalation Engine:** three idempotent SLA queries (2-day unassigned / 7-day unresolved / 15-day unresolved), safe to re-run on any cron interval without duplicate escalations, full history retained per complaint.
- **Notifications:** single `NotificationService.dispatch()` fans out to In-App / Email / SMS / WhatsApp adapters behind one interface — swapping a real SMS/WhatsApp gateway in later is a config + adapter change only.
- **File uploads:** server never trusts the client's declared MIME type or file extension — every upload is re-verified via magic-byte content-sniffing after Multer writes it to temp storage, then capped by the real per-type size limit before being pushed to object storage.
- **Audit trail:** `audit_logs` is append-only by construction — there is no update or delete route for it anywhere in the API, including for Admin.
- **i18n:** every server-generated message resolves through `src/i18n` into the caller's `preferredLanguage` (or `Accept-Language` header) before it reaches the response.

## Environment Variables

See `.env.example` for the full list with inline documentation. Nothing in this codebase reads an environment variable directly — they all go through the validated loader in `src/config/env.js`, which fails fast at boot if anything required is missing or malformed.

## Deployment (Render)

Per the approved architecture: deploy this repository as **two** Render services sharing one MongoDB Atlas connection string —

1. **`sachivalayam-api`** — Web Service, start command `npm start`
2. **`sachivalayam-worker`** — Background Worker, start command `npm run worker`

Object storage (Cloudinary or any S3-compatible provider) and MongoDB are both external managed services — Render does not host either natively, and Render's own disk is ephemeral, which is why evidence files are never written to local disk for anything beyond temporary upload staging (`UPLOAD_TEMP_DIR`).
