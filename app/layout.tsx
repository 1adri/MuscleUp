import React from "react"
import SWRegister from "./sw-register"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { WorkoutProvider } from "./providers"
import CoachChat from "@/components/coach-chat"
import SiteFrame from "@/components/site-frame"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'MuscleUp',
  description: 'Your personalized fitness journey starts here. Track your progress, achieve your goals.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MuscleUp',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2E351F',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <WorkoutProvider>
          <SiteFrame>{children}</SiteFrame>
          <CoachChat />
          <SWRegister />
          <Analytics />
        </WorkoutProvider>
      </body>
    </html>
  )
}
