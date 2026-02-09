import type { CalendarSettings, FormData, LiftsTrackerData, StrengthKey } from "@/lib/types"

export const STORAGE_KEYS = {
  form: "wp_form_v2",
  plan: "wp_plan_v2",
  chat: "wp_chat_v2",
  workoutLog: "wp_workout_log_v2",
  calendar: "wp_calendar_v2",
  lifts: "wp_lifts_v2",
} as const

export const DEFAULT_FORM: FormData = {
  heightCm: "",
  weightKg: "",
  units: "metric",
  gender: "",
  fitnessGoal: "",
  trainingDaysPerWeek: "",
  strengthSkipAll: false,
  strength: {
    bench: "",
    squat: "",
    deadlift: "",
    overheadPress: "",
    latPulldown: "",
    legPress: "",
  },
  strengthNeverTried: {
    bench: false,
    squat: false,
    deadlift: false,
    overheadPress: false,
    latPulldown: false,
    legPress: false,
  },
}

export const STRENGTH_FIELDS: Array<{ key: StrengthKey; label: string; placeholder: string }> = [
  { key: "bench", label: "Bench Press", placeholder: "e.g., 60" },
  { key: "squat", label: "Squat", placeholder: "e.g., 80" },
  { key: "deadlift", label: "Deadlift", placeholder: "e.g., 100" },
  { key: "overheadPress", label: "Overhead Press", placeholder: "e.g., 35" },
  { key: "latPulldown", label: "Lat Pulldown (machine)", placeholder: "e.g., 45" },
  { key: "legPress", label: "Leg Press (machine)", placeholder: "e.g., 160" },
]

export const DEFAULT_CALENDAR: CalendarSettings = {
  trainingWeekdays: [1, 3, 5],
  dateOverrides: {},
}

function blankHistory(): LiftsTrackerData["history"] {
  return {
    bench: [],
    squat: [],
    deadlift: [],
    overheadPress: [],
    latPulldown: [],
    legPress: [],
  }
}

export const DEFAULT_LIFTS: LiftsTrackerData = {
  current: { ...DEFAULT_FORM.strength },
  history: blankHistory(),
}
