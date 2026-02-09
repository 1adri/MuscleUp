
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { hasProfile } from "@/lib/profile"

export default function Welcome() {
  const router = useRouter()
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setShowButton(true), 500)
    return () => window.clearTimeout(t)
  }, [])

  const onStart = () => {
    router.push(hasProfile() ? "/home" : "/onboarding")
  }

  return (
    <section className="relative min-h-dvh overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/hero/welcome.png"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[rgba(46,53,31,0.55)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(46,53,31,0.35)] to-[rgba(46,53,31,0.65)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-6xl items-center px-5 py-16">
        <div className="w-full max-w-2xl border-2 border-[var(--stroke)] bg-[rgba(240,233,215,0.92)] p-8 shadow-[var(--shadow-1)] backdrop-blur animate-fade-up">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">
            Lift Planner
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
            Your training,
            <br />
            planned like a system.
          </h1>

          <p className="mt-4 max-w-prose text-base font-semibold text-[var(--muted)] md:text-lg">
            Build a calendar you’ll actually follow — and track your real strength progress as you go.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {showButton ? (
              <Button
                onClick={onStart}
                className="h-11 rounded-none border-2 border-[var(--stroke)] bg-[var(--olivewood)] px-6 font-black uppercase tracking-[0.12em] text-[var(--parchment)] shadow-[var(--shadow-2)] transition hover:-translate-y-0.5 hover:bg-[var(--bark)] animate-fade-in"
              >
                Get started
              </Button>
            ) : (
              <div className="h-11 w-40" />
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-up {
          animation: fadeUp 650ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }
        .animate-fade-in {
          animation: fadeIn 450ms ease both;
        }
      `}</style>
    </section>
  )
}
