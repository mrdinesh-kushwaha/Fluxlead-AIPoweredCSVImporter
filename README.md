<div align="center">

# ✨ Fluxlead
### AI-Powered CSV → CRM Lead Importer

**Any CSV. Any layout. One clean import — powered by AI.**

Built for the **GrowEasy Software Developer (Full-Time)** assignment.

🔗 **Live App:** [https://your-frontend.netlify.app](https://your-frontend.netlify.app) &nbsp;·&nbsp; **Live API:** [https://your-backend.onrender.com](https://your-backend.onrender.com)
&nbsp;·&nbsp; **Repository:** [GitHub link here]

`Next.js` `TypeScript` `Express.js` `PostgreSQL` `Prisma` `OpenAI / Gemini / Claude` `Tailwind CSS`

</div>

---

## 1. What is Fluxlead?

Fluxlead is a full-stack SaaS application that lets a user **upload any CSV file** — no
matter what the column names are, what order they're in, or where it came from — and
have it **automatically mapped into a standard CRM lead format** using AI.

The user simply drags a file in, previews the rows, hits confirm, and gets back a clean,
structured list of leads, ready to be imported into GrowEasy CRM — with a clear summary
of what was imported and what had to be skipped, and why.

That's it. No manual column-matching screen. No "map column A to field B" dropdowns. The
AI figures it out.

---

## 2. Why does this project exist? (The problem)

Every lead source formats its export differently:

| Source | How it names things |
|---|---|
| Facebook Lead Ads | `Full name`, `Phone Number`, `Ad Campaign` |
| Google Ads | `Name`, `Email Address`, `Mobile` |
| Real-estate CRMs | `Lead`, `Contact`, `Assigned Agent`, `Possession` |
| Manually built spreadsheets | Whatever the person typing it felt like calling the column |

A traditional importer solves this by hardcoding column names (`row["Email"]`) — which
breaks the moment a new source sends a slightly different header. The **real** problem
isn't parsing a CSV file; it's **understanding messy, inconsistent, human-generated data**
and reliably turning it into something structured, without a developer having to write a
new mapping rule every time a new source shows up.

That's exactly the gap this project closes: it replaces brittle, hardcoded column mapping
with an **AI reasoning layer** that reads the data the way a human would, and maps it into
a fixed CRM schema — accurately, consistently, and at scale.

### Real-life use case

This isn't a toy problem — it's a pattern used across almost every serious B2B SaaS
product that deals with bulk data onboarding:

- **CRMs** (Salesforce, HubSpot, GrowEasy) — customers importing existing lead/contact lists
- **Recruitment platforms** — importing candidate data from different job boards
- **E-commerce back-offices** — merging product catalogs from different suppliers
- **HR / Payroll systems** — migrating employee records between systems
- **Fintech / banking tools** — reconciling statements that arrive in different bank formats

Anywhere a product says *"upload your data and we'll take it from there"* without forcing
the user to manually map every column — this is the underlying pattern that makes it work.

---

## 3. Features

### Core (as per assignment spec)
- 📤 Upload a CSV in **any column layout** — drag & drop or file picker
- 👀 **Live preview** of parsed rows in a responsive, scrollable table with sticky
  headers — before any AI processing happens
- ✅ Explicit **Confirm** step — AI is only called once the user approves the data
- 🤖 **AI-powered field extraction**, processed in batches, mapping messy input into a
  fixed 14-field GrowEasy CRM schema
- 📊 Final results screen showing **imported vs. skipped** records, with reasons for
  every skip, plus totals

### Engineering / production-quality additions
- 🔁 **Retry with exponential backoff** for failed AI batches — one bad batch never
  fails the whole import
- 🧩 **Provider-agnostic AI layer** — switch between OpenAI, Gemini, or Claude with a
  single environment variable, no code changes
- 🛡️ **Strict server-side validation** of every AI response — enums, dates, and
  formatting rules are re-checked in code, the AI's output is never blindly trusted
- 🗄️ **Optional PostgreSQL persistence** (Neon) — import history is saved if a database
  is connected, but the app runs perfectly well stateless if it isn't
- 🌗 Dark / light theme toggle
- 📱 Fully responsive — mobile, tablet, and desktop
- 🧭 Real routed pages (`/`, `/preview`, `/processing`, `/results`) — not a single-page state machine; each step has its own URL and survives a refresh
- 📄 Client-side pagination + search on every data table — the DOM only ever renders one page of rows, so a 25-row import and a 10,000-row import feel identical
- 🧪 Unit tests for the core CRM validation logic
- 🐳 Dockerized backend + `docker-compose` for one-command local development
- ⚙️ Ready-to-deploy configs for **Render** (backend) and **Netlify** (frontend)

---

## 4. Why this qualifies as a production-level SaaS application

A student project stops at "it works on my machine with a perfect file." Fluxlead is
built around the assumption that **real files are messy and AI calls fail** — so the
system is designed to degrade gracefully instead of breaking:

- **Fault isolation** — if one batch of 20 rows fails after all retries, only those rows
  are marked as skipped; the other 480 rows in a 500-row file still import successfully.
- **Defense against AI unpredictability** — the AI is a mapping assistant, not a source
  of truth. Every field it returns is re-validated in code (status/source enums, date
  parsing, single-line formatting) before it's accepted.
- **Cost-aware architecture** — AI is only invoked after explicit user confirmation, and
  rows are batched to control both cost and response size.
- **Stateless-by-default, stateful-when-available** — the app never *requires* a
  database to function, but transparently upgrades to persist history when one is
  connected. This is the same graceful-degradation pattern real SaaS products use.
- **Operational readiness** — health check endpoint, structured JSON logs, rate limiting,
  centralized error handling, and environment-based configuration — the basics every
  production backend needs before it can be trusted with real traffic.

This is the difference between "a script that maps a CSV" and "a system you could hand
to a real user tomorrow."

---

## 5. Tech stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router, static export) + TypeScript | Modern, fast, and exports to static hosting (Netlify) cleanly |
| Styling | Tailwind CSS | Fast, consistent design system |
| Animation | Framer Motion | Smooth step transitions and loading states |
| Backend | Node.js + Express + TypeScript | Matches the assignment's required stack; type safety end-to-end |
| CSV parsing | `csv-parse` | Handles quoted commas, inconsistent rows, and edge cases a hand-rolled parser would miss |
| AI | OpenAI (default), with Gemini and Claude support | Assignment allowed any LLM provider; built provider-agnostic so it's not locked in |
| Database | PostgreSQL via Prisma, hosted on Neon | Optional, as permitted by the brief; adds import history when connected |
| File handling | Multer (in-memory, no disk writes) | Keeps the API stateless and fast |
| Hosting | Backend → Render · Frontend → Netlify · Database → Neon | All free-tier friendly, production-realistic split |

---

## 6. How the application works (step by step)

```
 1. UPLOAD          User drags/drops or selects a .csv file (client validates type & size)
        │
        ▼
 2. PREVIEW         POST /api/csv/preview → backend parses CSV (any headers, any order)
        │           → returns full row data + column list
        │           → NO AI processing happens at this step, per the spec
        ▼
 3. CONFIRM         User reviews the preview table, clicks "Confirm & Run AI Import" —
        │           only now does the frontend call the backend
        ▼
 4. AI EXTRACTION   POST /api/csv/import → rows are split into batches (default: 20/batch)
        │           → each batch sent to the configured LLM with a strict schema-mapping
        │             prompt — the AI intelligently maps fields, no manual mapping step
        │           → failed batches retried with exponential backoff (up to 3 attempts)
        │           → every AI response is validated & normalized in code
        │           → rows missing both email and mobile, or duplicate emails, are skipped
        │             with a specific reason
        ▼
 5. RESULTS         Structured JSON returned: imported records, skipped records + reasons,
                    totals, batch count, and processing time — rendered as two side-by-side
                    panels (Imported / Skipped) with independent search, pagination, a
                    "Top Skip Reasons" breakdown, and CSV export
                    → optionally persisted to Postgres for import history
```

---

## 7. Project structure

```
growease-csv-importer/
│
├── backend/                        Express API
│   ├── src/
│   │   ├── index.ts                 App entrypoint — middleware, routes, server start
│   │   ├── routes/
│   │   │   ├── upload.route.ts       POST /api/csv/preview  (parse only, no AI — per spec)
│   │   │   ├── import.route.ts       POST /api/csv/import   (batch AI extraction + validation)
│   │   │   └── history.route.ts      GET  /api/history      (past import batches)
│   │   ├── services/
│   │   │   ├── csv.service.ts        Raw CSV → row objects, dynamic headers
│   │   │   ├── ai.service.ts         Provider-agnostic AI calls, batching, retries
│   │   │   └── crm.service.ts        Validates/normalizes AI output into the CRM schema
│   │   ├── middleware/
│   │   │   ├── upload.middleware.ts   Multer config — CSV-only, size limit
│   │   │   └── error.middleware.ts    Centralized error handling
│   │   ├── db/prisma.ts              Optional Prisma client (only initializes if DB is configured)
│   │   ├── types/index.ts            Shared TypeScript types & CRM enums
│   │   └── utils/logger.ts           Structured JSON logging
│   ├── prisma/schema.prisma          Database schema (ImportBatch, Lead, SkippedRow)
│   ├── tests/                        Unit tests for CRM validation logic
│   ├── Dockerfile
│   └── render.yaml                   Render deployment blueprint
│
├── frontend/                        Next.js app — real routed pages, matching the 4 spec steps
│   └── app/
│       ├── page.tsx                  "/" — Step 1: Upload
│       ├── preview/page.tsx          "/preview" — Step 2: Preview (no AI yet) + Confirm button
│       ├── processing/page.tsx       "/processing" — Step 3→4: triggers the real batch AI call
│       ├── results/page.tsx          "/results" — Step 4: imported/skipped panels + totals
│       ├── layout.tsx                Fonts, metadata, wraps every route in AppChrome
│       ├── globals.css               Design tokens, glassmorphism, theme variables
│       ├── components/
│       │   ├── AppChrome.tsx          Persistent header + step rail shared by all routes
│       │   ├── WorkspaceHeader.tsx    Page title/subtitle/"Start over" used on results
│       │   ├── UploadZone.tsx         Drag & drop + file picker
│       │   ├── ColumnChips.tsx        Searchable column-name chip browser (Preview screen)
│       │   ├── SegmentedDonut.tsx     Multi-segment SVG donut (Top Skip Reasons)
│       │   ├── PreviewTable.tsx       Sticky-header, paginated data table (mobile: card list)
│       │   ├── ImportedPanel.tsx      Imported-leads panel — search, pagination, CSV export
│       │   ├── SkippedPanel.tsx       Skipped-leads panel — reasons breakdown, search, CSV export
│       │   ├── PaginationBar.tsx      Page controls — keeps the DOM light at any row count
│       │   ├── FlowRail.tsx           Animated step-progress indicator, driven by the current route
│       │   ├── StatCard.tsx           Dashboard-style metric cards
│       │   └── ThemeToggle.tsx        Dark/light mode switch
│       └── lib/
│           ├── api.ts                 Typed fetch client for the backend
│           ├── storage.ts             sessionStorage bridge — carries data between routes
│           ├── usePagination.ts       Reusable pagination hook
│           └── types.ts               Shared frontend types
│
├── samples/                         Example CSVs (Facebook, Google Ads, manual sheet) for testing
├── docker-compose.yml               One-command local stack (backend + Postgres)
└── README.md
```

**Why this structure:** each layer has one job. Routes only handle HTTP concerns (parse
the request, call a service, return a response). Services hold all business logic (CSV
parsing, AI calls, validation) and have zero knowledge of Express. This means the AI
extraction logic or the validation rules can be unit-tested completely in isolation, and
swapping the AI provider or the database never touches the route layer.

**On scope:** this project intentionally implements exactly the 4 steps in the brief —
Upload → Preview (no AI) → Confirm → AI-extracted Results — with no manual mapping screen
in between. The AI does all field mapping automatically in the batch extraction step, per
"3. AI Extraction" in the assignment.

---

## 8. Running it yourself

### Backend
```bash
cd backend
cp .env.example .env      # add your OPENAI_API_KEY (DATABASE_URL is optional)
npm install
npm run dev                # http://localhost:4000
```

### Frontend
```bash
cd frontend
cp .env.example .env.local # set NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
npm install
npm run dev                 # http://localhost:3000
```

### Full stack with Docker (backend + Postgres)
```bash
OPENAI_API_KEY=sk-xxxx docker compose up --build
```

### Tests
```bash
cd backend && npm test
```

Full deployment steps for **Render**, **Netlify**, and **Neon** are in the sections below.

---

## 9. Deployment

### Database — Neon (PostgreSQL)
1. Create a project at [neon.tech](https://neon.tech) and copy the pooled connection string.
2. Set it as `DATABASE_URL` on the backend. The app works without it — it just won't
   persist import history.
3. Run `npx prisma migrate deploy` from `backend/` once `DATABASE_URL` is set.

### Backend — Render
1. Push this repo to GitHub.
2. Render → **New → Blueprint**, point it at the repo (uses `backend/render.yaml`).
3. Set environment variables: `OPENAI_API_KEY`, `CORS_ORIGIN` (your Netlify URL),
   `DATABASE_URL` (from Neon).

### Frontend — Netlify
1. Netlify → **New site from Git**, point at this repo.
2. Base directory: `frontend` — build command and publish directory are already set in
   `netlify.toml`.
3. Set `NEXT_PUBLIC_API_BASE_URL` to your Render backend URL.

---

## 10. API reference

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/health` | — | Liveness + config check |
| `POST` | `/api/csv/preview` | `multipart/form-data` (`file`) | Parses CSV, returns headers + all rows |
| `POST` | `/api/csv/import` | `{ fileName, fileSizeBytes, rows }` | Runs batch AI extraction, returns structured CRM records |
| `GET` | `/api/history` | — | Recent import batches (if a database is connected) |

---

<div align="center">

## About the developer

**Built by Harsh** — a full-stack developer focused on shipping products end-to-end,
from database schema to pixel-level UI polish, with an eye for both clean architecture
and premium user experience.

This project was built as a submission for the **GrowEasy Software Developer
(Full-Time)** position, and reflects how I approach real-world engineering problems:
understand the actual pain point first, then design a system that's honest about its
failure modes, not just its happy path.

</div>
