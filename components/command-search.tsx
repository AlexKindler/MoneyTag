"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Building2, ArrowRight } from "lucide-react"
import { formatCurrency } from "@/lib/moneytag-data"
import { useToptierAgencies } from "@/hooks/use-spending-data"
import type { Screen } from "@/components/nav-header"

interface CommandSearchProps {
  onNavigate: (screen: Screen) => void
}

export function CommandSearch({ onNavigate }: CommandSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { data } = useToptierAgencies()

  const agencies = data?.results || []
  const filtered = query.trim()
    ? agencies.filter((a) => {
        const q = query.trim().toLowerCase()
        return (
          a.agency_name.toLowerCase().includes(q) ||
          a.abbreviation.toLowerCase().includes(q)
        )
      })
    : agencies.slice(0, 8)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyNav = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        onNavigate("ledger")
        setOpen(false)
      }
    },
    [filtered, selectedIndex, onNavigate]
  )

  return (
    <>
      {/* Trigger hint in nav */}
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 border border-border px-2.5 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary md:flex"
      >
        <Search className="h-3 w-3" />
        <span>Search agencies</span>
        <kbd className="ml-1 border border-border px-1 py-0.5 text-[9px]">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center bg-background/80 px-4 pt-[15vh] backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg border border-border bg-card shadow-2xl"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-primary" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyNav}
                  placeholder="Search federal agencies..."
                  className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                />
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filtered.length === 0 && (
                  <div className="px-4 py-8 text-center font-mono text-xs text-muted-foreground">
                    No agencies found matching &quot;{query}&quot;
                  </div>
                )}
                {filtered.map((agency, i) => (
                  <button
                    key={agency.toptier_code}
                    onClick={() => {
                      onNavigate("ledger")
                      setOpen(false)
                    }}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === selectedIndex
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Building2 className="h-4 w-4 shrink-0 text-primary/60" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-mono text-xs font-bold">{agency.agency_name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{agency.abbreviation}</span>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-primary">
                      {formatCurrency(agency.budget_authority_amount)}
                    </span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                  </button>
                ))}
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between border-t border-border px-4 py-2 font-mono text-[9px] text-muted-foreground">
                <span>↑↓ navigate</span>
                <span>↵ open ledger</span>
                <span>esc close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
