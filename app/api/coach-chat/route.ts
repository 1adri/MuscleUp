import { NextResponse } from "next/server"

export const runtime = "nodejs"

type ChatRole = "user" | "assistant"

type ChatMessage = {
  role: ChatRole
  content: string
}

type WorkoutPlanExercise = {
  name: string
  sets: number
  reps: string
  rest_seconds: number
  notes: string
}

type WorkoutPlanDay = {
  day_label: string
  focus: string
  warmup: string
  exercises: WorkoutPlanExercise[]
  cooldown: string
}

type WorkoutPlan = {
  summary: string
  training_days_per_week: number
  recommended_schedule: WorkoutPlanDay[]
  progression: string
  nutrition_notes: string[]
  disclaimer: string
}

type Body = {
  plan: WorkoutPlan
  messages: ChatMessage[]
  user_profile?: {
    heightCm?: string
    weightKg?: string
    gender?: string
    fitnessGoal?: string
    trainingDaysPerWeek?: string
    strengthSkipAll?: boolean
    strength?: Record<string, string>
    strengthNeverTried?: Record<string, boolean>
  }
  calendar?: {
    trainingWeekdays?: number[]
    dateOverrides?: Record<string, any>
    workoutLog?: Record<string, { completed: boolean }>
  }
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

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  if (!body?.plan || !Array.isArray(body?.messages)) {
    return NextResponse.json(
      { error: "Missing 'plan' or 'messages' in request body." },
      { status: 400 }
    )
  }

  // Schema for the workout plan (same as /api/workout-plan)
  const planSchema = {
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

  // Response schema for the coach chat
  const calendarSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      trainingWeekdays: {
        type: "array",
        minItems: 1,
        maxItems: 6,
        items: { type: "integer", minimum: 0, maximum: 6 },
      },
      dateOverrides: {
        type: "object",
        additionalProperties: {
          anyOf: [
            {
              type: "object",
              additionalProperties: false,
              properties: {
                kind: { enum: ["rest"] },
              },
              required: ["kind"],
            },
            {
              type: "object",
              additionalProperties: false,
              properties: {
                kind: { enum: ["workout"] },
                workout_index: { type: "integer", minimum: 0, maximum: 10 },
              },
              required: ["kind", "workout_index"],
            },
            {
              type: "object",
              additionalProperties: false,
              properties: {
                kind: { enum: ["custom"] },
                day: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    day_label: { type: "string" },
                    focus: { type: "string" },
                    warmup: { type: "string" },
                    exercises: {
                      type: "array",
                      minItems: 1,
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
              required: ["kind", "day"],
            },
            { type: "null" },
          ],
        },
      },
    },
    required: ["trainingWeekdays"],
  } as const

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      answer: { type: "string" },
      did_update_plan: { type: "boolean" },
      updated_plan: {
        anyOf: [planSchema, { type: "null" }],
      },
      did_update_calendar: { type: "boolean" },
      updated_calendar: {
        anyOf: [calendarSchema, { type: "null" }],
      },
    },
    required: [
      "answer",
      "did_update_plan",
      "updated_plan",
      "did_update_calendar",
      "updated_calendar",
    ],
  } as const

  const system =
    "You are a helpful strength & conditioning coach embedded inside a workout-planner app. " +
    "You have access to the user's profile (height, weight, gender, goal, training days/week, and optional baseline strength numbers). " +
    "You also have the user's current calendar settings (trainingWeekdays, optional one-off dateOverrides, and their workout completion log). " +
    "Always tailor your answers and any plan changes to the user's profile and baseline strength if provided. " +
    "You can: (1) answer questions, (2) modify the workout plan, and (3) adjust calendar training days (trainingWeekdays) and/or set one-off date overrides (dateOverrides). " +
    "When the user requests plan changes (swap exercises, change split, adjust volume, make it more specific, etc.), set did_update_plan=true and return updated_plan with the FULL updated plan that matches the plan schema. Otherwise set did_update_plan=false and updated_plan=null. " +
    "When the user requests schedule changes (e.g., 'move my workouts to Tue/Thu/Sat', 'change my training days'), set did_update_calendar=true and return updated_calendar with trainingWeekdays as integers (0=Sun..6=Sat) and dateOverrides as an object keyed by YYYY-MM-DD. " +
    "Use dateOverrides for one-off changes that should NOT affect other weeks (e.g., 'only next Monday make it a rest day', 'swap only this Friday workout to Day 1', or 'make a custom workout for only 2026-02-10'). For removal, set a specific date's override value to null. Otherwise set did_update_calendar=false and updated_calendar=null. " +
    "If the user asks about weights to use, prefer RPE guidance; if baseline lifts are provided, you may suggest rough % ranges. " +
    "Be safe: avoid medical claims; if user reports injury/pain, suggest seeing a professional and offer safer modifications."

  const profileContext =
    "USER_PROFILE_JSON:\n" + JSON.stringify(body.user_profile || {}, null, 2)

  // Provide the current plan as context every turn.
  const planContext =
    "CURRENT_PLAN_JSON:\n" + JSON.stringify(body.plan, null, 2)

  const calendarContext =
    "CALENDAR_CONTEXT_JSON:\n" + JSON.stringify(body.calendar || {}, null, 2)

  const history = body.messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }))

  const payload = {
    model,
    input: [
      { role: "system", content: system },
      { role: "user", content: profileContext },
      { role: "user", content: planContext },
      { role: "user", content: calendarContext },
      ...history,
    ],
    text: {
      format: {
        type: "json_schema",
        name: "coach_chat",
        strict: true,
        schema,
      },
    },
    temperature: 0.4,
    max_output_tokens: 1000,
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
      raw?.error?.message || raw?.message || `OpenAI API error (status ${apiRes.status}).`
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
    const result = JSON.parse(text) as {
      answer: string
      did_update_plan: boolean
      updated_plan: WorkoutPlan | null
      did_update_calendar: boolean
      updated_calendar: { trainingWeekdays: number[]; dateOverrides: Record<string, any> } | null
    }
    return NextResponse.json({ result })
  } catch {
    return NextResponse.json(
      { error: "Model returned invalid JSON. Try again." },
      { status: 502 }
    )
  }
}
