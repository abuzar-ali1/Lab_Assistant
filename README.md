# LabSaathi

**Lab reports, made human.**

LabSaathi is a bilingual health-clarity companion for Pakistani patients. It turns a PDF or photo of a laboratory report into a structured brief that answers three practical questions:

1. What needs attention?
2. What does it mean in plain English and Urdu?
3. What should I ask my doctor next?

The product is deliberately framed as an education and appointment-preparation tool—not a diagnosis engine.

## Why this project stands out

- **Patient-first information design:** results are separated into “in range” and “worth discussing” without alarmist scoring.
- **Bilingual explanations:** every extracted marker can include concise English and natural Urdu guidance.
- **Doctor discussion mode:** the AI produces specific questions that are consolidated into a ready-to-use appointment list.
- **Health timeline:** authenticated users can search, filter, and revisit previous report briefs.
- **Meaningful product states:** branded route loading, upload stages, report-processing polling, skeletons, empty states, recovery states, and API retry paths.
- **Privacy-aware architecture:** authenticated report ownership, private signed file links, JWT rotation/blacklisting, optional Cloudflare R2, and environment-driven production security.
- **Responsive and accessible:** keyboard focus states, reduced-motion support, mobile navigation, touch-friendly controls, and readable Urdu layouts.

## Stack

| Surface | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion, SWR |
| Backend | Django 6, Django REST Framework, Simple JWT |
| AI | Google GenAI SDK with structured Gemini JSON output |
| Storage | Local media in development; private Cloudflare R2 in production |
| Database | SQLite zero-config fallback; PostgreSQL through `DATABASE_URL` |

## Product flow

```text
Account → Upload readiness check → Secure report upload
        → Gemini structured extraction → Bilingual clarity brief
        → Marker filters + doctor questions → Searchable report timeline
```

## Repository structure

```text
backend/
  apps/users/             authentication, profiles, secure password reset
  apps/reports/           uploads, report ownership, Gemini extraction
  lab_Assistant/          Django settings, storage, and routing

frontend/
  app/                    public, auth, dashboard, upload, and report routes
  Components/             reusable shell, navigation, states, and cards
  Context/                authenticated session state
  lib/                    API client, types, and error helpers
```

## Local setup

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux
python manage.py migrate
python manage.py runserver
```

SQLite is used when `DATABASE_URL` is blank or `USE_SQLITE=True`. Add `GOOGLE_API_KEY` to process reports. Password-reset emails print to the backend console in local development.

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux
npm run dev
```

Open `http://localhost:3000`.

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Product story and patient-focused value proposition |
| `/register`, `/login` | Email or Google authentication |
| `/forgot-password`, `/reset-password` | Secure token-based account recovery |
| `/dashboard` | Personalized clarity overview and recent reports |
| `/upload` | File readiness checks and animated analysis handoff |
| `/reports` | Searchable and filterable health timeline |
| `/reports/:id` | Bilingual findings, source report, and doctor questions |

## API highlights

```text
POST   /api/register/
POST   /api/login/
POST   /api/google-login/
POST   /api/forgot-password/
POST   /api/reset-password/
GET    /api/profile/

POST   /api/reports/upload/
GET    /api/reports/
GET    /api/reports/:id/
DELETE /api/reports/:id/delete/
```

Every report query is scoped to `request.user`; one user cannot retrieve another user’s report by guessing its ID.

## Validation

```bash
cd frontend
npm run lint
npm run build

cd ../backend
python manage.py check
python manage.py test
```

## Medical safety boundary

LabSaathi explains document content and helps patients prepare questions. It must not be presented as a diagnostic service, emergency service, prescription tool, or replacement for a qualified clinician. Production deployments should also document retention, consent, AI-subprocessor, and deletion policies for the target jurisdiction.
