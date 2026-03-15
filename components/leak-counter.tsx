"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formatLargeCurrency, calculateLeakStats } from "@/lib/moneytag-data"
import { AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react"
import { useToptierAgencies } from "@/hooks/use-spending-data"

function ObligationTooltip({ obligatedPct, unobligatedPct }: { obligatedPct: number; unobligatedPct: number }) {
  const obligatedAngle = (obligatedPct / 100) * 360
  const rad = (obligatedAngle - 90) * (Math.PI / 180)
  const largeArc = obligatedPct > 50 ? 1 : 0
  const x = 20 + 16 * Math.cos(rad)
  const y = 20 + 16 * Math.sin(rad)

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 border border-border bg-card p-3 shadow-lg"
    >
      <svg width="60" height="60" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="16" fill="none" stroke="#1a1a1a" strokeWidth="3" />
        <path
          d={`M20,4 A16,16 0 ${largeArc},1 ${x},${y}`}
          fill="none"
          stroke="#00FF41"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d={`M${x},${y} A16,16 0 ${1 - largeArc},1 20,4`}
          fill="none"
          stroke="#FF3131"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <div className="mt-1 space-y-0.5 font-mono text-[9px]">
        <div className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 bg-[#00FF41]" />
          <span className="text-muted-foreground">OBLIGATED {obligatedPct.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 bg-[#FF3131]" />
          <span className="text-muted-foreground">UNOBLIGATED {unobligatedPct.toFixed(1)}%</span>
        </div>
      </div>
    </motion.div>
  )
}

export function LeakCounter() {
  const { data, isLoading } = useToptierAgencies()
  const stats = data ? calculateLeakStats(data.results) : null
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5 font-mono text-sm md:px-6 md:py-3"
    >
      {isLoading || !stats ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Connecting to USASpending API...</span>
        </div>
      ) : (
        <div
          className="relative flex flex-wrap items-center gap-4 md:gap-6"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="hidden text-xs text-muted-foreground md:inline">Obligated:</span>
            <span className="glow-green text-xs text-primary md:text-sm">{formatLargeCurrency(stats.totalObligated)}</span>
            <span className="text-[10px] text-muted-foreground">({stats.obligatedPercent.toFixed(1)}%)</span>
          </div>
          <div className="hidden h-4 w-px bg-border md:block" />
          <div className="flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-destructive" />
            <span className="hidden text-xs text-muted-foreground md:inline">Unobligated:</span>
            <span className="glow-red text-xs text-destructive md:text-sm">{formatLargeCurrency(stats.unobligated)}</span>
            <span className="text-[10px] text-muted-foreground">({stats.unobligatedPercent.toFixed(1)}%)</span>
          </div>
          <div className="hidden h-4 w-px bg-border md:block" />
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-xs text-muted-foreground">Agencies:</span>
            <span className="text-xs text-foreground">{stats.agencyCount}</span>
          </div>
          <AnimatePresence>
            {showTooltip && (
              <ObligationTooltip
                obligatedPct={stats.obligatedPercent}
                unobligatedPct={stats.unobligatedPercent}
              />
            )}
          </AnimatePresence>
        </div>
      )}
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <span className="hidden text-xs text-destructive md:inline">LEAK COUNTER</span>
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-2 w-2 bg-destructive"
        />
      </div>
    </motion.div>
  )
}
