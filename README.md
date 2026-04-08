# λόγος
### *Reason. Space. Harmony.*

> An AI-powered interior design consultant combining timeless design principles with modern AI expertise.

## About

λόγος (Logos) is an AI interior design application powered by Google Gemini. Upload a photo of your room and consult **χρέομαι** — your design oracle — to reimagine your space through the lens of proportion, harmony, and reason.

## Features

- **Room Visualization** — Upload any room photo and reimagine it in 5 curated design styles
- **χρέομαι AI Consultant** — Structured design analysis with actionable improvements and product picks
- **Style Selection** — Mid-Century Modern, Scandinavian, Industrial, Bohemian, Japandi
- **Before/After Comparison** — Interactive slider to compare original and reimagined spaces
- **Download** — Export your reimagined room

## Tech Stack

- React + TypeScript + Vite
- Google Gemini 2.0 Flash (Vision + Image Generation)
- Tailwind CSS + Framer Motion
- Cormorant Garamond typography

## Architecture

λόγος uses a two-process architecture for security:

- **Frontend** (Vite, port 3000) — React UI, never touches the API key
- **Backend Proxy** (Express, port 3001) — holds the Gemini API key server-side, proxies all AI requests

The Gemini API key is never exposed to the browser.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Copy `.env.server.example` to `.env.server` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. Start both frontend and backend with one command:
   ```
   npm run dev:all
   ```
   Or start them separately:
   ```
   npm run dev     # Frontend on http://localhost:3000
   npm run server  # Proxy on http://localhost:3001
   ```

## Deploy to Cloud Run

### Prerequisites
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated
- A Google Cloud project with Cloud Run and Container Registry enabled

### Steps

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy directly from source (builds + pushes + deploys in one step):
gcloud run deploy logos-interior \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key_here
```

### Architecture in Production

In production (Docker/Cloud Run), a **single Express process** on port 8080 handles both:
- **Static files** — the built React frontend (`dist/`)
- **API routes** — `/api/generate-image` and `/api/chat` (proxied to Gemini)

The `GEMINI_API_KEY` is a server-side environment variable set via Cloud Run — never exposed to the browser.

### Using Cloud Build (CI/CD)

```bash
gcloud builds submit --substitutions=_GEMINI_API_KEY=your_key_here
```

---

*© 2026 λόγος. All rights reserved.*
