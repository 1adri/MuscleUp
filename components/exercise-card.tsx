
"use client"

import type { WorkoutPlanExercise } from "@/lib/types"
import { getExerciseMeta } from "@/lib/exercise-library"

export default function ExerciseCard({ ex }: { ex: WorkoutPlanExercise }) {
  const meta = getExerciseMeta(ex.name)

  return (
    <div className="border-2 border-[var(--stroke)] bg-[var(--surface)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-black truncate">{ex.name || "Exercise"}</div>
          <div className="text-sm font-semibold text-[var(--muted)]">
            {ex.sets} × {ex.reps} • rest {ex.rest_seconds}s
          </div>
        </div>
      </div>

      <div className="mt-3 border-2 border-[var(--stroke)] bg-[var(--surface-2)]/30 p-3">
        <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">
          Demo
        </div>

        <div className="mt-2 grid gap-3 md:grid-cols-[140px_1fr] md:items-start">
          {meta.demoSrc ? (
            <div className="overflow-hidden border-2 border-[var(--stroke)] bg-[var(--surface)] w-full aspect-square md:w-[140px] md:h-[140px]">
              {/* Use <img> to preserve animated GIFs; force image to fill square */}
              <img
                src={meta.demoSrc}
                alt={`${ex.name} demo`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-[var(--stroke)] bg-[var(--surface)] p-3 text-sm font-semibold text-[var(--muted)]">
              Demo not available yet for this exercise.
            </div>
          )}

          <div className="min-w-0">
            <div className="text-sm font-semibold text-[var(--muted)]">{meta.description}</div>

            {meta.cues?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {meta.cues.slice(0, 3).map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center rounded-full border-2 border-[var(--stroke)] bg-[var(--surface)] px-2 py-1 text-[0.7rem] font-black uppercase tracking-[0.14em]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {ex.notes ? <div className="mt-2 text-sm font-semibold text-[var(--muted)]">{ex.notes}</div> : null}
    </div>
  )
}
