"use client"

import React, { useEffect, useMemo, useState } from "react"
import type { WorkoutPlanDay, WorkoutPlanExercise } from "@/lib/types"
import { getExerciseMeta } from "@/lib/exercise-library"

function blankExercise(): WorkoutPlanExercise {
  return { name: "", sets: 3, reps: "8-12", rest_seconds: 90, notes: "" }
}

function deepCloneDay(day: WorkoutPlanDay): WorkoutPlanDay {
  return JSON.parse(JSON.stringify(day)) as WorkoutPlanDay
}

export default function DateWorkoutEditorModal({
  open,
  title,
  initialDay,
  onClose,
  onSave,
}: {
  open: boolean
  title: string
  initialDay: WorkoutPlanDay
  onClose: () => void
  onSave: (day: WorkoutPlanDay) => void
}) {
  const seed = useMemo(() => deepCloneDay(initialDay), [initialDay])
  const [draft, setDraft] = useState<WorkoutPlanDay>(seed)

  useEffect(() => {
    setDraft(seed)
  }, [seed])

  if (!open) return null

  const updateExercise = (idx: number, patch: Partial<WorkoutPlanExercise>) => {
    const next = [...(draft.exercises || [])]
    next[idx] = { ...next[idx], ...patch }
    setDraft({ ...draft, exercises: next })
  }

  const addExercise = () => {
    setDraft({ ...draft, exercises: [...(draft.exercises || []), blankExercise()] })
  }

  const removeExercise = (idx: number) => {
    const next = (draft.exercises || []).filter((_, i) => i !== idx)
    setDraft({ ...draft, exercises: next.length ? next : [blankExercise()] })
  }

  const save = () => {
    const cleaned: WorkoutPlanDay = {
      ...draft,
      day_label: (draft.day_label || "Custom").trim() || "Custom",
      focus: (draft.focus || "").trim(),
      warmup: (draft.warmup || "").trim(),
      cooldown: (draft.cooldown || "").trim(),
      exercises: (draft.exercises || [])
        .map((e) => ({
          name: (e.name || "").trim(),
          sets: Number(e.sets || 0) || 3,
          reps: (e.reps || "").trim() || "8-12",
          rest_seconds: Number(e.rest_seconds || 0) || 90,
          notes: (e.notes || "").trim(),
        }))
        .filter((e) => e.name.length > 0),
    }

    if (!cleaned.exercises.length) cleaned.exercises = [blankExercise()]
    onSave(cleaned)
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className="panel anim-slide-up" onMouseDown={(e) => e.stopPropagation()}>
        <div className="head">
          <div>
            <div className="title">{title}</div>
            <div className="subtitle">Edit only this date (won’t affect other weeks).</div>
          </div>
          <button className="close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="body">
          <div className="grid">
            <div className="field">
              <label>Label</label>
              <input value={draft.day_label} onChange={(e) => setDraft({ ...draft, day_label: e.target.value })} />
            </div>
            <div className="field">
              <label>Focus</label>
              <input value={draft.focus} onChange={(e) => setDraft({ ...draft, focus: e.target.value })} placeholder="e.g., Upper Body" />
            </div>
          </div>

          <div className="field">
            <label>Warm-up</label>
            <textarea value={draft.warmup} onChange={(e) => setDraft({ ...draft, warmup: e.target.value })} rows={3} />
          </div>

          <div className="ex-head">
            <div className="ex-title">Exercises</div>
            <button className="secondary" type="button" onClick={addExercise}>
              Add exercise
            </button>
          </div>

          <div className="ex-list">
            {(draft.exercises || []).map((ex, idx) => (
              <div key={idx} className="ex">
                <div className="ex-row">
                  <div className="field" style={{ flex: 1 }}>
                    <label>Name</label>
                    <input value={ex.name} onChange={(e) => updateExercise(idx, { name: e.target.value })} placeholder="e.g., Bench Press" />
                    {ex.name?.trim() ? (
                      <div className="mt-2 border-2 border-[var(--stroke)] bg-[var(--surface-2)]/30 p-2">
                        {(() => {
                          const meta = getExerciseMeta(ex.name)
                          return (
                            <div className="flex gap-3">
                              {meta.demoSrc ? (
                                <div className="shrink-0 overflow-hidden border-2 border-[var(--stroke)] bg-[var(--surface)]">
                                  <img src={meta.demoSrc} alt={`${ex.name} demo`} className="h-20 w-20 object-cover" />
                                </div>
                              ) : null}
                              <div>
                                <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">Demo</div>
                                <div className="text-sm font-semibold text-[var(--muted)]">{meta.description}</div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    ) : null}
                  </div>
                  <div className="field small">
                    <label>Sets</label>
                    <input
                      value={String(ex.sets ?? 3)}
                      onChange={(e) => updateExercise(idx, { sets: Number(e.target.value) })}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="field small">
                    <label>Reps</label>
                    <input value={ex.reps} onChange={(e) => updateExercise(idx, { reps: e.target.value })} />
                  </div>
                  <div className="field small">
                    <label>Rest (s)</label>
                    <input
                      value={String(ex.rest_seconds ?? 90)}
                      onChange={(e) => updateExercise(idx, { rest_seconds: Number(e.target.value) })}
                      inputMode="numeric"
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Notes</label>
                  <input value={ex.notes} onChange={(e) => updateExercise(idx, { notes: e.target.value })} placeholder="Optional" />
                </div>
                <div className="ex-actions">
                  <button className="danger" type="button" onClick={() => removeExercise(idx)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="field">
            <label>Cool-down</label>
            <textarea value={draft.cooldown} onChange={(e) => setDraft({ ...draft, cooldown: e.target.value })} rows={3} />
          </div>

          <div className="footer">
            <button className="secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary" type="button" onClick={save}>
              Save for this date
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(46, 53, 31, 0.28);
          z-index: 80;
          display: grid;
          place-items: center;
          padding: 16px;
        }

        .panel {
          width: min(880px, 96vw);
          max-height: 92dvh;
          overflow: auto;
          background: var(--surface);
          border: 2px solid var(--stroke);
          box-shadow: var(--shadow-1);
        }

        .head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 14px;
          border-bottom: 2px solid var(--stroke);
        }

        .title {
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-size: 0.85rem;
        }

        .subtitle {
          margin-top: 6px;
          color: var(--muted);
          font-weight: 800;
        }

        .close {
          border: 2px solid var(--stroke);
          background: var(--surface);
          cursor: pointer;
          padding: 6px 10px;
          font-weight: 900;
          transition: transform 160ms ease, background 160ms ease, color 160ms ease;
        }

        .close:hover {
          background: var(--olivewood);
          color: var(--parchment);
          transform: translateY(-1px);
        }

        .body {
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        label {
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-size: 0.72rem;
        }

        input,
        textarea {
          border: 2px solid var(--stroke);
          padding: 10px 12px;
          background: var(--parchment);
          color: var(--olivewood);
          box-shadow: var(--shadow-2);
          font-weight: 800;
        }

        textarea {
          resize: vertical;
        }

        .ex-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .ex-title {
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-size: 0.85rem;
        }

        .ex-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ex {
          border: 2px solid var(--stroke);
          background: var(--surface);
          box-shadow: var(--shadow-2);
          padding: 12px;
        }

        .ex-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: flex-end;
        }

        .small {
          width: 110px;
        }

        .ex-actions {
          margin-top: 10px;
          display: flex;
          justify-content: flex-end;
        }

        .footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 6px;
        }

        .secondary {
          padding: 10px 12px;
          background: var(--surface);
          border: 2px solid var(--stroke);
          color: var(--olivewood);
          cursor: pointer;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-size: 0.78rem;
          transition: transform 160ms ease, background 160ms ease, color 160ms ease;
        }

        .secondary:hover {
          background: var(--olivewood);
          color: var(--parchment);
          transform: translateY(-1px);
        }

        .primary {
          padding: 10px 12px;
          background: var(--olivewood);
          border: 2px solid var(--stroke);
          color: var(--parchment);
          cursor: pointer;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-size: 0.78rem;
          transition: transform 160ms ease, background 160ms ease;
        }

        .primary:hover {
          background: var(--bark);
          transform: translateY(-1px);
        }

        .danger {
          padding: 8px 10px;
          background: transparent;
          border: 2px solid var(--stroke);
          color: var(--bark);
          cursor: pointer;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-size: 0.72rem;
          transition: transform 160ms ease, background 160ms ease, color 160ms ease;
        }

        .danger:hover {
          background: #b00020;
          color: var(--parchment);
          transform: translateY(-1px);
        }

        @media (min-width: 840px) {
          .grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  )
}
