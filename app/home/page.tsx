
"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useWorkout } from "@/app/providers"
import { STRENGTH_FIELDS } from "@/lib/defaults"
import { dateKey, monthGrid, WEEKDAYS } from "@/lib/date"
import { getPlannedWorkoutForDate } from "@/lib/training"
import { hasProfile } from "@/lib/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import ExerciseCard from "@/components/exercise-card"

function niceDate(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
}

export default function HomePage() {
  const router = useRouter()
  const { plan, calendar, workoutLog, toggleCompleted, lifts, setLifts } = useWorkout()

  // Force profile creation before entering the app.
  React.useEffect(() => {
    if (!hasProfile()) router.replace("/onboarding")
  }, [router])

  const today = useMemo(() => new Date(), [])
  const [month, setMonth] = useState<Date>(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedKey, setSelectedKey] = useState<string>(() => dateKey(today))

  const grid = useMemo(() => monthGrid(month), [month])
  const selectedDate = useMemo(() => {
    const [y, m, d] = selectedKey.split("-").map((n) => Number(n))
    return new Date(y, (m || 1) - 1, d || 1)
  }, [selectedKey])

  const selectedPlan = useMemo(() => getPlannedWorkoutForDate(plan, calendar, selectedDate), [plan, calendar, selectedDate])
  const selectedCompleted = Boolean(workoutLog[selectedKey]?.completed)

  const monthTitle = useMemo(() => month.toLocaleDateString(undefined, { month: "long", year: "numeric" }), [month])

  const onLiftChange = (key: string, value: string) => {
    setLifts((prev) => ({
      ...prev,
      current: { ...prev.current, [key]: value },
    }))
  }

  return (
    <div className="space-y-8">
      <header className="grid gap-3 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">Home</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
            Your week, on one page.
          </h1>
          <p className="mt-3 max-w-prose text-base font-semibold text-[var(--muted)]">
            Calendar planning on the left, lift progress on the right. Keep it simple — show up, log it, repeat.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          <Button asChild variant="outline" className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]">
            <Link href="/calendar">Open calendar</Link>
          </Button>
          <Button asChild className="rounded-full border-2 border-[var(--stroke)] bg-[var(--olivewood)] font-black uppercase tracking-[0.12em] text-[var(--parchment)] hover:bg-[var(--bark)]">
            <Link href="/profile">Edit profile</Link>
          </Button>
        </div>
      </header>

      <Card className="rounded-none border-2 border-[var(--stroke)] shadow-[var(--shadow-1)]">
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">Streak</div>
              <div className="mt-1 text-lg font-black">{
                (() => {
                  if (!workoutLog) return 0
                  let streak = 0
                  const today = new Date()
                  const cur = new Date(today)
                  while (true) {
                    const key = dateKey(cur)
                    if (workoutLog[key] && workoutLog[key].completed) {
                      streak++
                      cur.setDate(cur.getDate() - 1)
                    } else break
                  }
                  return streak
                })()
              } days</div>
            </div>
            <div className="w-1/3">
              <Progress value={((): number => {
                if (!workoutLog) return 0
                let s = 0
                const today = new Date()
                const cur = new Date(today)
                while (true) {
                  const key = dateKey(cur)
                  if (workoutLog[key] && workoutLog[key].completed) {
                    s++
                    cur.setDate(cur.getDate() - 1)
                  } else break
                }
                return Math.min(s, 7) / 7 * 100
              })()} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Calendar */}
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
                const planned = Boolean(getPlannedWorkoutForDate(plan, calendar, d))
                const completed = Boolean(workoutLog[key]?.completed)
                const isSelected = key === selectedKey
                const isToday = key === dateKey(today)

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedKey(key)}
                    className={cn(
                      "relative min-h-[64px] border-2 border-[var(--stroke)] bg-[var(--surface)] p-2 text-left transition",
                      "hover:-translate-y-0.5 hover:bg-[var(--olivewood)] hover:text-[var(--parchment)] hover:shadow-[var(--shadow-2)]",
                      !inMonth && "opacity-40",
                      completed && "bg-[var(--olivewood)] text-[var(--parchment)]",
                      isSelected && "outline outline-4 outline-[color-mix(in_srgb,var(--olivewood)_20%,transparent)]",
                      isToday && "ring-2 ring-[color-mix(in_srgb,var(--leaf)_50%,transparent)] ring-offset-2 ring-offset-[var(--app-bg)]"
                    )}
                  >
                    <div className="text-sm font-black">{d.getDate()}</div>
                    {planned ? <div className="absolute bottom-2 left-2 h-2 w-2 rounded-full border-2 border-current" /> : null}
                    {completed ? <div className="absolute bottom-1.5 right-2 text-sm font-black">✓</div> : null}
                  </button>
                )
              })}
            </div>

            <div className="border-t border-[var(--stroke)]/40 pt-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">Selected day</p>
                  <h3 className="mt-1 text-xl font-black tracking-tight">{niceDate(selectedDate)}</h3>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedPlan ? (
                      <>
                        <Badge className="rounded-full bg-[var(--olive)] text-[var(--olivewood)] border-2 border-[var(--stroke)] font-black">
                          Planned
                        </Badge>
                        <Badge className="rounded-full bg-[var(--surface)] text-[var(--olivewood)] border-2 border-[var(--stroke)] font-black">
                          {selectedPlan.day.focus || selectedPlan.day.day_label || "Workout"}
                        </Badge>
                      </>
                    ) : (
                      <Badge className="rounded-full bg-[var(--surface)] text-[var(--muted)] border-2 border-[var(--stroke)] font-black">
                        Not planned
                      </Badge>
                    )}
                    {selectedCompleted ? (
                      <Badge className="rounded-full bg-[var(--olivewood)] text-[var(--parchment)] border-2 border-[var(--stroke)] font-black">
                        Completed
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedPlan ? (
                    <Button
                      variant="outline"
                      className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]"
                      onClick={() => toggleCompleted(selectedKey, !selectedCompleted)}
                    >
                      {selectedCompleted ? "Mark not done" : "Mark done"}
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]">
                      <Link href="/calendar">Plan this day</Link>
                    </Button>
                  )}
                </div>
              </div>

              {selectedPlan ? (
                <div className="mt-4 grid gap-2">
                  <p className="text-sm font-semibold text-[var(--muted)]">Today’s session (from your plan):</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {selectedPlan.day.exercises?.slice(0, 6).map((ex, i) => (
                      <ExerciseCard key={i} ex={ex} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Lifts */}
        <Card className="rounded-none border-2 border-[var(--stroke)] shadow-[var(--shadow-1)]">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-[0.14em]">Current lift progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-semibold text-[var(--muted)]">
              Update these whenever your best set changes. They autosave.
            </p>

            <div className="grid gap-3">
              {STRENGTH_FIELDS.map((f) => (
                <div key={f.key} className="flex items-center justify-between gap-3 border-2 border-[var(--stroke)] bg-[var(--surface)] p-3">
                  <div>
                    <div className="font-black">{f.label}</div>
                    <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">
                      current max / working weight
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      value={(lifts.current as any)[f.key] || ""}
                      onChange={(e) => onLiftChange(f.key, e.target.value)}
                      placeholder="lbs / kg"
                      className="h-10 w-28 rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button asChild variant="outline" className="w-full rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]">
                <Link href="/editor">Edit workouts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] shadow-[var(--shadow-1)]">
        <CardContent className="flex flex-col gap-2 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">Tip</div>
            <div className="text-lg font-black tracking-tight">If it’s not on the calendar, it’s not real.</div>
            <div className="text-sm font-semibold text-[var(--muted)]">Plan, then execute. Coach chat is always bottom-right.</div>
          </div>
          <Button asChild className="rounded-full border-2 border-[var(--stroke)] bg-[var(--olivewood)] font-black uppercase tracking-[0.12em] text-[var(--parchment)] hover:bg-[var(--bark)]">
            <Link href="/calendar">Plan this week</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}