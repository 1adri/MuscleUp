
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const NAV = [
  { href: "/home", label: "Home" },
  { href: "/calendar", label: "Calendar" },
  { href: "/plan", label: "Plan" },
  { href: "/profile", label: "Profile" },
] as const

function MobileMenu() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onPointer(e: PointerEvent) {
      if (!wrapperRef.current) return
      const target = e.target as Node
      if (!wrapperRef.current.contains(target)) setOpen(false)
    }

    document.addEventListener("pointerdown", onPointer)
    return () => document.removeEventListener("pointerdown", onPointer)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <div className="relative" ref={wrapperRef}>
      <Button
        variant="outline"
        className="font-black rounded-full"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
      >
        Menu
      </Button>

      {open && (
        <div id="mobile-nav" className="absolute right-0 mt-2 w-48 rounded-md border bg-[var(--surface)] shadow z-50">
          <nav className="flex flex-col p-2">
            {NAV.map((item) => {
              const active = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded px-3 py-2 text-sm font-extrabold uppercase tracking-[0.12em] transition text-left",
                    active ? "bg-[var(--olivewood)] text-[var(--parchment)]" : "text-[var(--olivewood)]"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </div>
  )
}

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideNav = pathname === "/"

  return (
    <div className="min-h-dvh bg-[var(--app-bg)] text-[var(--text)]">
      {!hideNav ? (
        <header className="sticky top-0 z-40 border-b border-[var(--stroke)]/40 bg-[color-mix(in_srgb,var(--surface)_75%,transparent)] backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/home" className="group flex items-baseline gap-2">
              <span className="text-lg font-black tracking-tight">MuscleUp</span>
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--muted)] group-hover:text-[var(--text)] transition-colors">
                focus & consistency
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map((item) => {
                const active =
                  pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-3 py-2 text-sm font-extrabold uppercase tracking-[0.12em] transition",
                      "hover:bg-[var(--olivewood)] hover:text-[var(--parchment)]",
                      active ? "bg-[var(--olivewood)] text-[var(--parchment)]" : "text-[var(--olivewood)]"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="md:hidden relative" ref={undefined}>
              {/* Mobile menu toggle */}
              <MobileMenu />
            </div>
          </div>
        </header>
      ) : null}

      <main className={cn("mx-auto max-w-6xl px-4", hideNav ? "" : "py-8")}>{children}</main>
    </div>
  )
}
