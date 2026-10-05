# Technical Documentation — LegacyCare

## 1. Architecture

```
┌──────────────────────┐      HTTPS / JSON       ┌─────────────────────────┐       ┌──────────────┐
│ React 19 + Vite SPA  │ ──────────────────────▶ │ Node.js + Express API   │ ────▶ │ MongoDB      │
│ Tailwind CSS v4      │  Authorization: Bearer  │ JWT · RBAC · AES-GCM    │       │ (Atlas)      │
│ (Vercel)             │ ◀────────────────────── │ Multer uploads (Render) │       └──────────────┘
└──────────────────────┘                         └─────────────────────────┘
```

- **Client** (`/client`): single-page app, route-level code splitting, Axios with token interceptor.
- **Server** (`/server`): stateless REST API, MVC structure (models / controllers / routes / middleware).
- **Database**: MongoDB via Mongoose ODM.

## 2. Folder structure

```
legacycare/
├── client/
│   ├── src/
│   │   ├── api/client.js            # Axios instance, auth header, file download helper
│   │   ├── context/AuthContext.jsx  # login / register / logout, current user
│   │   ├── components/              # UI kit, layouts, ServiceCard, PlanSummary, modals
│   │   ├── pages/public/            # Home, HowItWorks, Providers, FAQ, Login, Register
│   │   ├── pages/planner/           # Overview, Plans, PlanWizard (7 steps + review), PlanDetail
│   │   ├── pages/nominee/           # SharedPlans, NomineePlan (+ guidance checklist)
│   │   ├── pages/provider/          # Overview, Listings, ProviderRequests
│   │   ├── pages/admin/             # Overview (KPIs), Users, Providers, Categories, Disputes
│   │   ├── pages/common/            # Requests, Notifications, Account & help
│   │   └── utils/format.js          # currency, dates, label maps
│   └── vercel.json                  # SPA rewrites
└── server/
    └── src/
        ├── app.js / server.js
        ├── config/db.js
        ├── models/                  # User, Plan, Service, ServiceRequest, Document, Category, Dispute, Notification, Feedback
        ├── controllers/             # auth, plan, service, request, category, admin, misc
        ├── middleware/              # auth (protect/authorize), error, upload
        ├── routes/index.js
        └── utils/                   # crypto (AES-256-GCM), seed, notify, asyncHandler
```

## 3. Data model

### User
| Field | Type | Notes |
|---|---|---|
| name, email, phone, city | String | email unique, lower-case |
| password | String | bcrypt (12 rounds), `select: false` |
| role | enum | planner · nominee · provider · admin |
| status | enum | active · suspended |
| isVerified | Boolean | identity verified by admin |
| provider | sub-doc | businessName, licenseNumber, description, serviceAreas[], verificationStatus (pending/verified/rejected), verificationNote, verifiedAt |

### Plan
| Field | Notes |
|---|---|
| owner → User | indexed |
| title, status (draft/finalized), finalizedAt | |
| location { venue, city, state, notes }, disposition | |
| ritual { type, tradition, category → Category, details } | |
| officiant { preference, name, contact, notes } | |
| ceremony { music, prayers, customs, dressCode, otherInstructions } | **encrypted** |
| personalNotes | **encrypted** |
| selectedServices[] { service → Service, provider → User, priceAtSelection, note } | price frozen at selection |
| budget { estimate, limit, currency } | estimate auto-calculated |
| nominees[] { name, email, relation, phone (**encrypted**), accessGranted } | indexed on email |
| version, updateHistory[] | used for "plan update frequency" KPI |

### Other collections
- **Service**: provider, title, category, description, price, priceUnit, city, traditions[], isAvailable, availabilityNote, isActive
- **ServiceRequest**: plan, requester, provider, service, type (pre-booking / execution), message, preferredDate, status, providerNote, history[]
- **Document**: plan, owner, label, originalName, storedName (hidden), mimeType, size
- **Category**: name, kind (ritual/service), tradition, description, isActive
- **Dispute**: raisedBy, against, request, subject, message, priority, status, resolution
- **Notification**: user, message, link, read
- **Feedback**: user, rating (1–5), comment

## 4. Security design

| Concern | Implementation |
|---|---|
| Passwords | bcryptjs, 12 salt rounds, never returned in JSON |
| Sessions | JWT (HS256), 7-day expiry, sent as `Authorization: Bearer` |
| Role-based access | `protect` → loads user, blocks suspended; `authorize(...roles)` per route |
| Ownership | `loadPlan()` returns `owner` / `nominee` / 403; nominee only when plan is finalized **and** their email has `accessGranted` |
| Field encryption | `utils/crypto.js`: AES-256-GCM, random 12-byte IV per value, auth tag; stored as `enc:v1:iv:tag:cipher`; applied via Mongoose setters/getters |
| Files | Random file names, type whitelist, 5 MB limit, served only via `/api/documents/:id/download` after access check |
| HTTP hardening | Helmet, CORS allow-list, express-rate-limit on auth (50 / 15 min), JSON body limit 1 MB |
| Admin privacy | Admin endpoints expose counts and statuses only — no plan content |

## 5. REST API reference

