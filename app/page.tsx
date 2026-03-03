"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { NavHeader } from "@/components/nav-header"
import { LeakCounter } from "@/components/leak-counter"
import { ScreenMission } from "@/components/screen-mission"
import { ScreenLedger } from "@/components/screen-ledger"
import type { Screen } from "@/components/nav-header"

export default function MoneyTagApp(): React.JSX.Element {
  const [activeScreen, setActiveScreen] = useState<Screen>("mission")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Leak Counter - always visible at top */}
      <LeakCounter />

      {/* Navigation */}
      <NavHeader activeScreen={activeScreen} onNavigate={setActiveScreen} />

      {/* Screen Content */}
      <main className="flex-1">
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
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
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
    </div>
  )
}
