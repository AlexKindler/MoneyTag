"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DollarSign } from "lucide-react"
import { formatCurrency, getCategoryColor } from "@/lib/moneytag-data"
import type { LedgerNode } from "@/lib/moneytag-data"
import { getStatusStyle } from "./shared"
import { FundingPathTooltip } from "./funding-tooltip"

// --- Terminal / leaf node ---
export const TerminalNode = React.memo(function TerminalNode({ node, onSelect }: { node: LedgerNode; onSelect: (n: LedgerNode) => void }) {
  const [hovered, setHovered] = useState(false)
  const catColor = node.category ? getCategoryColor(node.category) : "#00FF41"
  const isFlagged = node.status === "flagged"

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      role="treeitem"
      aria-label={`${node.name}, ${formatCurrency(node.amount)}`}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(node) } }}
      className={`relative flex cursor-pointer items-center gap-2 border p-2 transition-all ${getStatusStyle(node.status)} ${hovered ? "border-primary/50" : ""}`}
      onClick={() => onSelect(node)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex h-4 w-4 shrink-0 items-center justify-center font-mono text-[8px] text-muted-foreground">
        D{node.depth}
      </div>
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center border ${isFlagged ? "border-destructive/50 text-destructive" : ""}`}
        style={!isFlagged ? { borderColor: `${catColor}30`, color: catColor } : undefined}
      >
        <DollarSign className="h-3 w-3" />
      </div>
      <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-foreground">{node.name}</span>
      <span
        className={`shrink-0 font-mono text-[10px] font-bold ${isFlagged ? "text-destructive" : ""}`}
        style={!isFlagged ? { color: catColor } : undefined}
      >
        {formatCurrency(node.amount)}
      </span>

      <AnimatePresence>
        {hovered && node.parentTrail.length > 0 && <FundingPathTooltip node={node} />}
      </AnimatePresence>
    </motion.div>
  )
})
