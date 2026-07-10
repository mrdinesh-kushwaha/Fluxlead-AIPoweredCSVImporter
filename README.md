<div align="center">

# ✨ Fluxlead

### AI-Powered CSV → CRM Lead Importer

**Any CSV. Any layout. One clean import — powered by AI.**

<br />

[![Live App](https://img.shields.io/badge/🚀_Live_App-000000?style=for-the-badge)](https://fluxlead-aicrm.netlify.app)
[![APP Preview](https://img.shields.io/badge/📱_App_Preview-000000?style=for-the-badge)](#-preview)
[![SetUp Instructions](https://img.shields.io/badge/⚙️_SetUp_Instructions-000000?style=for-the-badge)](#-prerequisites)
[![Tech Stack](https://img.shields.io/badge/🛠️_Tech_Stack-000000?style=for-the-badge)](#-tech-stack-used)
[![Project Structure](https://img.shields.io/badge/📂_Project_Structure-000000?style=for-the-badge)](#-project-structure)
[![Author](https://img.shields.io/badge/👨‍💻_Author-000000?style=for-the-badge)](#-author)

![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express)
![Postgres](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![AI](https://img.shields.io/badge/Gemini_·_OpenAI_·_Claude_._Groq-8E75B2?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

</div>

<br />

## 🚀 What is this project?

Every lead source names its columns differently — `Full name` vs `Customer Name` vs
`Lead`, `Phone Number` vs `Mobile` vs `Contact`. Hardcoded importers break the moment a
new source shows up. **Fluxlead reads the data the way a human would** and maps it into
a fixed CRM schema — no manual column-matching, no dropdowns, just upload and confirm.

## 🌍 Real-life use case

This isn't a made-up problem — it's the exact pattern behind bulk data onboarding in
almost every serious SaaS product:

| | Industry | The mess Fluxlead-style AI mapping solves |
|---|---|---|
| 🏢 | **CRMs** (Salesforce, HubSpot) | Customers import existing lead/contact lists — every export names columns differently |
| 👔 | **Recruiting platforms** | Candidate data pulled from LinkedIn, Naukri, Indeed — none of them agree on a schema |
| 🛒 | **E-commerce** | Merging product catalogs from 10 different suppliers, each with their own spreadsheet format |
| 🧑‍💼 | **HR / Payroll** | Migrating employee records between systems during a company merger |
| 🏦 | **Fintech** | Reconciling bank statements that arrive in different formats from different banks |
| 🏘️ | **Real estate** (this project's actual context) | Leads from Facebook Ads, Google Ads, and manually-typed spreadsheets — all landing in one CRM |

**The common thread:** any product that says *"upload your data, we'll take it from
here"* — without making the user manually map every single column — is solving this
exact problem underneath.

### 🎯 Real scenario this project simulates

> A real-estate company runs ads on Facebook and Google, and also has agents manually
> logging walk-in leads into Excel. Every Monday, someone on the sales-ops team has to
> merge three CSVs with three different column layouts into GrowEasy CRM — by hand.
>
> **With Fluxlead:** they upload all three files (one at a time), the AI maps each one
> into the same clean schema, and the sales team gets a single unified lead list —
> in seconds, not hours.

## 📱 Preview 

<table>
<tr>
<td width="33%"><img src="docs/screenshots/csv upload.png" alt="Upload" /><p align="center"><sub><b>Upload</b> — drag & drop</sub></p></td>
<td width="33%"><img src="docs/screenshots/preview.png" alt="Preview" /><p align="center"><sub><b>Preview</b> — before any AI runs</sub></p></td>
<td width="33%"><img src="docs/screenshots/AI Mapping.png" alt="AI processing" /><p align="center"><sub><b>AI mapping</b> — batched, retried</sub></p></td>
</tr>
<tr>
<td width="33%"><img src="docs/screenshots/results.png" alt="Results" /><p align="center"><sub><b>Results</b> — imported vs skipped</sub></p></td>
<td width="33%"><img src="docs/screenshots/import and skipped data.png" alt="Data" /><p align="center"><sub><b>Imported and skippedData</b> — formatted and validated</sub></p></td>
<td width="33%"><img src="docs/screenshots/analytics.png" alt="Analytics" /><p align="center"><sub><b>Analytics</b> — insights and reporting</sub></p></td>
</tr>
</table>

<sub>Screenshots live in <a href="docs/screenshots"><code>docs/screenshots/</code></a> — drop your own captures in with these filenames.</sub>

<br />

## ✅ Why it's production-grade, not a demo 

- **Fault isolation** — one bad batch of 20 rows never fails the other 480
- **Fail-fast on systemic errors** — a dead API key stops after batch 1, not batch 25
- **AI is validated, never trusted blindly** — every field re-checked against the schema in code
- **Cost-aware** — AI only runs after explicit confirm, never during preview
- **Stateless-by-default** — works with zero database, upgrades automatically if one's connected

<br />

## 🧑‍💻 Tech Stack Used 
 
| | |
|---|---|
| **Frontend** | Next.js 14 · TypeScript · Tailwind · Framer Motion |
| **Backend** | Node.js · Express · TypeScript |
| **AI** | OpenAI / Gemini / Claude / Groq — swap with one env var |
| **Database** | PostgreSQL (Prisma + Neon) — optional |
| **Hosting** | Render (API) · Netlify (web) · Neon (DB) |
 
<br />

## 🌐 How it works — 4 steps 
 
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   UPLOAD    │ ──▶ │   PREVIEW   │ ──▶ │  AI EXTRACT │ ──▶ │   RESULTS   │
│             │     │             │     │             │     │             │
│ Drag & drop │     │ Parse & show│     │ Batched AI  │     │ Imported /  │
│ or browse   │     │ table — NO  │     │ mapping +   │     │ Skipped +   │
│ a .csv file │     │ AI call yet │     │ retry logic │     │ reasons     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │                   │
      ▼                    ▼                    ▼                   ▼
  Client-side         GET headers +        POST /api/csv/     Structured JSON:
  file validation     rows returned,       import — only      success[], skipped[],
  (.csv, ≤5MB)         zero AI cost         fires after         totals, reasons
                                             user clicks
                                             "Confirm"
```
 
**Route → step mapping** (each step is a real URL, not a hidden state):
 
| Route | Step | What happens |
|---|---|---|
| `/` | Upload | Client validates file type & size before sending |
| `/preview` | Preview | `POST /api/csv/preview` — CSV parsed, **no AI called** |
| `/processing` | AI Extraction | `POST /api/csv/import` — batched, retried, validated |
| `/results` | Results | Imported / skipped panels, searchable & paginated |
 
<br />

## 🔗 Project structure 
 
```
growease-csv-importer/
│
├── backend/                          Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── upload.route.ts        POST /api/csv/preview   (parse only, no AI)
│   │   │   ├── import.route.ts        POST /api/csv/import    (batch AI + validation)
│   │   │   └── history.route.ts       GET  /api/history
│   │   ├── services/
│   │   │   ├── csv.service.ts         Raw CSV → row objects
│   │   │   ├── ai.service.ts          Provider-agnostic AI calls, batching, retries
│   │   │   └── crm.service.ts         Validates AI output into the CRM schema
│   │   ├── middleware/                 Upload limits, centralized error handling
│   │   ├── db/prisma.ts                Optional — only initializes if DB is configured
│   │   └── types/                      Shared TypeScript types & CRM enums
│   ├── prisma/schema.prisma
│   ├── tests/
│   ├── Dockerfile
│   └── render.yaml
│
├── frontend/                          Next.js — one real route per step
│   └── app/
│       ├── page.tsx                    "/"            Upload
│       ├── preview/page.tsx            "/preview"     Preview + Confirm
│       ├── processing/page.tsx         "/processing"  Triggers the AI call
│       ├── results/page.tsx            "/results"     Imported / skipped panels
│       ├── components/                 UploadZone, PreviewTable, ImportedPanel, …
│       └── lib/                        api.ts · storage.ts · usePagination.ts
│
├── docs/screenshots/                  Product tour images
├── samples/                           Example CSVs for testing
├── docker-compose.yml
└── README.md
```
 
**Why this structure:** routes only handle HTTP (parse request → call service → respond).
All business logic — CSV parsing, AI calls, validation — lives in `services/`, with zero
knowledge of Express. That's what makes the extraction logic unit-testable in isolation,
and swapping the AI provider or database never touches a route file.
 
<br />

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** v18 or higher
- **npm** (comes with Node.js)
- An API key from **one** AI provider: [OpenAI](https://platform.openai.com/api-keys), [Google AI Studio](https://aistudio.google.com/apikey) (Gemini), [Anthropic](https://console.anthropic.com/settings/keys) (Claude), or [Groq](https://console.groq.com/keys)
- *(Optional)* A [Neon](https://neon.tech) PostgreSQL database, if you want import history persisted
- *(Optional)* Docker, if you'd rather run everything in containers

<br />

### 1. Clone the repository

```bash
git clone https://github.com/your-username/fluxlead-csv-importer.git
cd fluxlead-csv-importer
```

<br />

### 2. Backend setup

```bash
cd backend
cp .env.example .env
npm install
```

Open `backend/.env` and fill in **at minimum** your AI provider key:

```env
AI_PROVIDER=gemini                # or: openai | anthropic | groq
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash

# Optional — leave blank to run stateless
DATABASE_URL=

PORT=4000
CORS_ORIGIN=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

Verify it's running:

```bash
curl http://localhost:4000/health
```

You should see `{"status":"ok", ...}`.

<br />

### 3. Frontend setup

Open a **new terminal**:

```bash
cd frontend
cp .env.example .env.local
npm install
```

Open `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Start the frontend:

```bash
npm run dev
```

Open **http://localhost:3000** in your browser — the app should load.

<br />

### 4. (Optional) Database setup — Neon PostgreSQL

The app runs fully stateless without a database. To enable import history:

1. Create a free project at [neon.tech](https://neon.tech)
2. Copy the **pooled connection string**
3. Paste it into `backend/.env` as `DATABASE_URL`
4. Run the migration:

```bash
cd backend
npx prisma migrate deploy
```

<br />

### 5. (Optional) Run everything with Docker instead

```bash
GEMINI_API_KEY=your_key_here docker compose up --build
```

This spins up the backend + a local Postgres instance together.

<br />

### 6. Run tests

```bash
cd backend
npm test
```

<br />

### 7. Try it out

Sample CSVs are in the [`samples/`](samples) folder — upload any of them to test the
full flow (Upload → Preview → Confirm → AI Extraction → Results) without needing your
own data.

<br />

### Troubleshooting

| Problem | Fix |
|---|---|
| `AI extraction failed... API key not valid` | Double-check the key in `backend/.env` — no extra spaces, correct provider selected |
| CORS error in browser console | `CORS_ORIGIN` in `backend/.env` must exactly match your frontend URL (no trailing slash) |
| `Cannot find module` errors | Run `npm install` again in the folder showing the error |
| Backend won't start | Confirm `PORT=4000` isn't already in use by another process |

---

## 👨‍💻 Author

Developed with ❤️ by **Dinesh Kushwaha**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mrdinesh-kushwaha/)

---
<div align="center">

[![Live App](https://img.shields.io/badge/View_Live_App_→-000000?style=for-the-badge)](https://fluxlead-aicrm.netlify.app)

</div>