Base URL: `/api`. 🔒 = requires `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | /auth/register | public | Register planner / nominee / provider |
| POST | /auth/login | public | Returns `{ token, user }` |
| GET | /auth/me | 🔒 any | Current user |
| PUT | /auth/me | 🔒 any | Update profile (providers: business details) |
| PUT | /auth/password | 🔒 any | Change password |

### Plans
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | /plans | 🔒 planner | My plans (+ completion %) |
| POST | /plans | 🔒 planner | Create plan |
| GET | /plans/shared | 🔒 any | Finalized plans shared with my email |
| GET | /plans/:id | 🔒 owner / nominee | Plan + documents + access level |
| PUT | /plans/:id | 🔒 owner | Update sections (bumps version) |
| DELETE | /plans/:id | 🔒 owner | Delete plan and files |
| POST | /plans/:id/finalize | 🔒 owner | Validate + finalize + notify nominees |
| POST | /plans/:id/reopen | 🔒 owner | Back to draft |
| POST | /plans/:id/services | 🔒 owner | `{ serviceId }` add service |
| DELETE | /plans/:id/services/:itemId | 🔒 owner | Remove service |
| POST | /plans/:id/nominees | 🔒 owner | Add nominee |
| PATCH | /plans/:id/nominees/:nomineeId | 🔒 owner | Update / toggle access |
| DELETE | /plans/:id/nominees/:nomineeId | 🔒 owner | Remove nominee |
| GET | /plans/:id/documents | 🔒 owner / nominee | List documents |
| POST | /plans/:id/documents | 🔒 owner | multipart `file`, `label` |
| GET | /documents/:docId/download | 🔒 owner / nominee | Download file |
| DELETE | /documents/:docId | 🔒 owner | Delete file |

### Services
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | /services | public | Directory. Query: `q, category, city, maxPrice, available, tradition, sort, page, limit` |
| GET | /services/cities | public | Cities with listings |
| GET | /services/:id | public | Service detail |
| GET | /services/mine/list | 🔒 provider | My listings |
| POST | /services | 🔒 provider | Create listing |
| PUT | /services/:id | 🔒 provider (owner) | Update / toggle availability |
| DELETE | /services/:id | 🔒 provider (owner) | Soft delete |

### Service requests
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | /requests | 🔒 planner / nominee | `{ planId, serviceId, message, preferredDate }` |
| GET | /requests | 🔒 any | Provider: received; others: sent. Query `status`, `planId` |
| PATCH | /requests/:id/status | 🔒 provider / requester | Provider: accepted, declined, completed. Requester: cancelled |

### Categories, disputes, notifications, feedback
| Method | Endpoint | Role |
|---|---|---|
| GET | /categories?kind=ritual | public (admin: `all=1`) |
| POST / PUT / DELETE | /categories(/:id) | 🔒 admin |
| POST | /disputes | 🔒 any |
| GET | /disputes/mine | 🔒 any |
| GET | /notifications | 🔒 any |
| PATCH | /notifications/:id/read · /notifications/read-all | 🔒 any |
| POST | /feedback | 🔒 any |

### Admin (🔒 admin)
| Method | Endpoint | Description |
|---|---|---|
| GET | /admin/stats | KPIs, users by role, plans by status, requests by status, sign-ups by month |
| GET | /admin/users | Query `role, status, verification, q` |
| PATCH | /admin/users/:id | `{ isVerified, status }` |
| PATCH | /admin/providers/:id/verification | `{ status: verified/rejected/pending, note }` |
| GET | /admin/disputes | Query `status` |
| PATCH | /admin/disputes/:id | `{ status, resolution }` |
| GET | /admin/feedback | Latest feedback |

### Error format
```json
{ "message": "Please add at least one nominee before finalizing" }
```
Status codes: 400 validation · 401 not logged in · 403 forbidden · 404 not found · 409 duplicate · 500 server.

## 6. Request status machine

```
pending ──accept──▶ accepted ──complete──▶ completed
   │                    │
   └──decline──▶ declined ◀──decline──┘
pending / accepted ──(requester) cancel──▶ cancelled
```

## 7. Testing performed

An automated end-to-end API suite (51 checks) and a browser suite (Playwright) were run against a seeded database:

- Auth: bad login → 401, admin self-registration blocked, suspended user blocked
- Plans: finalize blocked without required fields; encrypted at rest (`enc:v1:` in DB) and decrypted in API; budget recalculated; duplicate service → 409
- Access: nominee blocked on draft; nominee can view/download after finalize; stranger blocked; access revoke works; nominee cannot edit
- Uploads: allowed types only
- Requests: invalid transitions rejected; accept → complete; notifications created
- Providers: only owner can edit; pending providers hidden until verified
- Admin: KPIs correct; non-admin blocked; categories CRUD; disputes resolve
- UI: every page for all four roles rendered with **zero console errors**; full new-user journey (register → 7 steps → upload → finalize) passes

## 8. Backups & reliability

- Use **MongoDB Atlas** (M0 free tier is fine for demo; enable Cloud Backup on paid tiers).
- Manual backup: `mongodump --uri="$MONGO_URI" --out=backup-$(date +%F)`; restore with `mongorestore`.
- Uploaded files: on Render use a **persistent disk** mounted at `server/uploads` (future: move to S3 / Cloudinary).

## 9. Environment variables

| Variable | Where | Example |
|---|---|---|
| PORT | server | 5000 |
| MONGO_URI | server | mongodb+srv://user:pass@cluster/legacycare |
| JWT_SECRET | server | long random string |
| JWT_EXPIRES_IN | server | 7d |
| ENCRYPTION_KEY | server | 64 hex chars — **never change after data exists** |
| CLIENT_URL | server | https://legacycare.vercel.app (comma-separate several) |
| VITE_API_URL | client | https://legacycare-api.onrender.com |
