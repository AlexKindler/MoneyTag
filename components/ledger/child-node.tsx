"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { formatCurrency, getCategoryColor } from "@/lib/moneytag-data"
import type { LedgerNode } from "@/lib/moneytag-data"
import { getNodeIcon, getStatusStyle } from "./shared"
import { getCategoryIcon } from "./category-icons"
import { FundingPathTooltip } from "./funding-tooltip"
import { TerminalNode } from "./terminal-node"

// --- Child node (budget function / federal account) ---
export const ChildNode = React.memo(function ChildNode({ node, onSelect }: { node: LedgerNode; onSelect: (n: LedgerNode) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const catColor = node.category ? getCategoryColor(node.category) : "#00FF41"
  const hasChildren = node.children && node.children.length > 0
  const isFlagged = node.status === "flagged"

  return (
    <div className="flex flex-col">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        role="treeitem"
        aria-expanded={hasChildren ? expanded : undefined}
        aria-label={`${node.name}, ${formatCurrency(node.amount)}`}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); hasChildren ? setExpanded(!expanded) : onSelect(node) } }}
        className={`relative flex cursor-pointer items-center gap-3 border p-2.5 transition-all ${getStatusStyle(node.status)} ${hovered ? "border-primary/50" : ""}`}
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded)
          } else {
            onSelect(node)
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex h-5 w-5 shrink-0 items-center justify-center font-mono text-[9px] text-muted-foreground">
          D{node.depth}
        </div>

        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center border ${
            isFlagged ? "border-destructive/50 text-destructive pulse-red" : "border-primary/20"
          }`}
          style={!isFlagged ? { borderColor: `${catColor}40`, color: catColor } : undefined}
        >
          {getNodeIcon(node.type)}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-mono text-[11px] font-bold text-foreground">{node.name}</span>
          <div className="flex items-center gap-2">
            <code className="font-mono text-[9px] text-muted-foreground">{node.sourceCode}</code>
            {node.category && (
              <span className="flex items-center gap-1 font-mono text-[8px]" style={{ color: catColor }}>
                {getCategoryIcon(node.category)}
                {node.category.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span
            className={`font-mono text-xs font-bold ${isFlagged ? "glow-red text-destructive" : ""}`}
            style={!isFlagged ? { color: catColor } : undefined}
          >
            {formatCurrency(node.amount)}
          </span>
          {node.percentOfParent !== undefined && (
            <span className="font-mono text-[8px] text-muted-foreground">{node.percentOfParent.toFixed(1)}%</span>
          )}
        </div>

        {hasChildren ? (
          <motion.div animate={{ rotate: expanded ? 90 : 0 }} className="shrink-0 text-muted-foreground">
            <ChevronRight className="h-3 w-3" />
          </motion.div>
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
        )}

        <AnimatePresence>
          {hovered && node.parentTrail.length > 0 && <FundingPathTooltip node={node} />}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3 md:ml-6"
          >
            <div className="flow-line absolute bottom-0 left-0 top-0 w-px" />
            {node.children!.map((sub) => (
              <TerminalNode key={sub.id} node={sub} onSelect={onSelect} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
