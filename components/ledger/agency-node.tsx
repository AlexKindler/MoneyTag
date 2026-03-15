"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Loader2 } from "lucide-react"
import {
  formatCurrency,
  buildBudgetFunctionNodes,
  buildFederalAccountNodes,
} from "@/lib/moneytag-data"
import type { LedgerNode } from "@/lib/moneytag-data"
import { useAgencyDetail, useFederalAccounts } from "@/hooks/use-spending-data"
import { getNodeIcon, getStatusStyle } from "./shared"
import { FundingPathTooltip } from "./funding-tooltip"
import { MoneyFlowConnector } from "./money-flow"
import { DetailModal } from "./detail-modal"
import { ChildNode } from "./child-node"

// --- Expandable Agency Node ---
export const AgencyNode = React.memo(function AgencyNode({ node }: { node: LedgerNode }) {
  const [expanded, setExpanded] = useState(false)
  const [viewMode, setViewMode] = useState<"budget" | "accounts">("budget")
  const [hovered, setHovered] = useState(false)
  const [selectedNode, setSelectedNode] = useState<LedgerNode | null>(null)

  const { data: agencyDetail, isLoading: loadingDetail } = useAgencyDetail(
    expanded ? node.toptierCode || null : null
  )
  const { data: fedAccounts, isLoading: loadingAccounts } = useFederalAccounts(
    expanded && viewMode === "accounts" ? node.toptierCode || null : null
  )

  const budgetNodes = agencyDetail
    ? buildBudgetFunctionNodes(agencyDetail.budget_functions.results, node)
    : []

  const accountNodes = fedAccounts
    ? buildFederalAccountNodes(fedAccounts.results, node)
    : []

  const childNodes = viewMode === "budget" ? budgetNodes : accountNodes
  const isLoading = viewMode === "budget" ? loadingDetail : loadingAccounts

  return (
    <>
      <div className="flex flex-col">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          role="treeitem"
          aria-expanded={expanded}
          aria-label={`${node.name}, ${formatCurrency(node.amount)}`}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded(!expanded) } }}
          className={`relative flex cursor-pointer items-center gap-3 border p-3 transition-all ${getStatusStyle(node.status)} ${hovered ? "border-primary/50" : ""}`}
          onClick={() => !isLoading && setExpanded(!expanded)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center font-mono text-[10px] text-muted-foreground">
            D{node.depth}
          </div>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-primary/30 text-primary">
            {getNodeIcon(node.type)}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="truncate font-mono text-xs font-bold text-foreground">{node.name}</span>
              {node.abbreviation && (
                <span className="shrink-0 font-mono text-[10px] text-primary">({node.abbreviation})</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <code className="font-mono text-[10px] text-muted-foreground">{node.sourceCode}</code>
              {node.percentOfParent !== undefined && (
                <span className="font-mono text-[9px] text-muted-foreground">
                  {node.percentOfParent.toFixed(2)}% of budget
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span className="font-mono text-sm font-bold text-primary">{formatCurrency(node.amount)}</span>
            {node.outlayAmount !== undefined && node.outlayAmount > 0 && (
              <span className="font-mono text-[9px] text-muted-foreground">
                Outlayed: {formatCurrency(node.outlayAmount)}
              </span>
            )}
          </div>

          <motion.div animate={{ rotate: expanded ? 90 : 0 }} className="shrink-0 text-muted-foreground">
            <ChevronRight className="h-4 w-4" />
          </motion.div>

          <AnimatePresence>
            {hovered && node.parentTrail.length > 0 && <FundingPathTooltip node={node} />}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative ml-4 mt-1 flex flex-col gap-1 border-l border-border pl-4 md:ml-8"
            >
              <div className="flow-line absolute bottom-0 left-0 top-0 w-px" />

              <div className="flex items-center gap-2 py-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setViewMode("budget") }}
                  className={`font-mono text-[10px] tracking-wider px-3 py-1 border transition-colors ${
                    viewMode === "budget"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  BUDGET FUNCTIONS
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setViewMode("accounts") }}
                  className={`font-mono text-[10px] tracking-wider px-3 py-1 border transition-colors ${
                    viewMode === "accounts"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  FEDERAL ACCOUNTS
                </button>
              </div>

              <MoneyFlowConnector />

              {isLoading && (
                <div className="flex animate-pulse items-center gap-2 py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="font-mono text-xs text-muted-foreground">Loading from USASpending API...</span>
                </div>
              )}

              {!isLoading && childNodes.length === 0 && (
                <div className="py-4 font-mono text-xs text-muted-foreground">No data available for this view.</div>
              )}

              {!isLoading && childNodes.map((child) => (
                <ChildNode key={child.id} node={child} onSelect={setSelectedNode} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedNode && <DetailModal node={selectedNode} onClose={() => setSelectedNode(null)} />}
      </AnimatePresence>
    </>
  )
})
