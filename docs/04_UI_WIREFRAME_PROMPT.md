# UI / Wireframe Prompt — LegacyCare

Paste the prompt below into Figma AI (First Draft / Make), Google Stitch, v0, Lovable, Uizard or Galileo AI.
If the tool has a character limit, use the **Short version** at the bottom.

---

## Full prompt

```
Design a complete responsive web app UI (desktop 1440px + mobile 390px) for "LegacyCare – Dignified End-of-Life & Funeral Planning Platform", an Indian platform where people pre-plan their funeral and last rites, share the plan with family nominees, and book verified funeral service providers. Visual reference: efuneral.com (calm, minimal, human, trustworthy).

MOOD & BRAND
- Calm, respectful, warm, reassuring. Never morbid, never salesy. Lots of white space.
- Colors: ivory background #FAF7F2, deep slate text #1F2A37, sage green primary #5B7B6A (hover #4A6657), soft gold accent #C8A96A, muted rose for warnings #B5838D, card white #FFFFFF, borders #E7E1D8.
- Typography: headings in an elegant serif (Fraunces or Cormorant Garamond), body in Inter. Large, readable sizes (body 16–17px), generous line height.
- Shapes: 16px rounded cards, soft shadows, circular image crops, thin line icons (Lucide style). Gentle imagery: holding hands, diyas/candles, lotus, white flowers, elderly couple smiling, sunrise.
- Logo: wordmark "LegacyCare" with a small lotus/leaf mark.

PUBLIC PAGES
1. Home
   - Top nav: logo, How it works, Providers, FAQ, Become a provider, Log in, primary button "Start your plan".
   - Hero: headline "Plan with dignity. Leave behind clarity, not confusion." Sub-text about honouring personal, cultural and religious wishes. Buttons "Start your plan" and "Find a provider". Circular photo of an elderly couple, trust badges (Encrypted & private · Verified providers · Family access).
   - "How it works" 4 steps with icons: Create your plan → Choose rituals & providers → Add your nominee → Rest easy.
   - "Honour every tradition" cards: Hindu, Muslim, Christian, Sikh, Buddhist, Jain, Non-religious.
   - Feature grid: Wishes vault, Verified providers, Budget clarity, Family access, Document storage, Gentle guidance.
   - Provider categories strip: Funeral agencies, Transport, Flowers & decoration, Pandit/Priest, Catering, Cremation/Burial grounds.
   - Testimonial-style quote section (placeholder), FAQ accordion "What should I know?", CTA band "Are you prepared? Download the free planning checklist", footer with links, privacy note, contact.
2. How it works (detailed timeline for planners, nominees and providers).
3. Provider directory: search bar, filters (category, city, max price, availability), grid of provider service cards (photo, business name, verified badge, category chip, city, price "₹12,000 / service", Available tag, "View details").
4. FAQ page, Login page, Register page (role selector cards: Plan for myself / I'm a family nominee / I'm a service provider).

PLANNER DASHBOARD (left sidebar layout)
- Sidebar: Overview, My plans, Service requests, Notifications, Feedback, Log out. Top bar with name and avatar.
- Overview: welcome card, plan completion progress ring, cards for Nominees, Selected services, Estimated budget, Last updated.
- Plan wizard (7 steps with a horizontal stepper): 1 Basics (plan title, preferred funeral location, city, disposition: cremation/burial/other) · 2 Rituals (religious / non-religious toggle, tradition dropdown, ritual category) · 3 Officiant (pandit/priest/clergy preference, name, contact, notes) · 4 Ceremony (music, prayers, customs, dress code, other instructions — with a lock icon "encrypted") · 5 Services (choose from provider cards, running budget total sidebar) · 6 Nominees (add name, email, relation, phone; access toggle) · 7 Documents (drag-and-drop upload, list with labels) · Review & Finalize screen.
- Plan detail page: printable summary, status badge (Draft / Finalized), buttons Edit, Download / print, Send request to provider.
- Service requests table with status chips (Pending, Accepted, Declined, Completed).

NOMINEE DASHBOARD
- "Plans shared with you" cards (planner name, relation, finalized date).
- Read-only plan view with sections, document downloads, provider contact buttons (Call / Email), and a right-side "What to do now" guidance checklist with checkboxes.

PROVIDER DASHBOARD
- Verification status banner (Pending / Verified / Rejected).
- Stats: active listings, pending requests, accepted, completed.
- Listings table + "Add listing" modal (title, category, price, unit, city, description, availability toggle).
- Requests inbox with Accept / Decline / Mark completed buttons.

ADMIN CONSOLE
- KPI cards: Registered users, Completed plans, Avg plan updates, Verified providers, Satisfaction rating (stars).
- Bar charts: users by role, plans by status, requests by status.
- Users table (verify, suspend), Provider verification queue (approve / reject with license number), Categories manager (ritual & service types), Disputes list with resolve drawer.

STATES & COMPONENTS
- Empty states with soft illustrations and gentle copy ("No plans yet — start whenever you feel ready").
- Toasts, confirmation modals, form validation, loading skeletons.
- Accessible: WCAG AA contrast, focus rings, 44px touch targets.

Deliver: a style guide frame (colors, type scale, buttons, inputs, cards, badges), then all screens above in desktop and mobile.
```

