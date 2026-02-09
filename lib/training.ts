import type { CalendarSettings, WorkoutPlan, WorkoutPlanDay } from "@/lib/types"
import { dateKey } from "@/lib/date"

export function getDefaultTrainingWeekdays(days: number): number[] {
  // 0=Sun ... 6=Sat. These defaults spread sessions across the week.
  switch (days) {
    case 2:
      return [2, 5] // Tue, Fri
    case 3:
      return [1, 3, 5] // Mon, Wed, Fri
    case 4:
      return [1, 2, 4, 5] // Mon, Tue, Thu, Fri
    case 5:
      return [1, 2, 3, 5, 6] // Mon, Tue, Wed, Fri, Sat
    case 6:
      return [1, 2, 3, 4, 5, 6] // Mon..Sat
    default:
      return [1, 3, 5]
  }
}

export function normalizeTrainingWeekdays(weekdays: number[]): number[] {
  const uniq = Array.from(new Set(weekdays))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
    .sort((a, b) => a - b)
  return uniq
}

export function getTrainingWeekdaysFromSettings(
  plan: WorkoutPlan | null,
  calendar: CalendarSettings | null
): number[] {
  const desired = calendar?.trainingWeekdays ? normalizeTrainingWeekdays(calendar.trainingWeekdays) : []
  if (desired.length) return desired
  const days = Number(plan?.training_days_per_week || 0) || plan?.recommended_schedule?.length || 0
  return getDefaultTrainingWeekdays(days || 3)
}

export function getPlannedWorkoutForDate(
  plan: WorkoutPlan | null,
  calendar: CalendarSettings | null,
  d: Date
): { day: WorkoutPlanDay; pos: number } | null {
  if (!plan) return null
  const schedule = plan.recommended_schedule || []
  if (!schedule.length) return null

  // 1) One-off overrides (do NOT affect other weeks).
  const override = calendar?.dateOverrides?.[dateKey(d)]
  if (override) {
    if (override.kind === "rest") return null
    if (override.kind === "workout") {
      const idx = Math.max(0, Math.min(schedule.length - 1, Number(override.workout_index || 0)))
      return { pos: idx, day: schedule[idx] }
    }
    if (override.kind === "custom") {
      return { pos: -1, day: override.day }
    }
  }

  const weekdays = getTrainingWeekdaysFromSettings(plan, calendar)
  const pos = weekdays.indexOf(d.getDay())
  if (pos === -1) return null

  return { pos, day: schedule[pos % schedule.length] }
}

/**
 * Recurring schedule only (ignores dateOverrides). Useful when the UI needs to show
 * what would happen by default vs. a one-off override.
 */
export function getRecurringPlannedWorkoutForDate(
  plan: WorkoutPlan | null,
  calendar: CalendarSettings | null,
  d: Date
): { day: WorkoutPlanDay; pos: number } | null {
  if (!plan) return null
  const schedule = plan.recommended_schedule || []
  if (!schedule.length) return null

  const weekdays = getTrainingWeekdaysFromSettings(plan, calendar)
  const pos = weekdays.indexOf(d.getDay())
  if (pos === -1) return null

  return { pos, day: schedule[pos % schedule.length] }
}
