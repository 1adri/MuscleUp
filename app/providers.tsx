"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { CalendarDateOverride, CalendarSettings, ChatMessage, FormData, LiftsTrackerData, WorkoutLog, WorkoutPlan } from "@/lib/types"
import { DEFAULT_CALENDAR, DEFAULT_FORM, DEFAULT_LIFTS, STORAGE_KEYS } from "@/lib/defaults"
import { safeJsonParse, safeJsonStringify } from "@/lib/storage"
import { getDefaultTrainingWeekdays, normalizeTrainingWeekdays } from "@/lib/training"

type WorkoutContextValue = {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>

  lifts: LiftsTrackerData
  setLifts: React.Dispatch<React.SetStateAction<LiftsTrackerData>>

  plan: WorkoutPlan | null
  setPlan: React.Dispatch<React.SetStateAction<WorkoutPlan | null>>

  chatMessages: ChatMessage[]
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>

  workoutLog: WorkoutLog
  toggleCompleted: (key: string, completed: boolean) => void

  calendar: CalendarSettings
  setTrainingWeekdays: (weekdays: number[]) => void
  resetTrainingWeekdaysToDefault: (daysPerWeek: number) => void
  setDateOverride: (date: string, override: CalendarDateOverride | null) => void
  clearDateOverrides: () => void

  clearAll: () => void
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null)

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM)
  const [lifts, setLifts] = useState<LiftsTrackerData>(DEFAULT_LIFTS)
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog>({})
  const [calendar, setCalendar] = useState<CalendarSettings>(DEFAULT_CALENDAR)

  // Load persisted state on first mount.
  useEffect(() => {
    const savedForm = safeJsonParse<FormData>(localStorage.getItem(STORAGE_KEYS.form))
    if (savedForm) setFormData((prev) => ({ ...prev, ...savedForm }))

    const savedLifts = safeJsonParse<LiftsTrackerData>(localStorage.getItem(STORAGE_KEYS.lifts))
    if (savedLifts && savedLifts.current) {
      setLifts((prev) => ({ ...prev, ...savedLifts }))
    } else if (savedForm?.strength) {
      // Seed lift tracker from baseline strength if no lift tracker was saved yet.
      setLifts((prev) => ({ ...prev, current: { ...prev.current, ...savedForm.strength } }))
    }

    const savedPlan = safeJsonParse<WorkoutPlan>(localStorage.getItem(STORAGE_KEYS.plan))
    if (savedPlan) setPlan(savedPlan)

    const savedChat = safeJsonParse<ChatMessage[]>(localStorage.getItem(STORAGE_KEYS.chat))
    if (Array.isArray(savedChat)) setChatMessages(savedChat)

    const savedLog = safeJsonParse<WorkoutLog>(localStorage.getItem(STORAGE_KEYS.workoutLog))
    if (savedLog && typeof savedLog === "object") setWorkoutLog(savedLog)

    const savedCal = safeJsonParse<CalendarSettings>(localStorage.getItem(STORAGE_KEYS.calendar))
    if (savedCal && Array.isArray(savedCal.trainingWeekdays)) {
      setCalendar({
        trainingWeekdays: normalizeTrainingWeekdays(savedCal.trainingWeekdays),
        dateOverrides: (savedCal as any)?.dateOverrides && typeof (savedCal as any).dateOverrides === "object" ? (savedCal as any).dateOverrides : {},
      })
    }
  }, [])

  // Persist changes.
  useEffect(() => {
    const raw = safeJsonStringify(formData)
    if (raw) localStorage.setItem(STORAGE_KEYS.form, raw)
  }, [formData])

  useEffect(() => {
    const raw = safeJsonStringify(lifts)
    if (raw) localStorage.setItem(STORAGE_KEYS.lifts, raw)
  }, [lifts])

  useEffect(() => {
    const raw = safeJsonStringify(plan)
    if (raw) localStorage.setItem(STORAGE_KEYS.plan, raw)
  }, [plan])

  useEffect(() => {
    const raw = safeJsonStringify(chatMessages)
    if (raw) localStorage.setItem(STORAGE_KEYS.chat, raw)
  }, [chatMessages])

  useEffect(() => {
    const raw = safeJsonStringify(workoutLog)
    if (raw) localStorage.setItem(STORAGE_KEYS.workoutLog, raw)
  }, [workoutLog])

  useEffect(() => {
    const raw = safeJsonStringify(calendar)
    if (raw) localStorage.setItem(STORAGE_KEYS.calendar, raw)
  }, [calendar])

  const toggleCompleted = (key: string, completed: boolean) => {
    setWorkoutLog((prev) => ({ ...prev, [key]: { completed } }))
  }

  const setTrainingWeekdays = (weekdays: number[]) => {
    const norm = normalizeTrainingWeekdays(weekdays)
    const limit = Number(plan?.training_days_per_week || 0)
    const clamped = limit && norm.length > limit ? norm.slice(0, limit) : norm
    setCalendar((prev) => ({ ...prev, trainingWeekdays: clamped }))
  }

  const resetTrainingWeekdaysToDefault = (daysPerWeek: number) => {
    setCalendar((prev) => ({ ...prev, trainingWeekdays: getDefaultTrainingWeekdays(daysPerWeek) }))
  }

  const setDateOverride = (date: string, override: CalendarDateOverride | null) => {
    setCalendar((prev) => {
      const next = { ...(prev.dateOverrides || {}) }
      if (!override) {
        delete next[date]
      } else {
        next[date] = override
      }
      return { ...prev, dateOverrides: next }
    })
  }

  const clearDateOverrides = () => {
    setCalendar((prev) => ({ ...prev, dateOverrides: {} }))
  }

  const clearAll = () => {
    setFormData(DEFAULT_FORM)
    setLifts(DEFAULT_LIFTS)
    setPlan(null)
    setChatMessages([])
    setWorkoutLog({})
    setCalendar(DEFAULT_CALENDAR)
    try {
      localStorage.removeItem(STORAGE_KEYS.form)
      localStorage.removeItem(STORAGE_KEYS.plan)
      localStorage.removeItem(STORAGE_KEYS.chat)
      localStorage.removeItem(STORAGE_KEYS.lifts)
      localStorage.removeItem(STORAGE_KEYS.workoutLog)
      localStorage.removeItem(STORAGE_KEYS.calendar)
    } catch {
      // ignore
    }
  }

  const value = useMemo<WorkoutContextValue>(
    () => ({
      formData,
      setFormData,
      lifts,
      setLifts,
      plan,
      setPlan,
      chatMessages,
      setChatMessages,
      workoutLog,
      toggleCompleted,
      calendar,
      setTrainingWeekdays,
      resetTrainingWeekdaysToDefault,
      setDateOverride,
      clearDateOverrides,
      clearAll,
    }),
    [formData, lifts, plan, chatMessages, workoutLog, calendar]
  )

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext)
  if (!ctx) throw new Error("useWorkout must be used within WorkoutProvider")
  return ctx
}