---

## Short version (for tools with a character limit)

```
Responsive web app UI for "LegacyCare", an Indian funeral pre-planning platform (reference: efuneral.com). Calm, respectful, minimal. Ivory #FAF7F2 background, slate #1F2A37 text, sage #5B7B6A primary, gold #C8A96A accent, serif headings (Fraunces) + Inter body, rounded cards, circular photos, lotus/diya imagery. Screens: Home (hero "Plan with dignity. Leave behind clarity, not confusion.", 4-step how it works, traditions, features, FAQ, CTA), Provider directory with filters, Login/Register with role cards; Planner dashboard with 7-step plan wizard (basics, rituals, officiant, ceremony, services with budget, nominees, documents) + review; Nominee read-only plan view with guidance checklist; Provider dashboard (verification banner, listings, requests); Admin console (KPI cards, charts, users, provider verification, categories, disputes). Desktop + mobile.
```

---

## Wireframe (low-fi) — Home

```
┌────────────────────────────────────────────────────────────────┐
│ [lotus] LegacyCare   How it works  Providers  FAQ   Log in [Start your plan] │
├────────────────────────────────────────────────────────────────┤
│  Plan with dignity.                        ( circular photo )  │
│  Leave behind clarity, not confusion.                          │
│  [Start your plan]  [Find a provider]                          │
│  🔒 Encrypted  ✓ Verified providers  👪 Family access           │
├────────────────────────────────────────────────────────────────┤
│  HOW IT WORKS   ①Create plan ─ ②Choose rituals ─ ③Add nominee ─ ④Rest easy │
├────────────────────────────────────────────────────────────────┤
│  HONOUR EVERY TRADITION  [Hindu][Muslim][Christian][Sikh][...] │
├────────────────────────────────────────────────────────────────┤
│  FEATURES  [Vault][Providers][Budget][Family][Docs][Guidance]  │
├────────────────────────────────────────────────────────────────┤
│  FAQ ▸ ▸ ▸                    │  ARE YOU PREPARED? [Checklist] │
├────────────────────────────────────────────────────────────────┤
│  footer                                                        │
└────────────────────────────────────────────────────────────────┘
```

## Wireframe — Plan wizard

```
┌──────────┬─────────────────────────────────────────────────────┐
│ Sidebar  │ ① Basics ─ ② Rituals ─ ③ Officiant ─ ④ Ceremony ─ ⑤ Services ─ ⑥ Nominees ─ ⑦ Docs │
│ Overview │ ┌───────────────────────────────┐ ┌───────────────┐ │
│ My plans │ │ form fields for current step  │ │ Plan summary  │ │
│ Requests │ │                               │ │ Budget ₹45,000│ │
│ Alerts   │ │                               │ │ Progress 60%  │ │
│          │ └───────────────────────────────┘ └───────────────┘ │
│          │              [Back]  [Save draft]  [Next →]          │
└──────────┴─────────────────────────────────────────────────────┘
```
