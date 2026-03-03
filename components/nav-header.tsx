"use client"

import { motion } from "framer-motion"
import { Shield } from "lucide-react"

export type Screen = "mission" | "ledger"

interface NavHeaderProps {
  activeScreen: Screen
  onNavigate: (screen: Screen) => void
}

export function NavHeader({ activeScreen, onNavigate }: NavHeaderProps) {
  const navItems = [
    { id: "mission" as const, label: "THE MISSION", number: "01" },
    { id: "ledger" as const, label: "THE LEDGER", number: "02" },
  ]

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center border border-primary bg-primary/10">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-sm font-bold tracking-[0.3em] text-primary">MONEYTAG</span>
          <span className="hidden font-mono text-[10px] tracking-wider text-muted-foreground md:block">FEDERAL SPENDING TRANSPARENCY</span>
        </div>
      </div>

      <nav className="flex items-center gap-1" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="group relative flex items-center gap-2 px-3 py-2 font-mono text-xs tracking-wider transition-colors md:px-4"
            aria-current={activeScreen === item.id ? "page" : undefined}
          >
            <span className="text-muted-foreground">{item.number}</span>
            <span className={activeScreen === item.id ? "text-primary" : "text-secondary-foreground hover:text-primary"}>
              {item.label}
            </span>
            {activeScreen === item.id && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute inset-x-0 bottom-0 h-px bg-primary"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-1.5 w-1.5 bg-primary"
          />
          <span className="hidden md:inline">LIVE DATA</span>
        </div>
      </div>
    </header>
  )
}
