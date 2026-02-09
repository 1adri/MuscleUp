import { NextResponse } from "next/server"

export const runtime = "nodejs"

type FitnessGoal = "lose-weight" | "build-muscle" | "improve-endurance"
type Gender = "female" | "male" | "nonbinary" | "prefer-not-to-say"

type StrengthKey =
  | "bench"
  | "squat"
  | "deadlift"
  | "overheadPress"
  | "latPulldown"
  | "legPress"

type StrengthData = Record<StrengthKey, string>
type StrengthNeverTried = Record<StrengthKey, boolean>

type Intake = {
  heightCm: string
  weightKg: string
  gender: Gender
  fitnessGoal: FitnessGoal
  trainingDaysPerWeek: string
  strengthSkipAll: boolean
  strength: StrengthData
  strengthNeverTried: StrengthNeverTried
}

function safeNumber(s: unknown): number | null {
  if (typeof s !== "string") return null
  const trimmed = s.trim()
  if (!trimmed) return null
  const n = Number(trimmed)
  if (!Number.isFinite(n) || n < 0) return null
  return n
}

function extractOutputText(data: any): string | null {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text
  }

  const out = data?.output
  if (!Array.isArray(out)) return null
  for (const item of out) {
    const content = item?.content
    if (!Array.isArray(content)) continue
    for (const c of content) {
      if (c?.type === "output_text" && typeof c?.text === "string") {
        if (c.text.trim()) return c.text
      }
    }
  }

  return null
}

export async function POST(req: Request) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini"

  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY. Add it to .env.local (server-side)." },
      { status: 500 }
    )
  }

  let body: Intake
  try {
    body = (await req.json()) as Intake
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  // Minimal validation
  if (!body?.heightCm || !body?.weightKg || !body?.fitnessGoal || !body?.gender || !body?.trainingDaysPerWeek) {
    return NextResponse.json(
      { error: "Please fill out height, weight, gender, goal, and training days per week." },
      { status: 400 }
    )
  }

  const trainingDays = safeNumber(body.trainingDaysPerWeek)
  if (!trainingDays || trainingDays < 2 || trainingDays > 6) {
    return NextResponse.json(
      { error: "Training days per week must be between 2 and 6." },
      { status: 400 }
    )
  }

  const strengthValues: Record<string, number | null> = {}
  for (const k of Object.keys(body.strength) as StrengthKey[]) {
    if (body.strengthSkipAll || body.strengthNeverTried?.[k]) {
      strengthValues[k] = null
    } else {
      strengthValues[k] = safeNumber(body.strength[k])
    }
  }

  const userSummary = {
    height_cm: safeNumber(body.heightCm),
    weight_kg: safeNumber(body.weightKg),
    gender: body.gender,
    goal: body.fitnessGoal,
    training_days_per_week: trainingDays,
    strength_baseline_kg: strengthValues,
    notes: {
      strength_skipped: body.strengthSkipAll,
    },
  }

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      training_days_per_week: { type: "integer", minimum: 2, maximum: 6 },
      recommended_schedule: {
        type: "array",
        minItems: 2,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            day_label: { type: "string" },
            focus: { type: "string" },
            warmup: { type: "string" },
            exercises: {
              type: "array",
              minItems: 4,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  name: { type: "string" },
                  sets: { type: "integer", minimum: 1, maximum: 8 },
                  reps: { type: "string" },
                  rest_seconds: { type: "integer", minimum: 15, maximum: 300 },
                  notes: { type: "string" },
                },
                required: ["name", "sets", "reps", "rest_seconds", "notes"],
              },
            },
            cooldown: { type: "string" },
          },
          required: ["day_label", "focus", "warmup", "exercises", "cooldown"],
        },
      },
      progression: { type: "string" },
      nutrition_notes: { type: "array", items: { type: "string" }, minItems: 3 },
      disclaimer: { type: "string" },
    },
    required: [
      "summary",
      "training_days_per_week",
      "recommended_schedule",
      "progression",
      "nutrition_notes",
      "disclaimer",
    ],
  } as const

  const system =
    "You are a strength & conditioning coach. Build safe, practical gym programs for general audiences. " +
    "Avoid medical claims. If the user mentions injuries (they did not), recommend seeing a professional."

  const user =
    "Create a weekly workout plan for a user based on this intake JSON. " +
    "Use a typical commercial gym (machines + free weights). " +
    "If strength baselines are missing, assume a novice and use RPE guidance instead of exact loads. " +
    "Include rest days implicitly (only output training days). " +
    "Prioritize good technique cues and sustainable progression.\n\n" +
    JSON.stringify(userSummary, null, 2)

  const payload = {
    model,
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "workout_plan",
        strict: true,
        schema,
      },
    },
    temperature: 0.4,
    max_output_tokens: 1200,
  }

  let apiRes: Response
  try {
    apiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to reach the OpenAI API. Check your network." },
      { status: 502 }
    )
  }

  const raw = await apiRes.json().catch(() => null)

  if (!apiRes.ok) {
    const msg =
      raw?.error?.message ||
      raw?.message ||
      `OpenAI API error (status ${apiRes.status}).`
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  const text = extractOutputText(raw)
  if (!text) {
    return NextResponse.json(
      { error: "No text output received from the model." },
      { status: 502 }
    )
  }

  try {
    const plan = JSON.parse(text)
    return NextResponse.json({ plan })
  } catch {
    return NextResponse.json(
      { error: "Model returned invalid JSON. Try again." },
      { status: 502 }
    )
  }
}
