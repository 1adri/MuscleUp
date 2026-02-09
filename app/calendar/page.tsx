
"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { useWorkout } from "@/app/providers"
import type { WorkoutPlanDay } from "@/lib/types"
import { dateKey, monthGrid, WEEKDAYS } from "@/lib/date"
import { getPlannedWorkoutForDate, getRecurringPlannedWorkoutForDate } from "@/lib/training"
import DateWorkoutEditorModal from "@/components/date-workout-editor-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import ExerciseCard from "@/components/exercise-card"

function niceDate(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
}

export default function CalendarPage() {
  const { plan, workoutLog, toggleCompleted, calendar, setTrainingWeekdays, resetTrainingWeekdaysToDefault, setDateOverride } = useWorkout()

  const today = useMemo(() => new Date(), [])
  const [month, setMonth] = useState<Date>(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedKey, setSelectedKey] = useState<string>(() => dateKey(today))
  const [customOpen, setCustomOpen] = useState(false)
  const [customSeed, setCustomSeed] = useState<WorkoutPlanDay | null>(null)

  const grid = useMemo(() => monthGrid(month), [month])
  const selectedDate = useMemo(() => {
    const [y, m, d] = selectedKey.split("-").map((n) => Number(n))
    return new Date(y, (m || 1) - 1, d || 1)
  }, [selectedKey])

  const planned = useMemo(() => getPlannedWorkoutForDate(plan, calendar, selectedDate), [plan, calendar, selectedDate])
  const recurring = useMemo(() => getRecurringPlannedWorkoutForDate(plan, calendar, selectedDate), [plan, calendar, selectedDate])
  const completed = Boolean(workoutLog[selectedKey]?.completed)
  const override = calendar?.dateOverrides?.[selectedKey]

  const monthTitle = useMemo(() => month.toLocaleDateString(undefined, { month: "long", year: "numeric" }), [month])

  const toggleWeekday = (dow: number) => {
    const next = new Set<number>(calendar.trainingWeekdays || [])
    if (next.has(dow)) next.delete(dow)
    else next.add(dow)
    setTrainingWeekdays(Array.from(next).sort((a, b) => a - b))
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">Calendar</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Plan your days</h1>
          <p className="mt-3 max-w-prose font-semibold text-[var(--muted)]">
            Click a date to view details, mark it complete, or override it (rest / workout / custom).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]">
            <Link href="/home">Back to home</Link>
          </Button>
          <Button asChild className="rounded-full border-2 border-[var(--stroke)] bg-[var(--olivewood)] font-black uppercase tracking-[0.12em] text-[var(--parchment)] hover:bg-[var(--bark)]">
            <Link href="/plan">View plan</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-none border-2 border-[var(--stroke)] shadow-[var(--shadow-1)]">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-sm font-black uppercase tracking-[0.14em]">{monthTitle}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-9 rounded-full border-2 border-[var(--stroke)] font-black"
                onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                aria-label="Previous month"
              >
                ←
              </Button>
              <Button
                variant="outline"
                className="h-9 rounded-full border-2 border-[var(--stroke)] font-black"
                onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                aria-label="Next month"
              >
                →
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {w}
                </div>
              ))}

              {grid.map((d) => {
                const key = dateKey(d)
                const inMonth = d.getMonth() === month.getMonth()
                const plannedDay = getPlannedWorkoutForDate(plan, calendar, d)
                const isPlanned = Boolean(plannedDay)
                const isDone = Boolean(workoutLog[key]?.completed)
                const isSelected = key === selectedKey
                const isToday = key === dateKey(today)

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedKey(key)}
                    className={cn(
                      "relative min-h-[68px] border-2 border-[var(--stroke)] bg-[var(--surface)] p-2 text-left transition",
                      "hover:-translate-y-0.5 hover:bg-[var(--olivewood)] hover:text-[var(--parchment)] hover:shadow-[var(--shadow-2)]",
                      !inMonth && "opacity-40",
                      isDone && "bg-[var(--olivewood)] text-[var(--parchment)]",
                      isSelected && "outline outline-4 outline-[color-mix(in_srgb,var(--olivewood)_20%,transparent)]",
                      isToday && "ring-2 ring-[color-mix(in_srgb,var(--leaf)_50%,transparent)] ring-offset-2 ring-offset-[var(--app-bg)]"
                    )}
                  >
                    <div className="text-sm font-black">{d.getDate()}</div>
                    {isPlanned ? <div className="absolute bottom-2 left-2 h-2 w-2 rounded-full border-2 border-current" /> : null}
                    {isDone ? <div className="absolute bottom-1.5 right-2 text-sm font-black">✓</div> : null}
                  </button>
                )
              })}
            </div>

            <div className="border-t border-[var(--stroke)]/40 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">Recurring training days</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {WEEKDAYS.map((w, idx) => {
                      const active = (calendar.trainingWeekdays || []).includes(idx)
                      return (
                        <button
                          key={w}
                          onClick={() => toggleWeekday(idx)}
                          className={cn(
                            "rounded-full border-2 border-[var(--stroke)] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.16em] transition",
                            active
                              ? "bg-[var(--olivewood)] text-[var(--parchment)]"
                              : "bg-[var(--surface)] text-[var(--olivewood)] hover:bg-[var(--olivewood)] hover:text-[var(--parchment)]"
                          )}
                        >
                          {w}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]"
                  onClick={() => resetTrainingWeekdaysToDefault(Number(plan?.training_days_per_week || 3) || 3)}
                >
                  Reset defaults
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-2 border-[var(--stroke)] shadow-[var(--shadow-1)]">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-[0.14em]">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">Selected</div>
              <div className="mt-1 text-xl font-black tracking-tight">{niceDate(selectedDate)}</div>

              <div className="mt-2 flex flex-wrap gap-2">
                {planned ? (
                  <>
                    <Badge className="rounded-full border-2 border-[var(--stroke)] bg-[var(--olive)] text-[var(--olivewood)] font-black">
                      Planned
                    </Badge>
                    <Badge className="rounded-full border-2 border-[var(--stroke)] bg-[var(--surface)] text-[var(--olivewood)] font-black">
                      {planned.day.focus || planned.day.day_label || "Workout"}
                    </Badge>
                  </>
                ) : (
                  <Badge className="rounded-full border-2 border-[var(--stroke)] bg-[var(--surface)] text-[var(--muted)] font-black">
                    Not planned
                  </Badge>
                )}
                {completed ? (
                  <Badge className="rounded-full border-2 border-[var(--stroke)] bg-[var(--olivewood)] text-[var(--parchment)] font-black">
                    Completed
                  </Badge>
                ) : null}
                {override?.kind ? (
                  <Badge className="rounded-full border-2 border-[var(--stroke)] bg-[var(--surface-2)]/40 text-[var(--olivewood)] font-black">
                    Override: {override.kind}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {planned ? (
                <Button
                  variant="outline"
                  className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]"
                  onClick={() => toggleCompleted(selectedKey, !completed)}
                >
                  {completed ? "Mark not done" : "Mark done"}
                </Button>
              ) : null}

              <Button
                variant="outline"
                className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]"
                onClick={() => setDateOverride(selectedKey, null)}
              >
                Clear override
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">Quick actions</div>
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]"
                  onClick={() => setDateOverride(selectedKey, { kind: "rest" })}
                >
                  Set as rest day
                </Button>

                <div className="grid gap-2 md:grid-cols-2">
                  <Button
                    variant="outline"
                    className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]"
                    disabled={!plan}
                    onClick={() => setDateOverride(selectedKey, { kind: "workout", workout_index: 0 })}
                  >
                    Set workout #1
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]"
                    disabled={!plan}
                    onClick={() => setDateOverride(selectedKey, { kind: "workout", workout_index: 1 })}
                  >
                    Set workout #2
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]"
                    disabled={!plan}
                    onClick={() => setDateOverride(selectedKey, { kind: "workout", workout_index: 2 })}
                  >
                    Set workout #3
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]"
                    disabled={!plan}
                    onClick={() => setDateOverride(selectedKey, { kind: "workout", workout_index: 3 })}
                  >
                    Set workout #4
                  </Button>
                </div>

                <Button
                  className="rounded-full border-2 border-[var(--stroke)] bg-[var(--olivewood)] font-black uppercase tracking-[0.12em] text-[var(--parchment)] hover:bg-[var(--bark)]"
                  onClick={() => {
                    const seed = planned?.day || recurring?.day
                    if (!seed) return
                    setCustomSeed(seed)
                    setCustomOpen(true)
                  }}
                  disabled={!plan}
                >
                  Make custom workout
                </Button>
              </div>
            </div>

            {planned ? (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">Exercises</div>
                  <div className="grid gap-2">
                    {planned.day.exercises?.map((ex, i) => (
                      <ExerciseCard key={i} ex={ex} />
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {customSeed ? (
        <DateWorkoutEditorModal
          open={customOpen}
          title={`Custom workout: ${niceDate(selectedDate)}`}
          initialDay={customSeed}
          onClose={() => setCustomOpen(false)}
          onSave={(day) => {
            setCustomOpen(false)
            setDateOverride(selectedKey, { kind: "custom", day })
          }}
        />
      ) : null}
    </div>
  )
}