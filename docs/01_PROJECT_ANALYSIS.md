# LegacyCare — Project Analysis

**Project:** LegacyCare – Dignified End-of-Life & Funeral Planning Platform
**Program:** Unified Mentor internship (Project ID 17815)
**Design reference:** https://www.efuneral.com/
**Prepared by:** Lakshay Pandit

---

## 1. What the project actually is

LegacyCare is a **multi-sided web platform** with four kinds of users:

| Role | What they come to do | Core screen |
|---|---|---|
| **Planner** (the individual) | Write down how they want their funeral and last rites done, choose providers, set a budget, name who should carry it out | Plan wizard + dashboard |
| **Nominee / Family** | See the finished plan when it is needed, download documents, contact providers, follow a step-by-step guide | Shared-plan viewer |
| **Service Provider** | List services with prices (funeral agency, transport, flowers, pandit/priest, etc.), get verified, receive and confirm requests | Provider dashboard |
| **Admin** | Verify users and providers, manage ritual/service categories, watch KPIs, handle disputes | Admin console |

The brief is essentially an **eFuneral-style marketplace + a private "wishes vault"**, adapted for Indian cultural diversity (pandit preferences, regional rituals, religious / non-religious ceremonies).

## 2. Reference site (efuneral.com) — what to borrow

| eFuneral pattern | How LegacyCare uses it |
|---|---|
| Hero: "On your terms. At your fingertips." with warm human imagery | Calm hero: "Plan with dignity. Leave behind clarity, not confusion." |
| Primary CTA "Find a Provider" | Two CTAs: **Start your plan** and **Find a provider** |
| 4-step "How it works" with icons | 4 steps: Create plan → Choose rituals & providers → Add nominee → Rest easy |
| "What should I know?" FAQ | FAQ accordion on home + full FAQ page |
| "Are you prepared?" free guide | "Planning checklist" CTA |
| "Become a Partner" | "Become a provider" → provider registration |
| Muted, minimal, circular imagery | Ivory background, deep slate text, sage + soft gold accents, serif headings |

What eFuneral does **not** have, and the brief requires: nominee access management, document vault, ritual/cultural preferences, provider availability & request workflow, admin verification & disputes. These are our differentiators.

## 3. Requirement → feature mapping

### Planner
| Requirement | Implementation |
|---|---|
| Secure registration/login | JWT auth, bcrypt-hashed passwords, role chosen at sign-up |
| Advance plan: location, ritual type, priest/pandit, ceremony instructions | 7-step plan wizard (Basics, Rituals, Officiant, Ceremony, Services, Nominees, Documents) |
| Select providers (funeral agency, transport, flowers) | Pick services from the verified directory inside the wizard; running budget total |
| Upload documents & notes | Multer upload (PDF/JPG/PNG/DOCX, 5 MB), notes field |
| Assign nominee | Add nominees by email, toggle access on/off |
| Modify anytime | Edit plan; version counter + update history (feeds "plan update frequency" KPI) |

### Nominee
| Requirement | Implementation |
|---|---|
| Secure access with authorization | Nominee must log in with the email the planner added **and** planner must have access switched on |
| View finalized plan | Read-only plan view (only *finalized* plans are shared) |
| Download instructions & documents | "Download / print plan" (print-to-PDF) + authenticated document downloads |
| Contact providers | Provider phone/email shown on each selected service |
| Reminders & guidance | Step-by-step "What to do now" checklist + in-app notifications |

### Service provider
| Requirement | Implementation |
|---|---|
| Registration & verification | Registers as provider → status `pending` until admin verifies; unverified listings stay hidden |
| Listings with pricing | CRUD listings: category, price, unit, city, description |
| Manage availability | Available / unavailable toggle per listing |
| Receive service requests | Planners send requests from their plan |
| Confirm & update status | pending → accepted / declined → completed |

### Admin
| Requirement | Implementation |
|---|---|
| Verify users & providers | Verify / reject / suspend |
| Manage ritual categories & service types | Category CRUD (kind = ritual or service) |
| Monitor platform usage | KPI dashboard (all 5 KPIs from the brief) |
| Disputes / escalations | Any user raises a dispute; admin resolves with a note |
| Ethics & privacy | Audit of suspended accounts, privacy-first defaults, sensitive fields encrypted |

## 4. Non-functional requirements → how they are met

| NFR | Approach |
|---|---|
| Encrypted data storage | AES-256-GCM encryption of sensitive plan fields (ceremony instructions, personal notes, nominee phone) at the model layer; passwords bcrypt-hashed |
| Role-based access | `protect` + `authorize(...roles)` middleware on every route; ownership checks on plans/documents |
| Privacy-first | Nominees see only finalized plans they were granted; documents never served from a public folder |
| Reliability / backups | MongoDB Atlas automated backups; Mongoose validation; documented backup procedure |
| Usability (calm, respectful) | Soft palette, serif headings, gentle language ("when the time comes"), no aggressive sales UI |
| Performance | Vite build, code-split routes, indexed queries, compressed responses |
| Security hardening | Helmet, rate limiting on auth, CORS allow-list, input validation, file-type limits |

## 5. Data model (core entities)

```
User ──< Plan ──< Document
  │        │
  │        ├── nominees[] (email, relation, access)
  │        └── selectedServices[] ──> Service ──> User(provider)
  │
  ├──< Service (provider listings)
  ├──< ServiceRequest (plan, planner, provider, service, status)
  ├──< Dispute
  ├──< Notification
  └──< Feedback (satisfaction rating)
Category (ritual | service)
```

## 6. KPIs (from the brief) and where they come from

| KPI | Source |
|---|---|
| Registered users | `User.countDocuments()` by role |
| Completed plans | Plans with `status = finalized` |
| Plan update frequency | Average `version` across plans / updates in last 30 days |
| Verified providers | Providers with `verificationStatus = verified` |
| User satisfaction | Average `Feedback.rating` |

## 7. Tech stack (as suggested in the brief)

- **Frontend:** React 18 + Vite, Tailwind CSS, React Router, Axios, lucide-react icons
- **Backend:** Node.js + Express REST API
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt
- **Deployment:** Frontend → Vercel, Backend → Render, Database → MongoDB Atlas

## 8. Risks & constraints

| Risk | Mitigation |
|---|---|
| Emotional sensitivity | Copywriting reviewed for tone; no countdowns, no "urgent" upsells |
| Cultural variation | Admin-managed ritual categories; free-text customs field |
| Unverified vendors | Listings hidden until admin verification |
| Data leaks | Encryption, RBAC, no public file URLs |
| 3-day timeline | Payment gateway, multi-language and mobile apps left as future enhancements (they are also out of scope in the brief) |

## 9. Deliverables checklist

- [x] Functional web application (client + server)
- [x] Admin dashboard
- [x] PRD (`docs/02_PRD.md`)
- [x] Technical documentation (`docs/03_TECHNICAL_DOCUMENTATION.md`)
- [x] Deployment-ready build + guide (`README.md`)
- [x] UI / wireframe prompt (`docs/04_UI_WIREFRAME_PROMPT.md`)
