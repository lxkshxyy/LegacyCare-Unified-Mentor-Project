# Product Requirements Document (PRD)

**Product:** LegacyCare – Dignified End-of-Life & Funeral Planning Platform
**Version:** 1.0 (MVP)
**Author:** Lakshay Pandit
**Status:** Implemented

---

## 1. Purpose

Elderly people, people who live alone, and people who live far from family often worry about what will happen after they die. When nothing is written down, families have to make rushed and emotional decisions. LegacyCare is a secure web platform where a person can **pre-plan their funeral and last rites** according to their personal, cultural and religious wishes, **choose verified service providers**, and **hand the plan to a trusted nominee**.

## 2. Goals & non-goals

### Goals
1. Let individuals create, save and update an advance funeral plan.
2. Respect personal, cultural and religious preferences.
3. Give access to verified funeral and ritual service providers with transparent pricing.
4. Reduce the emotional and logistical burden on families.
5. Store instructions and documents securely, and share them only with authorized nominees.

### Non-goals (out of scope for v1)
- Native mobile apps
- Legal will drafting
- Government death-certificate processing
- Emergency medical / ambulance services
- Online payments to providers

## 3. Personas

| Persona | Description | Key need |
|---|---|---|
| **Kamla, 68, retired teacher (Planner)** | Lives alone in Delhi, children abroad | Wants her Hindu rites done her way without burdening her son |
| **Priya, 34, daughter (Nominee)** | Works in Gurugram | Needs clear instructions and contacts when the time comes |
| **Suresh, funeral agency owner (Provider)** | Runs a 20-year-old business | Wants to reach families who plan ahead |
| **Platform admin** | LegacyCare operations | Keeps providers trustworthy and handles complaints |

## 4. User stories & acceptance criteria

### 4.1 Planner
| ID | Story | Acceptance criteria |
|---|---|---|
| P-1 | As a planner I can register and log in securely | Email + password (min 8 chars), bcrypt hashed, JWT session |
| P-2 | I can create a plan with location, ritual type, officiant and ceremony instructions | 7-step wizard; each step saves; can save draft any time |
| P-3 | I can select funeral agencies, transport and flower services | Pick from verified directory; price captured; budget total updates instantly |
| P-4 | I can upload documents and notes | PDF/JPG/PNG/DOC/DOCX/TXT, max 5 MB; label each file |
| P-5 | I can assign a nominee | Add name, email, relation, phone; toggle access on/off |
| P-6 | I can modify my plan any time | Edits allowed in draft and finalized states; version + history recorded; nominees notified |
| P-7 | I can send a service request to a provider | Request appears in provider inbox; status updates are notified |
| P-8 | I can download / print my plan | Print-friendly layout |

### 4.2 Nominee / family
| ID | Story | Acceptance criteria |
|---|---|---|
| N-1 | I can securely access a plan shared with me | Must log in with the email the planner added; plan must be finalized; access must be on |
| N-2 | I can view the finalized plan | Read-only view; other nominees' phone numbers hidden |
| N-3 | I can download instructions and documents | Print plan; authenticated document download |
| N-4 | I can contact listed providers | Call / email links; one-click service request |
| N-5 | I receive reminders and guidance | In-app notifications; 8-step "What to do now" checklist |

### 4.3 Service provider
| ID | Story | Acceptance criteria |
|---|---|---|
| S-1 | I can register and get verified | Registers with business + licence details → status *pending*; listings hidden until *verified* |
| S-2 | I can create listings with pricing | Title, category, price, unit, city, traditions, description |
| S-3 | I can manage availability | Toggle available/unavailable; availability note |
| S-4 | I receive service requests | Inbox with requester contact details |
| S-5 | I can confirm and update request status | pending → accepted/declined → completed; optional note to family |

### 4.4 Admin
| ID | Story | Acceptance criteria |
|---|---|---|
| A-1 | I can verify users and providers | Approve / reject (with reason) / move back to review; verify or suspend users |
| A-2 | I can manage ritual categories and service types | Create, edit, hide, delete categories |
| A-3 | I can monitor platform usage | KPI dashboard + charts |
| A-4 | I can handle disputes | View, set status (open / in-review / resolved), write resolution |
| A-5 | I ensure ethics & privacy | Admin sees counts and statuses but **cannot read plan contents** |

## 5. Functional flow

```
Visitor → Register (role) → Login
Planner: Create plan → Basics → Rituals → Officiant → Ceremony → Services → Nominees → Documents → Review → Finalize
           ↳ nominees notified → Nominee logs in → views plan → contacts providers / sends request
Provider: Register → (Admin verifies) → Listings visible → Receives request → Accept → Complete
Admin: Verify providers → Manage categories → Monitor KPIs → Resolve disputes
```

## 6. Non-functional requirements

| Category | Requirement | Implementation |
|---|---|---|
| Security | Encrypted data storage | AES-256-GCM on ceremony instructions, personal notes, nominee phone |
| Security | Role-based access | JWT + `authorize()` middleware + ownership checks |
| Security | Privacy-first | Plans private until finalized; documents served only via authenticated endpoint |
| Reliability | Data integrity, backups | Mongoose validation; MongoDB Atlas daily backups |
| Usability | Calm, respectful UI | Soft palette, serif headings, gentle copy, WCAG-AA contrast, labelled form fields |
| Performance | Fast load | Vite build, route-level code splitting, gzip compression, DB indexes |
| Compliance | Data protection | Minimal data collected; user can delete plan and documents; rate-limited auth |

## 7. KPIs

| KPI | Definition | Where shown |
|---|---|---|
| Registered users | Count of all accounts | Admin dashboard |
| Completed plans | Plans with status *finalized* | Admin dashboard |
| Plan update frequency | Avg. plan version; updates in last 30 days | Admin dashboard |
| Verified providers | Providers with status *verified* | Admin dashboard |
| User satisfaction | Avg. rating (1–5) from feedback form | Admin dashboard |

## 8. Release plan

| Phase | Scope |
|---|---|
| **v1.0 (this release)** | All features above |
| v1.1 | Email/SMS notifications, password reset by email |
| v2.0 | Payments, multi-language (Hindi, Tamil, Bengali), mobile apps, emergency notification workflow, legal will integration |

## 9. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Sensitive subject | Users may disengage | Gentle tone, "save draft", no pressure |
| Fake providers | Loss of trust | Manual verification, dispute process |
| Data breach | Severe | Encryption, RBAC, no public file paths, Helmet, rate limiting |
| Cultural mismatch | Wishes misunderstood | Admin-curated ritual categories + free-text fields |
