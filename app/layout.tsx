import type React from "react"
import type { Metadata } from "next"
import { Instrument_Serif, Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "next-auth/react"
import { SupabaseKeepAliveProvider } from "@/components/SupabaseKeepAliveProvider"
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration"

import "./globals.css"

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-instrument-serif",
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Swifty Quill",
  description:
    "SwiftyQuill is a fast, intuitive note-taking app that helps you capture ideas, organize tasks, and stay productive. With smart search, easy tagging, and seamless syncing across devices, it keeps your notes accessible and clutter-free. Whether brainstorming or planning, SwiftyQuill makes writing effortless.",
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <SessionProvider>
          <SupabaseKeepAliveProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ServiceWorkerRegistration />
              {children}
            </ThemeProvider>
          </SupabaseKeepAliveProvider>
        </SessionProvider>        
      </body>
    </html>
  )
}

