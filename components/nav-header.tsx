"use client"

import { motion } from "framer-motion"
import { Shield } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export type Screen = "mission" | "ledger"

interface NavHeaderProps {
  activeScreen: Screen
  onNavigate: (screen: Screen) => void
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-7 w-7" />

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-7 w-7 items-center justify-center border border-border text-muted-foreground transition-colors hover:text-primary"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
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

      <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-1.5 w-1.5 bg-primary"
          />
          <span className="hidden md:inline">LIVE DATA</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
