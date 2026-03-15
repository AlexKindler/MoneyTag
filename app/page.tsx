"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { NavHeader } from "@/components/nav-header"
import { LeakCounter } from "@/components/leak-counter"
import { ScreenMission } from "@/components/screen-mission"
import { ScreenLedger } from "@/components/screen-ledger"
import { ErrorBoundary } from "@/components/error-boundary"
import type { Screen } from "@/components/nav-header"

export default function MoneyTagApp(): React.JSX.Element {
  const [activeScreen, setActiveScreen] = useState<Screen>("mission")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LeakCounter />
      <NavHeader activeScreen={activeScreen} onNavigate={setActiveScreen} />

      <main className="flex-1">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            {activeScreen === "mission" && (
              <motion.div
                key="mission"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ScreenMission onNavigate={setActiveScreen} />
              </motion.div>
            )}
            {activeScreen === "ledger" && (
              <motion.div
                key="ledger"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ScreenLedger />
              </motion.div>
            )}
          </AnimatePresence>
        </ErrorBoundary>
      </main>

      <footer className="relative overflow-hidden border-t border-border px-6 py-4">
        <svg className="circuit-bg-pulse absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="circuit" x="0" y="0" width="120" height="80" patternUnits="userSpaceOnUse">
              <line x1="0" y1="20" x2="40" y2="20" stroke="#00FF41" strokeWidth="0.5" opacity="0.15" />
              <line x1="40" y1="20" x2="40" y2="50" stroke="#00FF41" strokeWidth="0.5" opacity="0.15" />
              <line x1="40" y1="50" x2="80" y2="50" stroke="#00FF41" strokeWidth="0.5" opacity="0.15" />
              <line x1="80" y1="50" x2="80" y2="20" stroke="#00FF41" strokeWidth="0.5" opacity="0.12" />
              <line x1="80" y1="20" x2="120" y2="20" stroke="#00FF41" strokeWidth="0.5" opacity="0.1" />
              <line x1="60" y1="0" x2="60" y2="30" stroke="#00FF41" strokeWidth="0.3" opacity="0.1" />
              <line x1="100" y1="40" x2="100" y2="80" stroke="#00FF41" strokeWidth="0.3" opacity="0.08" />
              <circle cx="40" cy="20" r="1.5" fill="#00FF41" opacity="0.2" />
              <circle cx="80" cy="50" r="1.5" fill="#00FF41" opacity="0.15" />
              <circle cx="40" cy="50" r="1" fill="#00FF41" opacity="0.12" />
              <rect x="58" y="28" width="4" height="4" fill="none" stroke="#00FF41" strokeWidth="0.5" opacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
        <div className="relative z-10 flex flex-col items-center justify-between gap-2 md:flex-row">
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
            MONEYTAG v1.0 | FEDERAL SPENDING TRANSPARENCY TOOL
          </span>
          <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
            <span>VIBE CODING HACKATHON 2026</span>
            <a
              href="https://api.usaspending.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              DATA: USASPENDING.GOV
            </a>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 bg-primary" />
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
        </div>
      </footer>

      <div className="scan-line-effect pointer-events-none fixed inset-0 z-50" aria-hidden="true" />
    </div>
  )
}
