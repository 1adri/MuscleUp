
"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWorkout } from "@/app/providers"
import { STRENGTH_FIELDS, STORAGE_KEYS } from "@/lib/defaults"
import { cmToInches, inchesToCm, kgToLbs, lbsToKg } from "@/lib/utils"
import type { StrengthKey, WorkoutPlan } from "@/lib/types"
import { getDefaultTrainingWeekdays } from "@/lib/training"
import { hasProfile } from "@/lib/profile"
import { safeJsonStringify } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function OnboardingPage() {
  const router = useRouter()
  const { formData, setFormData, setPlan, setChatMessages, setTrainingWeekdays } = useWorkout()

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string>("")
  // Local display state for imperial inputs to avoid cursor/jump issues
  const [heightFeet, setHeightFeet] = useState<string>("")
  const [heightInches, setHeightInches] = useState<string>("")
  const [weightLbs, setWeightLbs] = useState<string>("")

  // Keep display state in sync when formData or units change
  useEffect(() => {
    if (formData.units === "imperial") {
      const cm = Number(formData.heightCm)
      if (!Number.isNaN(cm) && cm > 0) {
        const totalIn = Math.round(cmToInches(cm))
        setHeightFeet(String(Math.floor(totalIn / 12)))
        setHeightInches(String(totalIn % 12))
      } else {
        setHeightFeet("")
        setHeightInches("")
      }

      const kg = Number(formData.weightKg)
      if (!Number.isNaN(kg) && kg > 0) setWeightLbs(String(Math.round(kgToLbs(kg))))
      else setWeightLbs("")
    } else {
      setHeightFeet("")
      setHeightInches("")
      setWeightLbs("")
    }
  }, [formData.units, formData.heightCm, formData.weightKg])

  // If the profile already exists, do NOT allow creating a new one.
  useEffect(() => {
    if (hasProfile()) router.replace("/profile")
  }, [router])

  const strengthDisabled = formData.strengthSkipAll

  const update = (patch: Partial<typeof formData>) => setFormData((p) => ({ ...p, ...patch }))

  const onStrengthValueChange = (key: StrengthKey, value: string) => {
    setFormData((prev) => ({
      ...prev,
      strength: { ...prev.strength, [key]: value },
    }))
  }

  const onStrengthNeverTriedToggle = (key: StrengthKey, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      strengthNeverTried: { ...prev.strengthNeverTried, [key]: checked },
      strength: checked ? { ...prev.strength, [key]: "" } : prev.strength,
    }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsGenerating(true)

    try {
      // Ensure profile is persisted before navigation/guards run.
      const raw = safeJsonStringify(formData)
      if (raw) localStorage.setItem(STORAGE_KEYS.form, raw)

      const res = await fetch("/api/workout-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = (await res.json()) as { plan?: WorkoutPlan; error?: string }
      if (!res.ok || !data.plan) throw new Error(data?.error || "Failed to generate plan.")

      setPlan(data.plan)
      setTrainingWeekdays(getDefaultTrainingWeekdays(data.plan.training_days_per_week))
      setChatMessages([
        {
          role: "assistant",
          content:
            "Welcome in — your plan is ready. Head to the calendar to schedule your week, or ask me to adjust anything.",
        },
      ])

      router.push("/home")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">Setup</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Create your profile</h1>
          <p className="mt-3 max-w-prose text-base font-semibold text-[var(--muted)]">
            This is a one-time setup. After this, you’ll only edit your existing profile.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-2 border-[var(--stroke)] font-black uppercase tracking-[0.12em]"
            onClick={() => router.push("/")}
          >
            Back
          </Button>
        </div>
      </header>

      {error ? (
        <Alert className="rounded-none border-2 border-[var(--stroke)]">
          <AlertTitle className="font-black">Couldn’t generate a plan.</AlertTitle>
          <AlertDescription className="font-semibold">{error}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-none border-2 border-[var(--stroke)] shadow-[var(--shadow-1)]">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-[0.14em]">Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-black">{formData.units === "metric" ? "Height (cm)" : "Height"}</Label>
                {formData.units === "metric" ? (
                  <Input
                    value={formData.heightCm}
                    onChange={(e) => update({ heightCm: e.target.value })}
                    className="h-11 rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black"
                    placeholder="e.g., 175"
                  />
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={heightFeet}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, "")
                        setHeightFeet(v)
                        const ft = Number(v) || 0
                        const inches = Number(heightInches) || 0
                        const totalIn = ft * 12 + inches
                        update({ heightCm: totalIn ? String(inchesToCm(totalIn)) : "" })
                      }}
                      className="h-11 w-24 rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black"
                      placeholder="ft"
                    />
                    <Input
                      value={heightInches}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, "")
                        setHeightInches(v)
                        const ft = Number(heightFeet) || 0
                        const inches = Number(v) || 0
                        const totalIn = ft * 12 + inches
                        update({ heightCm: totalIn ? String(inchesToCm(totalIn)) : "" })
                      }}
                      className="h-11 w-24 rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black"
                      placeholder="in"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-black">{formData.units === "metric" ? "Weight (kg)" : "Weight (lbs)"}</Label>
                {formData.units === "metric" ? (
                  <Input
                    value={formData.weightKg}
                    onChange={(e) => update({ weightKg: e.target.value })}
                    className="h-11 rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black"
                    placeholder="e.g., 70"
                  />
                ) : (
                  <Input
                    value={weightLbs}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, "")
                      setWeightLbs(v)
                      if (v === "") update({ weightKg: "" })
                      else {
                        const kg = lbsToKg(Number(v))
                        update({ weightKg: String(kg) })
                      }
                    }}
                    className="h-11 rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black"
                    placeholder="e.g., 154"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-black">Units</Label>
                <Select value={formData.units} onValueChange={(v) => update({ units: v as any })}>
                  <SelectTrigger className="h-11 rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric (cm / kg)</SelectItem>
                    <SelectItem value="imperial">Imperial (in / lbs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-black">Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => update({ gender: v as any })}>
                  <SelectTrigger className="h-11 rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="nonbinary">Nonbinary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-black">Goal</Label>
                <Select value={formData.fitnessGoal} onValueChange={(v) => update({ fitnessGoal: v as any })}>
                  <SelectTrigger className="h-11 rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="build-muscle">Build muscle</SelectItem>
                    <SelectItem value="lose-weight">Lose weight</SelectItem>
                    <SelectItem value="improve-endurance">Improve endurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="font-black">Training days per week</Label>
                <Select value={formData.trainingDaysPerWeek} onValueChange={(v) => update({ trainingDaysPerWeek: v })}>
                  <SelectTrigger className="h-11 rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 days</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="4">4 days</SelectItem>
                    <SelectItem value="5">5 days</SelectItem>
                    <SelectItem value="6">6 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <Button
              type="submit"
              disabled={isGenerating}
              className="h-11 w-full rounded-none border-2 border-[var(--stroke)] bg-[var(--olivewood)] font-black uppercase tracking-[0.12em] text-[var(--parchment)] shadow-[var(--shadow-2)] transition hover:-translate-y-0.5 hover:bg-[var(--bark)]"
            >
              {isGenerating ? "Generating..." : "Create profile & generate plan"}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-none border-2 border-[var(--stroke)] shadow-[var(--shadow-1)]">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-[0.14em]">Strength baselines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => update({ strengthSkipAll: !formData.strengthSkipAll })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") update({ strengthSkipAll: !formData.strengthSkipAll })
              }}
              className="flex items-center gap-3 border-2 border-[var(--stroke)] bg-[var(--surface)] p-3 cursor-pointer"
            >
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={formData.strengthSkipAll}
                  onCheckedChange={(c) => update({ strengthSkipAll: Boolean(c) })}
                />
              </div>
              <div>
                <div className="font-black">Skip strength inputs</div>
                <div className="text-sm font-semibold text-[var(--muted)]">You can always fill these later.</div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3">
              {STRENGTH_FIELDS.map((f) => (
                <div key={f.key} className="grid gap-2 border-2 border-[var(--stroke)] bg-[var(--surface)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-black">{f.label}</div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.strengthNeverTried[f.key]}
                        onCheckedChange={(c) => onStrengthNeverTriedToggle(f.key, Boolean(c))}
                        disabled={strengthDisabled}
                      />
                      <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">
                        Never tried
                      </span>
                    </div>
                  </div>

                  <Input
                    value={formData.strength[f.key]}
                    onChange={(e) => onStrengthValueChange(f.key, e.target.value)}
                    disabled={strengthDisabled || formData.strengthNeverTried[f.key]}
                    placeholder={f.placeholder}
                    className="h-11 rounded-none border-2 border-[var(--stroke)] bg-[var(--surface)] font-black"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
