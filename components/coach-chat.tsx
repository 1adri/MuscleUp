"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useWorkout } from "@/app/providers"
import type { CalendarDateOverride, ChatMessage, WorkoutPlan } from "@/lib/types"

type CoachResult = {
  answer: string
  did_update_plan: boolean
  updated_plan: WorkoutPlan | null
  did_update_calendar: boolean
  updated_calendar: { trainingWeekdays: number[]; dateOverrides: Record<string, CalendarDateOverride> } | null
}

export default function CoachChat() {
  const { plan, formData, calendar, workoutLog, chatMessages, setChatMessages, setPlan, setTrainingWeekdays, setDateOverride } = useWorkout()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [isChatting, setIsChatting] = useState(false)
  const [error, setError] = useState<string>("")
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const hasPlan = !!plan

  const placeholder = useMemo(() => {
    if (!hasPlan) return "Create a plan first, then ask questions here…"
    return "Ask anything… or request a change (e.g., ‘Move workouts to Tue/Thu/Sat’)"
  }, [hasPlan])

  const resize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "0px"
    const next = Math.min(el.scrollHeight, 160)
    el.style.height = `${next}px`
  }

  useEffect(() => {
    resize()
  }, [open])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [chatMessages, isChatting, open])

  const send = async () => {
    if (!plan) return
    const trimmed = input.trim()
    if (!trimmed || isChatting) return
    setError("")
    setInput("")
    requestAnimationFrame(resize)

    const nextMessages: ChatMessage[] = [...chatMessages, { role: "user", content: trimmed }]
    setChatMessages(nextMessages)
    setIsChatting(true)

    try {
      const res = await fetch("/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          user_profile: formData,
          calendar: { ...calendar, workoutLog },
          messages: nextMessages,
        }),
      })

      const data = (await res.json()) as { result?: CoachResult; error?: string }
      if (!res.ok || !data.result) {
        throw new Error(data?.error || "Failed to chat with the coach.")
      }

      const r = data.result
      if (r.did_update_plan && r.updated_plan) {
        setPlan(r.updated_plan)
      }
      if (r.did_update_calendar && r.updated_calendar?.trainingWeekdays) {
        setTrainingWeekdays(r.updated_calendar.trainingWeekdays)
        // Apply dateOverrides as one-off changes (if any)
        if (r.updated_calendar.dateOverrides && typeof r.updated_calendar.dateOverrides === "object") {
          for (const [k, v] of Object.entries(r.updated_calendar.dateOverrides)) {
            // allow coach to remove an override by sending null/undefined
            if (!v) {
              setDateOverride(k, null)
            } else {
              setDateOverride(k, v as CalendarDateOverride)
            }
          }
        }
      }

      setChatMessages((prev) => [...prev, { role: "assistant", content: r.answer }])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong contacting the coach. Double-check your OPENAI_API_KEY and try again.",
        },
      ])
    } finally {
      setIsChatting(false)
    }
  }

  return (
    <>
      <button
        className="coach-fab"
        onClick={() => setOpen((p) => !p)}
        aria-label={open ? "Close coach" : "Open coach"}
      >
        Coach
      </button>

      {open ? (
        <div className="coach-overlay" role="dialog" aria-modal="true">
          <div className="coach-panel anim-slide-up">
            <div className="coach-head">
              <div>
                <div className="coach-title">Coach</div>
                <div className="coach-sub">
                  {hasPlan
                    ? "Ask questions or request changes. I can also move your workout days on the calendar."
                    : "Generate a plan first to unlock plan edits."}
                </div>
              </div>
              <button className="coach-close" onClick={() => setOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="coach-body" ref={scrollRef}>
              {chatMessages.length === 0 ? (
                <div className="coach-empty">
                  {hasPlan
                    ? "No messages yet. Try: ‘Make workouts 45 minutes’ or ‘Move workouts to Tue/Thu/Sat’."
                    : "Create a plan on the Home page, then come back here."}
                </div>
              ) : null}
              {chatMessages.map((m, idx) => (
                <div key={idx} className={m.role === "user" ? "bubble bubble-user" : "bubble bubble-assistant"}>
                  {m.content}
                </div>
              ))}
              {isChatting ? <div className="coach-typing">Coach is typing…</div> : null}
            </div>

            {error ? (
              <div className="coach-error" role="alert">
                {error}
              </div>
            ) : null}

            <div className="coach-compose">
              <div
                className={"compose-shell" + (!hasPlan ? " compose-disabled" : "")}
                aria-disabled={!hasPlan}
              >
                <textarea
                  ref={textareaRef}
                  className="compose-input"
                  value={input}
                  rows={1}
                  disabled={!hasPlan}
                  placeholder={placeholder}
                  onChange={(e) => {
                    setInput(e.target.value)
                    requestAnimationFrame(resize)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      void send()
                    }
                  }}
                />
              </div>

              <div className="compose-row">
                <button
                  className="compose-send"
                  type="button"
                  onClick={() => void send()}
                  disabled={!hasPlan || isChatting || !input.trim()}
                >
                  Send
                </button>
              </div>
              <div className="compose-hint">Enter to send · Shift+Enter for a new line</div>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .coach-fab {
          position: fixed;
          right: 16px;
          bottom: 16px;
          z-index: 50;
          border: 2px solid var(--stroke);
          background: var(--olivewood);
          color: var(--parchment);
          padding: 12px 14px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          box-shadow: var(--shadow-2);
          transition: transform 160ms ease, background 160ms ease, color 160ms ease;
        }
        .coach-fab:hover {
          background: var(--bark);
          transform: translateY(-1px);
        }

        .coach-overlay {
          position: fixed;
          inset: 0;
          background: rgba(46, 53, 31, 0.22);
          z-index: 60;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          padding: 16px;
        }

        .coach-panel {
          width: min(420px, 92vw);
          height: min(720px, 86vh);
          background: var(--surface);
          border: 2px solid var(--stroke);
          box-shadow: var(--shadow-1);
          display: flex;
          flex-direction: column;
        }

        .coach-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 14px;
          border-bottom: 2px solid var(--stroke);
        }

        .coach-title {
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .coach-sub {
          margin-top: 6px;
          color: var(--muted);
          font-weight: 700;
          font-size: 0.9rem;
          line-height: 1.35;
        }

        .coach-close {
          border: 2px solid var(--stroke);
          background: var(--surface);
          cursor: pointer;
          padding: 6px 10px;
          font-weight: 900;
          transition: transform 160ms ease, background 160ms ease, color 160ms ease;
        }
        .coach-close:hover {
          background: var(--olivewood);
          color: var(--parchment);
          transform: translateY(-1px);
        }

        .coach-body {
          flex: 1;
          padding: 14px;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .bubble {
          border: 2px solid var(--stroke);
          padding: 10px 12px;
          line-height: 1.45;
          white-space: pre-wrap;
          word-break: break-word;
          max-width: 92%;
          box-shadow: var(--shadow-2);
        }

        .bubble-user {
          align-self: flex-end;
          background: var(--olivewood);
          color: var(--parchment);
        }

        .bubble-assistant {
          align-self: flex-start;
          background: var(--surface);
          color: var(--olivewood);
        }

        .coach-empty {
          color: var(--muted);
          font-weight: 700;
          line-height: 1.4;
        }

        .coach-typing {
          color: var(--muted);
          font-weight: 800;
          font-size: 0.9rem;
        }

        .coach-error {
          border-top: 2px solid var(--stroke);
          padding: 10px 14px;
          color: #b00020;
          font-weight: 800;
        }

        .coach-compose {
          border-top: 2px solid var(--stroke);
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .compose-shell {
          border: 2px solid var(--stroke);
          background: var(--surface);
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: var(--shadow-2);
        }

        .compose-disabled {
          opacity: 0.55;
        }

        .compose-input {
          width: 100%;
          resize: none;
          border: none;
          outline: none;
          font-weight: 700;
          line-height: 1.4;
          background: transparent;
        }

        .compose-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 2px;
        }

        .compose-send {
          border: 2px solid var(--stroke);
          background: var(--olivewood);
          color: var(--parchment);
          padding: 10px 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: transform 160ms ease, background 160ms ease, color 160ms ease;
          width: 100%;
        }

        .compose-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .compose-send:hover:enabled {
          background: var(--bark);
          transform: translateY(-1px);
        }

        .compose-hint {
          color: var(--muted);
          font-weight: 700;
          font-size: 0.85rem;
        }
      `}</style>
    </>
  )
}
