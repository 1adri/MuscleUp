export type FitnessGoal = "" | "lose-weight" | "build-muscle" | "improve-endurance"

export type Gender =
  | ""
  | "female"
  | "male"
  | "nonbinary"
  | "prefer-not-to-say"

export type StrengthKey =
  | "bench"
  | "squat"
  | "deadlift"
  | "overheadPress"
  | "latPulldown"
  | "legPress"

export type StrengthData = Record<StrengthKey, string>
export type StrengthNeverTried = Record<StrengthKey, boolean>

export interface FormData {
  heightCm: string
  weightKg: string
  /** User preference for units shown in the UI */
  units: "metric" | "imperial"
  gender: Gender
  fitnessGoal: FitnessGoal
  trainingDaysPerWeek: string
  strengthSkipAll: boolean
  strength: StrengthData
  strengthNeverTried: StrengthNeverTried
}

export type WorkoutPlanExercise = {
  name: string
  sets: number
  reps: string
  rest_seconds: number
  notes: string
}

export type WorkoutPlanDay = {
  day_label: string
  focus: string
  warmup: string
  exercises: WorkoutPlanExercise[]
  cooldown: string
}

export type WorkoutPlan = {
  summary: string
  training_days_per_week: number
  recommended_schedule: WorkoutPlanDay[]
  progression: string
  nutrition_notes: string[]
  disclaimer: string
}

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export type WorkoutLog = Record<string, { completed: boolean }>

export type CalendarDateOverride =
  | { kind: "rest" }
  | { kind: "workout"; workout_index: number }
  | { kind: "custom"; day: WorkoutPlanDay }

export type CalendarSettings = {
  /** 0=Sun ... 6=Sat */
  trainingWeekdays: number[]
  /** One-off overrides keyed by YYYY-MM-DD. These do NOT change the recurring weekday pattern. */
  dateOverrides: Record<string, CalendarDateOverride>
}

export type LiftsTrackerData = {
  /** Current bests (or most recent entered values) */
  current: StrengthData
  /** Optional history for simple trend display */
  history: Record<StrengthKey, Array<{ date: string; value: number }>>
}
