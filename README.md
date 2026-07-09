<div align="center">

<img src="docs/screenshots/logo-banner.png" alt="Fluxlead" width="72" />

# Fluxlead

### AI-Powered CSV → CRM Lead Importer

**Any CSV. Any layout. One clean import — powered by AI.**

Built for the **GrowEasy Software Developer (Full-Time)** assignment.

<br />

[![Live App](https://img.shields.io/badge/Live_App-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://your-frontend.netlify.app)
[![Live API](https://img.shields.io/badge/Live_API-4A4A4A?style=for-the-badge&logo=render&logoColor=white)](https://your-backend.onrender.com)
[![GitHub](https://img.shields.io/badge/Source-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/your-username/fluxlead-csv-importer)

<br />

![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_/_OpenAI_/_Claude-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

<br />

---

## What is Fluxlead?

Fluxlead is a full-stack SaaS application that lets a user **upload any CSV file** — no
matter what the column names are, what order they're in, or where it came from — and
have it **automatically mapped into a standard CRM lead format** using AI.

The user drags a file in, previews the rows, hits confirm, and gets back a clean,
structured list of leads ready for GrowEasy CRM — with a clear summary of what was
imported, what was skipped, and why. No manual column-matching screen. No "map column A
to field B" dropdowns. The AI figures it out.

## Why does this project exist?

Every lead source formats its export differently:

| Source | How it names things |
|---|---|
| Facebook Lead Ads | `Full name`, `Phone Number`, `Ad Campaign` |
| Google Ads | `Name`, `Email Address`, `Mobile` |
| Real-estate CRMs | `Lead`, `Contact`, `Assigned Agent`, `Possession` |
| Manually built spreadsheets | Whatever the person typing it felt like calling the column |

A traditional importer hardcodes column names (`row["Email"]`) — which breaks the moment
a new source sends a slightly different header. The real problem isn't parsing a CSV; it's
**understanding messy, inconsistent, human-generated data** and reliably turning it into
something structured, without a developer writing a new mapping rule every time a new
source shows up.

Fluxlead replaces brittle, hardcoded column mapping with an **AI reasoning layer** that
reads the data the way a human would, and maps it into a fixed CRM schema — accurately,
consistently, and at scale.

## Real-life use case

This pattern shows up across nearly every serious B2B SaaS product that deals with bulk
data onboarding:

- **CRMs** (Salesforce, HubSpot, GrowEasy) — customers importing existing lead lists
- **Recruitment platforms** — importing candidate data from different job boards
- **E-commerce back-offices** — merging product catalogs from different suppliers
- **HR / payroll systems** — migrating employee records between systems
- **Fintech tools** — reconciling statements that arrive in different bank formats

Anywhere a product says *"upload your data and we'll take it from there"* without forcing
the user to manually map every column — this is the underlying pattern that makes it work.

<br />

---

## Product tour

<table>
<tr>
<td width="50%">
<img src="docs/screenshots/01-upload.png" alt="Upload screen — drag and drop CSV" />
<p align="center"><sub><b>1 · Upload</b> — drag & drop or browse, instant client-side validation</sub></p>
</td>
<td width="50%">
<img src="docs/screenshots/02-preview.png" alt="Preview screen — parsed data table" />
<p align="center"><sub><b>2 · Preview</b> — sticky-header table, column browser, zero AI calls yet</sub></p>
</td>
</tr>
<tr>
<td width="50%">
<img src="docs/screenshots/03-processing.png" alt="AI processing screen with progress" />
<p align="center"><sub><b>3 · AI mapping</b> — batched extraction with live progress and retries</sub></p>
</td>
<td width="50%">
<img src="docs/screenshots/04-results.png" alt="Results screen — imported vs skipped leads" />
<p align="center"><sub><b>4 · Results</b> — imported / skipped side-by-side, with reasons</sub></p>
</td>
</tr>
<tr>
<td colspan="2">
<img src="docs/screenshots/05-mobile-dark.png" alt="Mobile responsive dark mode view" />
<p align="center"><sub><b>5 · Responsive</b> — the full flow on mobile, dark and light mode</sub></p>
</td>
</tr>
</table>

> **Note for reviewers:** screenshots live in [`docs/screenshots/`](docs/screenshots).
> Replace the placeholder files there with your own captures from the live app —
> GitHub renders them automatically once added, no README changes needed.

<br />

---

## Why this qualifies as a production-level SaaS application

A student project stops at "it works on my machine with a perfect file." Fluxlead is
built around the assumption that **real files are messy and AI calls fail** — so the
system degrades gracefully instead of breaking:

- **Fault isolation** — if one batch of 20 rows fails after all retries, only those rows
  are marked skipped; the other 480 rows in a 500-row file still import successfully.
- **Fail-fast on systemic errors** — if the very first batch fails with an auth/quota
  error (bad API key, no credits), the remaining batches are skipped instantly instead
  of retrying a dead connection 24 more times.
- **Defense against AI unpredictability** — the AI is a mapping assistant, not a source
  of truth. Every field it returns is re-validated in code (status/source enums, date
  parsing, single-line formatting) before it's accepted.
- **Cost-aware architecture** — AI is only invoked after explicit user confirmation, and
  rows are batched to control both cost and response size.
- **Stateless-by-default, stateful-when-available** — the app never *requires* a database
  to function, but transparently upgrades to persist history when one is connected.
- **Operational readiness** — health check endpoint, structured JSON logs, rate limiting,
  centralized error handling, environment-based configuration.

This is the difference between "a script that maps a CSV" and "a system you could hand to
a real user tomorrow."

<br />

---

## Features

**Core (per assignment spec)**
- Upload a CSV in any column layout — drag & drop or file picker
- Live preview of parsed rows in a responsive, sticky-header table — before any AI runs
- Explicit Confirm step — AI is only called once the user approves the data
- AI-powered field extraction, processed in batches, into a fixed 14-field CRM schema
- Results screen showing imported vs. skipped records, with reasons, plus totals

**Engineering**
- Retry with exponential backoff for failed AI batches
- Fail-fast detection for systemic AI-connection failures
- Provider-agnostic AI layer — OpenAI, Gemini, or Claude via one env variable
- Strict server-side validation of every AI response (enums, dates, formatting)
- Optional PostgreSQL persistence (Neon) — stateless if not connected
- Dark / light theme toggle
- Fully responsive — mobile, tablet, desktop
- Real routed pages (`/`, `/preview`, `/processing`, `/results`) — each step has its own
  URL and survives a refresh
- Client-side pagination + search on every table — a 10-row and a 10,000-row import
  render identically fast
- Unit tests for core CRM validation logic
- Dockerized backend + `docker-compose` for one-command local development
- Deploy-ready configs for Render (backend) and Netlify (frontend)

<br />

---

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router, static export) + TypeScript | Fast, modern, exports cleanly to static hosting |
| Styling | Tailwind CSS | Consistent design system, fast iteration |
| Animation | Framer Motion | Smooth step transitions and loading states |
| Backend | Node.js + Express + TypeScript | Matches the assignment's stack; type safety end-to-end |
| CSV parsing | `csv-parse` | Handles quoted commas, inconsistent rows, edge cases |
| AI | OpenAI / Gemini / Claude | Provider-agnostic — swap with one env variable |
| Database | PostgreSQL via Prisma, hosted on Neon | Optional; adds import history when connected |
| File handling | Multer (in-memory) | Keeps the API stateless and fast |
| Hosting | Render (API) · Netlify (web) · Neon (DB) | Free-tier friendly, production-realistic split |

<br />

---

## How it works

```
 1. UPLOAD          User drags/drops or selects a .csv file (client validates type & size)
        │
        ▼
 2. PREVIEW         POST /api/csv/preview → backend parses CSV (any headers, any order)
        │           → NO AI processing happens at this step, per the spec
        ▼
 3. CONFIRM         User reviews the preview table, clicks "Confirm & Run AI Import"
        │
        ▼
 4. AI EXTRACTION   POST /api/csv/import → rows split into batches (default 20/batch)
        │           → each batch sent to the configured LLM with a strict schema-mapping
        │             prompt — the AI maps fields automatically, no manual step
        │           → failed batches retried with exponential backoff
        │           → every AI response validated & normalized in code
        │           → rows missing both email and mobile are skipped, with a reason
        ▼
 5. RESULTS         Imported records, skipped records + reasons, totals, batch count,
                    processing time — rendered as searchable, paginated panels
```

<br />

---

## Project structure

```
growease-csv-importer/
├── backend/                Express API
│   ├── src/
│   │   ├── routes/          upload.route.ts · import.route.ts · history.route.ts
│   │   ├── services/        csv.service.ts · ai.service.ts · crm.service.ts
│   │   ├── middleware/       upload.middleware.ts · error.middleware.ts
│   │   ├── db/prisma.ts      Optional Prisma client
│   │   └── types/            Shared TypeScript types & CRM enums
│   ├── prisma/schema.prisma
│   ├── tests/
│   ├── Dockerfile
│   └── render.yaml
│
├── frontend/                Next.js — real routed pages, matching the 4 spec steps
│   └── app/
│       ├── page.tsx           "/" — Upload
│       ├── preview/           "/preview" — Preview + Confirm
│       ├── processing/        "/processing" — Batch AI call
│       ├── results/           "/results" — Imported / skipped panels
│       ├── components/        UploadZone, PreviewTable, ImportedPanel, SkippedPanel, …
│       └── lib/                api.ts · storage.ts · usePagination.ts · types.ts
│
├── docs/screenshots/        Product tour images (see above)
├── samples/                 Example CSVs for testing
├── docker-compose.yml
└── README.md
```

Each layer has one job. Routes handle HTTP concerns only; services hold all business
logic (CSV parsing, AI calls, validation) with zero knowledge of Express — so extraction
logic and validation rules are unit-testable in isolation, and swapping the AI provider or
database never touches the route layer.

<br />

---

## Running it yourself

**Backend**
```bash
cd backend
cp .env.example .env      # add your API key (OPENAI_API_KEY / GEMINI_API_KEY / ANTHROPIC_API_KEY)
npm install
npm run dev                # http://localhost:4000
```

**Frontend**
```bash
cd frontend
cp .env.example .env.local # NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
npm install
npm run dev                 # http://localhost:3000
```

**Full stack with Docker**
```bash
OPENAI_API_KEY=sk-xxxx docker compose up --build
```

**Tests**
```bash
cd backend && npm test
```

<br />

---

## Deployment

**Database — Neon (PostgreSQL)**
1. Create a project at [neon.tech](https://neon.tech), copy the pooled connection string.
2. Set it as `DATABASE_URL` on the backend — optional, the app runs stateless without it.
3. `npx prisma migrate deploy` from `backend/` once `DATABASE_URL` is set.

**Backend — Render**
1. Push to GitHub. Render → **New → Blueprint**, point at the repo (uses `render.yaml`).
2. Set `OPENAI_API_KEY` / `GEMINI_API_KEY`, `CORS_ORIGIN` (Netlify URL), `DATABASE_URL`.

**Frontend — Netlify**
1. Netlify → **New site from Git**. Base directory: `frontend` (already set in `netlify.toml`).
2. Set `NEXT_PUBLIC_API_BASE_URL` to your Render backend URL.

<br />

---

## API reference

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/health` | — | Liveness + config check |
| `POST` | `/api/csv/preview` | `multipart/form-data` (`file`) | Parses CSV, returns headers + all rows |
| `POST` | `/api/csv/import` | `{ fileName, fileSizeBytes, rows }` | Batch AI extraction, returns structured CRM records |
| `GET` | `/api/history` | — | Recent import batches (if a database is connected) |

<br />

---

<div align="center">

### About the developer

**Built by Harsh** — a full-stack developer focused on shipping products end-to-end,
from database schema to pixel-level UI polish, with an eye for both clean architecture
and premium user experience.

Built as a submission for the **GrowEasy Software Developer (Full-Time)** position —
and reflects how I approach engineering problems: understand the actual pain point
first, then design a system that's honest about its failure modes, not just its happy
path.

<br />

[![Live App](https://img.shields.io/badge/View_Live_App-000000?style=for-the-badge)](https://your-frontend.netlify.app)

</div>