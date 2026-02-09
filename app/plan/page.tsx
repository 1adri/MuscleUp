
"use client"

import React from "react"
import Link from "next/link"
import { useWorkout } from "@/app/providers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import ExerciseCard from "@/components/exercise-card"

export default function PlanPage() {
  const { plan } = useWorkout()

  if (!plan) {
    return (
      <Card className="rounded-none border-2 border-[var(--stroke)] shadow-[var(--shadow-1)]">
        <CardHeader>
          <CardTitle className="text-2xl font-black tracking-tight">No plan yet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-semibold text-[var(--muted)]">
            Generate a plan from your profile, then come back here.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full border-2 border-[var(--stroke)] bg-[var(--olivewood)] font-black uppercase tracking-[0.12em] text-[var(--parchment)] hover:bg-[var(--bark)]">
              <Link href="/profile">Go to profile</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]">
              <Link href="/home">Back to home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">Plan</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Your weekly plan</h1>
          <p className="mt-3 max-w-prose font-semibold text-[var(--muted)]">
            Generated from your profile. Schedule it on the calendar (and adjust days as needed).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]">
            <Link href="/calendar">Open calendar</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]">
            <Link href="/editor">Edit workout</Link>
          </Button>
          <Button asChild className="rounded-full border-2 border-[var(--stroke)] bg-[var(--olivewood)] font-black uppercase tracking-[0.12em] text-[var(--parchment)] hover:bg-[var(--bark)]">
            <Link href="/profile">Regenerate</Link>
          </Button>
        </div>
      </header>

      <Card className="rounded-none border-2 border-[var(--stroke)] shadow-[var(--shadow-1)]">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase tracking-[0.14em]">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-semibold text-[var(--muted)]">{plan.summary}</p>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full border-2 border-[var(--stroke)] bg-[var(--surface)] text-[var(--olivewood)] font-black">
              {plan.training_days_per_week} days/week
            </Badge>
            <Badge className="rounded-full border-2 border-[var(--stroke)] bg-[var(--surface)] text-[var(--olivewood)] font-black">
              Progressive overload
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {plan.recommended_schedule?.map((day, i) => (
          <Card key={i} className="rounded-none border-2 border-[var(--stroke)] shadow-[var(--shadow-1)]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-black tracking-tight">{day.day_label || `Day ${i + 1}`}</CardTitle>
              <p className="font-semibold text-[var(--muted)]">{day.focus}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">Warmup</div>
                <div className="font-semibold">{day.warmup}</div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">Exercises</div>
                <div className="grid gap-2">
                  {day.exercises?.map((ex, j) => (
                    <ExerciseCard key={j} ex={ex} />
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">Cooldown</div>
                <div className="font-semibold">{day.cooldown}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}