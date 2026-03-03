"use client"

import { motion } from "framer-motion"
import { formatLargeCurrency, calculateLeakStats } from "@/lib/moneytag-data"
import { AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react"
import { useToptierAgencies } from "@/hooks/use-spending-data"

export function LeakCounter() {
  const { data, isLoading } = useToptierAgencies()
  const stats = data ? calculateLeakStats(data.results) : null

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
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
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
