
import { STORAGE_KEYS } from "@/lib/defaults"
import { safeJsonParse } from "@/lib/storage"
import type { FormData } from "@/lib/types"

export function loadStoredProfile(): FormData | null {
  if (typeof window === "undefined") return null
  return safeJsonParse<FormData>(localStorage.getItem(STORAGE_KEYS.form))
}

/**
 * "Profile exists" = onboarding basics filled at least once.
 */
export function hasProfile(): boolean {
  const form = loadStoredProfile()
  if (!form) return false
  return Boolean(form.fitnessGoal && form.trainingDaysPerWeek)
}
