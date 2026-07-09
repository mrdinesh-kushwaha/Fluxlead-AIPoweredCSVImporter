<div align="center">

<img src="https://img.shields.io/badge/Fluxlead%20AICRM-1D9E75?style=for-the-badge&logoColor=white" />

# ✨ Fluxlead

### AI-Powered CSV → CRM Lead Importer

**Any CSV. Any layout. One clean import — powered by AI.**

<br />

[![Live App](https://img.shields.io/badge/🚀_Live_App-000000?style=for-the-badge)](https://fluxlead-aicrm.netlify.app)

![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express)
![Postgres](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![AI](https://img.shields.io/badge/Gemini_·_OpenAI_·_Claude-8E75B2?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

</div>

<br />

## The problem

Every lead source names its columns differently — `Full name` vs `Customer Name` vs
`Lead`, `Phone Number` vs `Mobile` vs `Contact`. Hardcoded importers break the moment a
new source shows up. **Fluxlead reads the data the way a human would** and maps it into
a fixed CRM schema — no manual column-matching, no dropdowns, just upload and confirm.

**Where this pattern matters:** CRM lead imports, recruiting platforms merging candidate
data, e-commerce catalogs from different suppliers, HR systems migrating records, fintech
reconciling statements from different banks — anywhere "upload your data, we'll handle
the rest" needs to actually work.

<br />

## Preview

<table>
<tr>
<td width="33%"><img src="docs/screenshots/csv upload.png" alt="Upload" /><p align="center"><sub><b>Upload</b> — drag & drop</sub></p></td>
<td width="33%"><img src="docs/screenshots/preview.png" alt="Preview" /><p align="center"><sub><b>Preview</b> — before any AI runs</sub></p></td>
<td width="33%"><img src="docs/screenshots/AI Mapping.png" alt="AI processing" /><p align="center"><sub><b>AI mapping</b> — batched, retried</sub></p></td>
</tr>
<tr>
<td width="33%"><img src="docs/screenshots/result 1.png" alt="Results" /><p align="center"><sub><b>Results</b> — imported vs skipped</sub></p></td>
<td width="33%"><img src="docs/screenshots/result2.png" alt="Data" /><p align="center"><sub><b>Imported Data</b> — formatted and validated</sub></p></td>
<td width="33%"><img src="docs/screenshots/analytics.png" alt="Analytics" /><p align="center"><sub><b>Analytics</b> — insights and reporting</sub></p></td>
</tr>
</table>

<sub>Screenshots live in <a href="docs/screenshots"><code>docs/screenshots/</code></a> — drop your own captures in with these filenames.</sub>

<br />

## Why it's production-grade, not a demo

- **Fault isolation** — one bad batch of 20 rows never fails the other 480
- **Fail-fast on systemic errors** — a dead API key stops after batch 1, not batch 25
- **AI is validated, never trusted blindly** — every field re-checked against the schema in code
- **Cost-aware** — AI only runs after explicit confirm, never during preview
- **Stateless-by-default** — works with zero database, upgrades automatically if one's connected

<br />

## Stack

| | |
|---|---|
| **Frontend** | Next.js 14 · TypeScript · Tailwind · Framer Motion |
| **Backend** | Node.js · Express · TypeScript |
| **AI** | OpenAI / Gemini / Claude / Groq — swap with one env var |
| **Database** | PostgreSQL (Prisma + Neon) — optional |
| **Hosting** | Render (API) · Netlify (web) · Neon (DB) |

<br />

## How it works

```
Upload → Preview (no AI yet) → Confirm → AI extraction in batches → Imported / Skipped results
```

Rows are batched (default 20/call), sent to the LLM with a strict schema-mapping prompt,
retried on failure with exponential backoff, and every response is validated in code
before it's accepted — enums, dates, and formatting rules included.

<br />

## Run it locally

```bash
# Backend
cd backend && cp .env.example .env && npm install && npm run dev   # :4000

# Frontend
cd frontend && cp .env.example .env.local && npm install && npm run dev   # :3000
```

Or full stack with Docker: `docker compose up --build`

<br />

## API

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/csv/preview` | Parse CSV, no AI |
| `POST` | `/api/csv/import` | Batch AI extraction → structured CRM records |
| `GET` | `/health` | Liveness check |

<br />

---

## 👨‍💻 Author

Developed with ❤️ by **Dinesh Kushwaha**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mrdinesh-kushwaha/)

---
<div align="center">

[![Live App](https://img.shields.io/badge/View_Live_App_→-000000?style=for-the-badge)](https://fluxlead-aicrm.netlify.app)

</div>
