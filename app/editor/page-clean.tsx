"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useWorkout } from "@/app/providers"
import type { WorkoutPlan, WorkoutPlanDay, WorkoutPlanExercise } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

function blankExercise(): WorkoutPlanExercise {
  return { name: "", sets: 3, reps: "8-12", rest_seconds: 90, notes: "" }
}

function blankDay(i: number): WorkoutPlanDay {
  return { day_label: `Day ${i + 1}`, focus: "", warmup: "", exercises: [blankExercise()], cooldown: "" }
}

function blankPlan(days: number): WorkoutPlan {
  return {
    summary: "",
    training_days_per_week: days,
    recommended_schedule: Array.from({ length: days }, (_, i) => blankDay(i)),
    progression: "",
    nutrition_notes: [""],
    disclaimer: "This plan is general fitness guidance, not medical advice. If you have injuries or health conditions, consult a qualified professional.",
  }
}

export default function EditorPage() {
  const router = useRouter()
  const { plan, setPlan, formData, resetTrainingWeekdaysToDefault } = useWorkout()

  const initialDays = useMemo(() => {
    const n = Number(formData.trainingDaysPerWeek || "3")
    return Number.isFinite(n) && n >= 2 && n <= 6 ? n : 3
  }, [formData.trainingDaysPerWeek])

  const [draft, setDraft] = useState<WorkoutPlan>(() => (plan ? JSON.parse(JSON.stringify(plan)) : blankPlan(initialDays)))
  const [error, setError] = useState<string>("")
  const [savedMsg, setSavedMsg] = useState<string>("")

  useEffect(() => {
    const next = plan ? JSON.parse(JSON.stringify(plan)) : blankPlan(initialDays)
    setDraft(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan])

  const updateDraft = (next: WorkoutPlan) => {
    setDraft(next)
  }

  const setDaysPerWeek = (days: number) => {
    const clamped = Math.max(2, Math.min(6, days))
    const next: WorkoutPlan = { ...draft, training_days_per_week: clamped }
    const schedule = [...(draft.recommended_schedule || [])]
    if (schedule.length < clamped) {
      for (let i = schedule.length; i < clamped; i++) schedule.push(blankDay(i))
    }
    if (schedule.length > clamped) schedule.length = clamped
    next.recommended_schedule = schedule
    updateDraft(next)
  }

  const updateDay = (idx: number, patch: Partial<WorkoutPlanDay>) => {
    const schedule = [...draft.recommended_schedule]
    schedule[idx] = { ...schedule[idx], ...patch }
    updateDraft({ ...draft, recommended_schedule: schedule })
  }

  const addDay = () => {
    const schedule = [...draft.recommended_schedule, blankDay(draft.recommended_schedule.length)]
    const next = { ...draft, training_days_per_week: Math.min(6, draft.training_days_per_week + 1), recommended_schedule: schedule }
    updateDraft(next)
  }

  const removeDay = (idx: number) => {
    const schedule = draft.recommended_schedule.filter((_, i) => i !== idx)
    const next = { ...draft, training_days_per_week: Math.max(2, draft.training_days_per_week - 1), recommended_schedule: schedule }
    updateDraft(next)
  }

  const updateExercise = (dayIdx: number, exIdx: number, patch: Partial<WorkoutPlanExercise>) => {
    const schedule = [...draft.recommended_schedule]
    const day = schedule[dayIdx]
    const exercises = [...day.exercises]
    exercises[exIdx] = { ...exercises[exIdx], ...patch }
    schedule[dayIdx] = { ...day, exercises }
    updateDraft({ ...draft, recommended_schedule: schedule })
  }

  const addExercise = (dayIdx: number) => {
    const schedule = [...draft.recommended_schedule]
    const day = schedule[dayIdx]
    schedule[dayIdx] = { ...day, exercises: [...day.exercises, blankExercise()] }
    updateDraft({ ...draft, recommended_schedule: schedule })
  }

  const removeExercise = (dayIdx: number, exIdx: number) => {
    const schedule = [...draft.recommended_schedule]
    const day = schedule[dayIdx]
    const exercises = day.exercises.filter((_, i) => i !== exIdx)
    schedule[dayIdx] = { ...day, exercises: exercises.length ? exercises : [blankExercise()] }
    updateDraft({ ...draft, recommended_schedule: schedule })
  }

  const save = () => {
    setError("")
    setSavedMsg("")
    if (!draft.recommended_schedule?.length) {
      setError("Your plan needs at least one training day.")
      return
    }
    setPlan(draft)
    resetTrainingWeekdaysToDefault(draft.training_days_per_week)
    setSavedMsg("Saved! Your calendar schedule was refreshed.")
    setTimeout(() => router.push("/plan"), 1200)
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">Editor</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Edit your plan</h1>
          <p className="mt-3 max-w-prose text-base font-semibold text-[var(--muted)]">
            Build or tweak your workout plan. Add days, exercises, and customize everything.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]">
            <Link href="/plan">View plan</Link>
          </Button>
          <Button
            onClick={save}
            className="rounded-full border-2 border-[var(--stroke)] bg-[var(--olivewood)] font-black uppercase tracking-[0.12em] text-[var(--parchment)] hover:bg-[var(--bark)]"
          >
            Save & close
          </Button>
        </div>
      </header>

      {error && (
        <Alert className="rounded-none border-2 border-red-500 bg-red-50">
          <AlertTitle className="font-black text-red-600">Error</AlertTitle>
          <AlertDescription className="font-semibold text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {savedMsg && (
        <Alert className="rounded-none border-2 border-[var(--stroke)] bg-[var(--olivewood)]">
          <AlertTitle className="font-black text-[var(--parchment)]">✓ {savedMsg}</AlertTitle>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Overview */}
        <Card className="rounded-none border-2 border-[var(--stroke)] shadow-[var(--shadow-1)]">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-[0.14em]">Plan overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-black">Summary</Label>
              <textarea
                value={draft.summary}
                onChange={(e) => updateDraft({ ...draft, summary: e.target.value })}
                className="w-full rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] p-3 font-black"
                rows={3}
                placeholder="Brief description of this plan..."
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="font-black">Training days per week</Label>
              <select
                value={String(draft.training_days_per_week)}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] p-3 font-black"
              >
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="4">4 days</option>
                <option value="5">5 days</option>
                <option value="6">6 days</option>
              </select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="font-black">Progression notes</Label>
              <textarea
                value={draft.progression}
                onChange={(e) => updateDraft({ ...draft, progression: e.target.value })}
                className="w-full rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] p-3 font-black"
                rows={3}
                placeholder="How to progress (add weight, reps, etc.)..."
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="font-black">Nutrition notes</Label>
              <textarea
                value={(draft.nutrition_notes || []).join("\n")}
                onChange={(e) => updateDraft({ ...draft, nutrition_notes: e.target.value.split("\n").filter((x) => x.trim().length) })}
                className="w-full rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] p-3 font-black"
                rows={3}
                placeholder="One note per line..."
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="font-black">Disclaimer</Label>
              <textarea
                value={draft.disclaimer}
                onChange={(e) => updateDraft({ ...draft, disclaimer: e.target.value })}
                className="w-full rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] p-3 font-black"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="rounded-none border-2 border-[var(--stroke)] shadow-[var(--shadow-1)]">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-sm font-black uppercase tracking-[0.14em]">Workout days</CardTitle>
            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">{draft.recommended_schedule.length} days</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {draft.recommended_schedule.map((day, dayIdx) => (
              <Card key={dayIdx} className="rounded-none border-2 border-[var(--stroke)] shadow-none">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base font-black">{day.day_label}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDay(dayIdx)}
                      disabled={draft.recommended_schedule.length <= 2}
                      className="rounded-full border-2 border-red-500 text-red-500 font-black"
                    >
                      Remove
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <Label className="font-black text-xs">Label</Label>
                      <Input
                        value={day.day_label}
                        onChange={(e) => updateDay(dayIdx, { day_label: e.target.value })}
                        className="rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black"
                        placeholder="Day label"
                      />
                    </div>
                    <div>
                      <Label className="font-black text-xs">Focus</Label>
                      <Input
                        value={day.focus}
                        onChange={(e) => updateDay(dayIdx, { focus: e.target.value })}
                        className="rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black"
                        placeholder="e.g., Upper body"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="font-black text-xs">Warm-up</Label>
                    <textarea
                      value={day.warmup}
                      onChange={(e) => updateDay(dayIdx, { warmup: e.target.value })}
                      className="w-full rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] p-2 font-black text-sm"
                      rows={2}
                      placeholder="Warm-up routine..."
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">Exercises</div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addExercise(dayIdx)}
                        className="rounded-full border-2 border-[var(--stroke)] font-black"
                      >
                        + Add
                      </Button>
                    </div>

                    {day.exercises.map((ex, exIdx) => (
                      <div key={exIdx} className="border-2 border-[var(--stroke)] bg-[var(--surface)] p-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-black uppercase text-[var(--muted)]">Exercise {exIdx + 1}</div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeExercise(dayIdx, exIdx)}
                            className="rounded-full border-2 border-red-500 text-red-500 h-7 font-black text-xs"
                          >
                            Remove
                          </Button>
                        </div>

                        <Input
                          value={ex.name}
                          onChange={(e) => updateExercise(dayIdx, exIdx, { name: e.target.value })}
                          className="rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black"
                          placeholder="Exercise name"
                        />

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="font-black text-xs">Sets</Label>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              value={ex.sets}
                              onChange={(e) => updateExercise(dayIdx, exIdx, { sets: Number(e.target.value || 1) || 1 })}
                              className="rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black"
                            />
                          </div>
                          <div>
                            <Label className="font-black text-xs">Reps</Label>
                            <Input
                              value={ex.reps}
                              onChange={(e) => updateExercise(dayIdx, exIdx, { reps: e.target.value })}
                              className="rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black"
                              placeholder="8-12"
                            />
                          </div>
                          <div>
                            <Label className="font-black text-xs">Rest (sec)</Label>
                            <Input
                              type="number"
                              min={0}
                              max={600}
                              value={ex.rest_seconds}
                              onChange={(e) => updateExercise(dayIdx, exIdx, { rest_seconds: Number(e.target.value || 0) || 0 })}
                              className="rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black"
                            />
                          </div>
                        </div>

                        <textarea
                          value={ex.notes}
                          onChange={(e) => updateExercise(dayIdx, exIdx, { notes: e.target.value })}
                          className="w-full rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] p-2 font-black text-sm"
                          rows={1}
                          placeholder="Notes / cues..."
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div>
                    <Label className="font-black text-xs">Cool-down</Label>
                    <textarea
                      value={day.cooldown}
                      onChange={(e) => updateDay(dayIdx, { cooldown: e.target.value })}
                      className="w-full rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] p-2 font-black text-sm"
                      rows={2}
                      placeholder="Cool-down routine..."
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              onClick={addDay}
              disabled={draft.recommended_schedule.length >= 6}
              className="w-full rounded-full border-2 border-[var(--stroke)] bg-[var(--olivewood)] font-black uppercase tracking-[0.12em] text-[var(--parchment)] hover:bg-[var(--bark)]"
            >
              + Add day
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
