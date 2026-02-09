"use client"

import { useEffect } from "react"

export default function SWRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js")
      } catch {
        // If registration fails, the app still works as a normal website.
      }
    }

    register()
  }, [])

  return null
}
