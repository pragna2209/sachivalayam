# Sachivalayam Citizen Grievance & Complaint Management System — Frontend

React + Vite + Tailwind CSS frontend implementing the approved architecture: citizen/staff/officer/admin dashboards, complaint submission and tracking, anonymous reporting, notifications, analytics, multilingual UI (Telugu/English/Hindi), dark mode, and PWA support.

## Tech Stack

- **Build tool:** Vite
- **UI:** React 18, Tailwind CSS
- **Routing:** React Router v6 (role-guarded)
- **HTTP:** Axios, with automatic JWT refresh-token retry
- **State:** Zustand (auth, theme, language, notifications)
- **i18n:** i18next / react-i18next, instant client-side language switching
- **Charts:** Recharts
- **PWA:** vite-plugin-pwa

## Design System

A civic-teal palette (`#0F3D3E` primary, warm paper background, terracotta-rust reserved for escalation/urgent states only) with Fraunces for headings and Inter for body text. The recurring signature motif is the **status-thread** — a vertical connector with filled/hollow nodes — used in the complaint timeline, the sidebar's active-nav indicator, and the landing page's "how it works" steps, echoing the literal subject matter: a complaint's progression through a chain of custody and escalation. See `tailwind.config.js` for the full token set and `src/styles/tailwind.css` for the `.status-thread` / `.status-node` component classes.

## Project Structure

Matches the approved architecture's frontend folder structure exactly:

```
src/
  routes/        per-role route tables (Public/Citizen/Staff/Officer/Admin), assembled in index.jsx
  pages/         public/, citizen/, staff/, officer/, admin/
  components/    common/, complaint/, map/, upload/, analytics/, auth/
  layouts/       PublicLayout, CitizenLayout (shared shell reused by Staff/Officer/Admin)
  store/         Zustand: authStore, themeStore, languageStore, notificationStore
  api/           axiosClient + one file per backend module
  hooks/         useAuth, useNotifications, useDebounce, useGeoHierarchy
  i18n/          en.json, te.json, hi.json + resolver
  utils/         constants, validators, fileValidation, dateFormat
```

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api` to `VITE_API_PROXY_TARGET` (default `http://localhost:5000`) — point this at the `sachivalayam-backend` API service from the companion backend project.

### Build for production

```bash
npm run build
npm run preview   # serve the production build locally to verify it
```

Output goes to `dist/`. For deployment, set `VITE_API_BASE_URL` to the deployed API's absolute URL before building (Vite inlines env vars at build time, not at runtime).

## Known Backend Integration Gaps

Two gaps were found while wiring this frontend against the actual backend API (audited and confirmed in `sachivalayam-backend`, not assumed):

1. **Anonymous complaint evidence upload.** `POST /anonymous/complaints` returns only `{ trackingId, complaintNumber }` — it does not return the complaint's internal `_id`, which the evidence upload route (`POST /complaints/:id/evidence`) requires. `AnonymousComplaintPage.jsx` therefore cannot forward evidence files captured in the form; it surfaces this to the citizen with an inline message rather than silently dropping the files. Fixing this requires a backend change (either accept evidence inline at anonymous-complaint creation, or return the internal id since the upload route already supports unauthenticated callers via `optionalAuth`).
2. **No evidence-by-complaint listing endpoint.** `GET /complaints/:id` does not populate or return evidence files, and there is no `GET /complaints/:id/evidence` list route — only upload-by-complaint and fetch-one-by-evidence-id exist. `ComplaintDetailPage.jsx`'s evidence gallery is wired defensively (renders its empty state) and the gap is documented inline in the component with a code comment, rather than calling a route that doesn't exist.

Both are flagged in code comments at the exact call sites so a backend update can wire them up without hunting for where the frontend expects them.

## Roles & Routing

| Role | Home route | Layout |
|---|---|---|
| Citizen | `/citizen/dashboard` | CitizenLayout |
| Sachivalayam Staff | `/staff/dashboard` | StaffLayout |
| Mandal/District Officer | `/officer/dashboard` | OfficerLayout |
| Admin | `/admin/dashboard` | AdminLayout |

`RoleGuard` (`src/components/auth/RoleGuard.jsx`) enforces role access client-side; the backend's own RBAC + jurisdiction scoping remains the real authorization boundary — this guard only prevents an authenticated user from navigating into a UI shell that isn't theirs.

The complaint detail page (`/complaints/:id`) is shared across all four roles and renders different action panels (citizen feedback/reopen, staff status update, officer reassign/escalate) based on `user.role`, mirroring how the backend's single `GET /complaints/:id` endpoint already scopes visibility by jurisdiction.

## Multilingual Support

Telugu, English, and Hindi translation bundles live in `src/i18n/*.json`, structurally identical so every key resolves safely. Switching is instant (no reload) via `LanguageSwitcher` in the header, persisted to `localStorage` and synced to the user's profile `preferredLanguage` field when logged in. Citizen-authored free text (complaint titles/descriptions/remarks) is never machine-translated — it displays exactly as written regardless of the active UI language, matching the backend's design intent.
