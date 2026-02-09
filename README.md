# Workout Planner PWA

Black & white, professional **PWA workout planner** UI (generated from v0) with a server-side API route that uses the **OpenAI Responses API** to generate a workout plan.

## 1) Run locally

```bash
npm install
npm run dev
```

Open the app at the local URL printed in your terminal.

## 2) Add your OpenAI key (required for plan generation)

Create a file named **`.env.local`** in the project root:

```bash
OPENAI_API_KEY=your_key_here
# Optional (defaults to gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini
```

**Important:** Keep `OPENAI_API_KEY` server-side. Never put it in client code.

## 3) PWA testing notes

This project registers the service worker **only in production**.

To test installability/offline behavior:

```bash
npm run build
npm run start
```

Then open the site and use your browser’s “Install app” prompt.

## 4) API route

`POST /api/workout-plan`

Accepts the onboarding form JSON and returns:

```json
{ "plan": { "summary": "...", "recommended_schedule": [] } }
```
