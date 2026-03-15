"use client"

import React from "react"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import type { LedgerNode } from "@/lib/moneytag-data"

// --- Funding path tooltip ---
export function FundingPathTooltip({ node }: { node: LedgerNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="absolute left-0 top-full z-40 mt-2 w-80 border border-border bg-card p-4 shadow-lg md:left-1/2 md:-translate-x-1/2"
    >
      <span className="font-mono text-[10px] tracking-wider text-primary">MONEY TRAIL</span>
      <div className="mt-2 space-y-1.5">
        {node.parentTrail.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <ChevronRight className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
            <span className="truncate font-mono text-[10px] text-foreground">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <ChevronRight className="h-2.5 w-2.5 shrink-0 text-primary" />
          <span className="truncate font-mono text-[10px] font-bold text-primary">{node.name}</span>
        </div>
      </div>
    </motion.div>
  )
}
