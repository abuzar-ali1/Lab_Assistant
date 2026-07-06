# Lab Assistant

What this is
------------
Lab Assistant is a web application that lets authenticated users upload medical reports and receive concise, clinician-grade summaries. The app uses a Django REST backend and a Next.js TypeScript frontend; uploaded reports are processed by an AI summarizer that explains medical jargon in plain English and provides Urdu translations alongside English summaries.

### Stack
- **Language(s):** TypeScript (frontend), Python (backend)
- **Framework / runtime:** Next.js (frontend), Django + Django REST Framework (backend)
- **Notable libraries:** Next.js + React, Django, Django REST Framework, a language/ML inference client for AI summarization

## How it's organized

```
backend/                     Django project and server
  manage.py                  Django CLI entrypoint
  requirements.txt           Python dependencies
  lab_Assistant/             Django project package (settings, wsgi, asgi, urls)
  apps/                      Django apps
    users/                   user models, authentication, serializers, views, tests
    reports/                 report models, upload handling, AI summarization services, views, tests

frontend/                    Next.js + TypeScript frontend
  app/                       Next.js app routes (App Router)
  Components/                React components and UI for login, upload, results
  Context/                   React context/providers (auth, API client)
  public/                    static assets
  package.json               npm scripts & dependencies
  tsconfig.json              TypeScript config
  README.md                  local frontend notes
```

How it fits together
--------------------
Users authenticate via the frontend (calls to the Django auth endpoints). After login they can upload medical reports (PDF, image, or text) through the frontend which sends the file to the Django API. The backend stores the report (see `backend/lab_Assistant/storage.py`) and calls the AI summarization service (implementation point in `backend/apps/reports/services.py`). The AI returns:
- a short English summary in plain language,
- an explanation of clinical jargon and findings,
- an Urdu translation of the summary/explanations.

The frontend displays the English summary, the Urdu translation, and the original report for review. Users can download the summary or share it according to app policies.

## How to run it
The shortest path from a fresh clone to a running development environment.

Backend (Django)
```
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# set required env vars
export DJANGO_SECRET_KEY="replace-with-a-secret"
export DATABASE_URL="postgres://user:pass@localhost:5432/dbname"
export DEBUG=1
# AI service settings (example)
export AI_API_KEY="your-ai-api-key"
export AI_MODEL_ENDPOINT="https://api.example.com/v1/summarize"

python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Frontend (Next.js / TypeScript)
```
cd frontend
npm install
# point frontend to backend API
export NEXT_PUBLIC_API_URL="http://localhost:8000/api"
npm run dev
```

## Typical request / response example
API endpoint (example): POST /api/reports/upload
- Request: multipart/form-data with file and optional metadata
- Response: JSON {
  "report_id": "...",
  "summary_en": "Short English summary...",
  "explanation_en": "Explanation of jargon...",
  "summary_ur": "Urdu translation..."
}

## Data privacy & security notes
- Medical reports are highly sensitive. Store uploads encrypted at rest and limit access.
- Consider automatic redaction of PII before sending to any third-party AI service.
- Document retention policy and user consent for processing medical data.

## Tests
- Backend unit tests live under `backend/apps/*/tests.py`. Run with `pytest` or `python manage.py test`.

## Try asking
- Can you add an API example for authenticating and uploading a PDF from curl?
- Should we implement server-side PII redaction before AI calls (I can draft a simple pipeline)?
- Do you want a Docker Compose file that runs PostgreSQL, Django, and Next.js for local dev?


---

If you'd like, I can also add a `.env.example` file with common env vars, a curl example for the upload API, or a small CI workflow to run backend tests and frontend build on PRs.
