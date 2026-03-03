"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Landmark,
  Building2,
  Users,
  FileText,
  X,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Loader2,
  DollarSign,
  Info,
} from "lucide-react"
import {
  formatCurrency,
  getCategoryColor,
  buildToptierTree,
  buildBudgetFunctionNodes,
  buildFederalAccountNodes,
  getCurrentFiscalYear,
} from "@/lib/moneytag-data"
import type { LedgerNode, NodeType } from "@/lib/moneytag-data"
import { useToptierAgencies, useAgencyDetail, useFederalAccounts } from "@/hooks/use-spending-data"

// --- Icon mapping for node types ---
function getNodeIcon(type: NodeType) {
  switch (type) {
    case "treasury": return <Landmark className="h-4 w-4" />
    case "agency": return <Building2 className="h-4 w-4" />
    case "sub-agency": return <Users className="h-4 w-4" />
    case "budget-function": return <FileText className="h-4 w-4" />
    case "federal-account": return <FileText className="h-4 w-4" />
    case "treasury-account": return <DollarSign className="h-4 w-4" />
    case "terminal": return <DollarSign className="h-4 w-4" />
    default: return <FileText className="h-4 w-4" />
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "verified": return "border-primary/30 bg-primary/5"
    case "pending": return "border-[#ffcc00]/30 bg-[#ffcc00]/5"
    case "flagged": return "border-destructive/30 bg-destructive/5"
    default: return "border-border bg-card"
  }
}

function getStatusTextColor(status: string) {
  switch (status) {
    case "verified": return "text-primary"
    case "pending": return "text-[#ffcc00]"
    case "flagged": return "text-destructive"
    default: return "text-muted-foreground"
  }
}

// --- Spending Blurb for D3 nodes ---
function SpendingBlurb({ node }: { node: LedgerNode }) {
  const [blurb, setBlurb] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (node.depth !== 3) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchBlurb() {
      try {
        console.log("[v0] Fetching blurb for node:", node.name, "depth:", node.depth)
        const res = await fetch("/api/spending/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: node.name,
            sourceCode: node.sourceCode,
            amount: node.amount,
            outlayAmount: node.outlayAmount,
            category: node.category,
            parentTrail: node.parentTrail,
            depth: node.depth,
          }),
        })

        console.log("[v0] Response status:", res.status)
        if (!res.ok) {
          const errorText = await res.text()
          console.log("[v0] Error response:", errorText)
          throw new Error("Failed to fetch")
        }
        const data = await res.json()
        console.log("[v0] Response data:", data)
        if (!cancelled && data.blurb) {
          setBlurb(data.blurb)
        }
      } catch (err) {
        console.log("[v0] Fetch error:", err)
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchBlurb()
    return () => { cancelled = true }
  }, [node])

  if (node.depth !== 3) return null

  return (
    <div className="space-y-1">
      <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
        WHAT THIS MONEY PAYS FOR
      </span>
      <div className="border border-border bg-secondary/50 px-4 py-3">
        {loading && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            <span className="font-mono text-[10px] text-muted-foreground">
              Generating plain-language explanation...
            </span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 text-[#ffcc00]" />
            <span className="font-mono text-[10px] text-muted-foreground">
              Unable to generate explanation at this time.
            </span>
          </div>
        )}
        {blurb && (
          <div className="flex gap-2.5">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="font-mono text-[11px] leading-relaxed text-foreground/90">
              {blurb}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Detail Modal (real data only) ---
function DetailModal({ node, onClose }: { node: LedgerNode; onClose: () => void }) {
  const catColor = node.category ? getCategoryColor(node.category) : "#00FF41"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto border border-border bg-card"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border" style={{ borderColor: catColor, color: catColor }}>
              {getNodeIcon(node.type)}
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-foreground">{node.name}</h3>
              <span className="font-mono text-[10px] text-muted-foreground">USASPENDING DETAIL</span>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Close detail">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {/* Source code from USASpending */}
          <div className="space-y-1">
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground">SOURCE CODE</span>
            <div className="border border-border bg-secondary/50 px-3 py-2">
              <code className="font-mono text-xs text-primary">{node.sourceCode}</code>
            </div>
          </div>

          {/* Link to USASpending */}
          <div className="space-y-1">
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground">USASPENDING.GOV</span>
            <a
              href={node.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-border bg-secondary/50 px-3 py-2 transition-colors hover:border-primary/50"
            >
              <code className="flex-1 truncate font-mono text-xs text-primary">{node.sourceUrl}</code>
              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
            </a>
          </div>

          {/* Dollar amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                {node.depth <= 1 ? "BUDGET AUTHORITY" : "OBLIGATED"}
              </span>
              <div className="border border-border bg-secondary/50 px-3 py-2">
                <span className="font-mono text-lg font-bold" style={{ color: catColor }}>{formatCurrency(node.amount)}</span>
              </div>
            </div>
            {node.outlayAmount !== undefined && (
              <div className="space-y-1">
                <span className="font-mono text-[10px] tracking-wider text-muted-foreground">OUTLAYED</span>
                <div className="border border-border bg-secondary/50 px-3 py-2">
                  <span className="font-mono text-lg font-bold text-foreground">{formatCurrency(node.outlayAmount)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          {node.category && (
            <div className="space-y-1">
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground">SPENDING CATEGORY</span>
              <div className="border border-border bg-secondary/50 px-3 py-2">
                <span className="font-mono text-xs" style={{ color: catColor }}>{node.category}</span>
              </div>
            </div>
          )}

          {/* AI-generated spending blurb for D3 nodes */}
          <SpendingBlurb node={node} />

          {/* Share of parent */}
          {node.percentOfParent !== undefined && (
            <div className="space-y-1">
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground">SHARE OF PARENT</span>
              <div className="border border-border bg-secondary/50 px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 bg-secondary">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${Math.min(node.percentOfParent, 100)}%`,
                        backgroundColor: catColor,
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs text-foreground">{node.percentOfParent.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Funding path (real labels) */}
          <div className="space-y-1">
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground">FUNDING PATH</span>
            <div className="space-y-1 border border-border bg-secondary/50 p-3">
              {node.parentTrail.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">D{i}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <code className="font-mono text-[10px] text-foreground">{label}</code>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-primary">D{node.depth}</span>
                <ChevronRight className="h-3 w-3 text-primary" />
                <code className="font-mono text-[10px] text-primary">{node.sourceCode}</code>
              </div>
            </div>
          </div>

          {/* Audit flag */}
          {node.status === "flagged" && (
            <div className="flex items-center gap-3 border border-destructive bg-destructive/10 px-4 py-3 pulse-red">
              <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
              <div>
                <span className="font-mono text-xs font-bold text-destructive">AUDIT FLAG</span>
                <p className="font-mono text-[10px] text-destructive/80">
                  This node is categorized as administrative overhead and flagged for review.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className={`font-mono text-xs font-bold ${getStatusTextColor(node.status)}`}>
              STATUS: {node.status.toUpperCase()}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">DEPTH: {node.depth}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// --- Funding path tooltip ---
function FundingPathTooltip({ node }: { node: LedgerNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="absolute left-0 top-full z-40 mt-2 w-80 border border-border bg-card p-4 shadow-lg md:left-1/2 md:-translate-x-1/2"
    >
      <span className="font-mono text-[10px] tracking-wider text-primary">FUNDING PATH</span>
      <div className="mt-2 space-y-1">
        {node.parentTrail.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground">D{i}</span>
            <div className="h-px flex-1 bg-border" />
            <code className="font-mono text-[10px] text-foreground">{label}</code>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-primary">D{node.depth}</span>
          <div className="h-px flex-1 bg-primary/30" />
          <code className="font-mono text-[10px] text-primary">{node.sourceCode}</code>
        </div>
      </div>
    </motion.div>
  )
}

// --- Expandable Agency Node ---
function AgencyNode({ node }: { node: LedgerNode }) {
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
          className={`relative flex cursor-pointer items-center gap-3 border p-3 transition-all ${getStatusStyle(node.status)} ${hovered ? "border-primary/50" : ""}`}
          onClick={() => setExpanded(!expanded)}
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

              {isLoading && (
                <div className="flex items-center gap-2 py-6">
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
}

// --- Child node (budget function / federal account) ---
function ChildNode({ node, onSelect }: { node: LedgerNode; onSelect: (n: LedgerNode) => void }) {
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
              <span className="font-mono text-[8px]" style={{ color: catColor }}>{node.category.toUpperCase()}</span>
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
}

// --- Terminal / leaf node ---
function TerminalNode({ node, onSelect }: { node: LedgerNode; onSelect: (n: LedgerNode) => void }) {
  const [hovered, setHovered] = useState(false)
  const catColor = node.category ? getCategoryColor(node.category) : "#00FF41"
  const isFlagged = node.status === "flagged"

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
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
}

// --- Loading skeleton ---
function SkeletonNode() {
  return (
    <div className="flex items-center gap-3 border border-border bg-card p-3">
      <div className="h-6 w-6 animate-pulse bg-secondary" />
      <div className="h-8 w-8 animate-pulse bg-secondary" />
      <div className="flex flex-1 flex-col gap-1">
        <div className="h-3 w-48 animate-pulse bg-secondary" />
        <div className="h-2 w-32 animate-pulse bg-secondary" />
      </div>
      <div className="h-4 w-20 animate-pulse bg-secondary" />
    </div>
  )
}

// --- Main Ledger Screen ---
export function ScreenLedger() {
  const { data, error, isLoading } = useToptierAgencies()

  const tree = data ? buildToptierTree(data.results) : null
  const fy = getCurrentFiscalYear()

  const agencies = tree?.children || []

  return (
    <div className="relative min-h-screen">
      <div className="grid-bg absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] text-primary">POWERED BY USASPENDING.GOV API</span>
            <h2 className="mt-1 font-mono text-3xl font-bold text-foreground">The Live Ledger</h2>
          </div>
          <div className="flex flex-col items-start gap-1.5 md:items-end">
            <div className="flex items-center gap-4 font-mono text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 bg-primary" /> VERIFIED
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 bg-[#ffcc00]" /> PENDING
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 bg-destructive" /> FLAGGED
              </span>
            </div>
          </div>
        </div>

        {/* Description panel */}
        <div className="mb-6 border border-border bg-card p-4 md:p-5">
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            <span className="font-bold text-foreground">What you{"'"}re looking at:</span>{" "}
            This is a real-time view of the entire U.S. federal budget for Fiscal Year {fy},
            sourced directly from the{" "}
            <a href="https://api.usaspending.gov" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              USASpending.gov API
            </a>
            {" "}-- the official open data source published by the U.S. Department of the Treasury.
            The tree below maps how Congress{"'"} total budget authority flows from the Treasury (D0)
            down through the top 25 federal agencies (D1), then into their specific budget functions
            or federal accounts (D2), and finally into individual sub-functions or treasury accounts (D3).
            Every dollar amount, obligation figure, and outlay shown here is pulled live from federal
            reporting data -- nothing is estimated or simulated.
          </p>
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 font-mono text-[10px] text-muted-foreground">
            <span className="font-bold text-foreground">How to explore:</span>
            <span>Click any agency to expand its spending breakdown.</span>
            <span>Toggle between <span className="text-primary">Budget Functions</span> (what the money is for) and <span className="text-primary">Federal Accounts</span> (where the money sits).</span>
            <span>Click any leaf node to open its full detail view with funding path and source links.</span>
            <span>Hover any row to see the full funding trail from Treasury to that node.</span>
          </div>
        </div>

        {/* Depth labels */}
        <div className="mb-4 flex flex-wrap items-center gap-4 font-mono text-[10px] text-muted-foreground md:gap-6">
          {[
            "D0: U.S. Treasury",
            "D1: Federal Agencies",
            "D2: Budget Functions / Federal Accounts",
            "D3: Sub-functions / Treasury Accounts",
          ].map((label) => (
            <span key={label} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              {label}
            </span>
          ))}
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 border border-destructive bg-destructive/10 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="font-mono text-xs text-destructive">Failed to load data from USASpending API. Please try again.</span>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonNode key={i} />
            ))}
          </div>
        )}

        {/* Treasury root node */}
        {tree && (
          <div className="space-y-1">
            <div className="flex items-center gap-3 border border-primary/40 bg-primary/5 p-3">
              <div className="flex h-6 w-6 items-center justify-center font-mono text-[10px] text-primary">D0</div>
              <div className="flex h-8 w-8 items-center justify-center border border-primary text-primary pulse-green">
                <Landmark className="h-5 w-5" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="font-mono text-sm font-bold text-foreground">U.S. Treasury</span>
                <a
                  href={tree.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-primary"
                >
                  <span>{tree.sourceCode}</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              <div className="flex flex-col items-end">
                <span className="glow-green font-mono text-lg font-bold text-primary">{formatCurrency(tree.amount)}</span>
                <span className="font-mono text-[9px] text-muted-foreground">TOTAL BUDGET AUTHORITY FY{fy}</span>
              </div>
            </div>

            {/* Agency children */}
            <div className="relative ml-4 flex flex-col gap-1 border-l border-border pl-4 md:ml-8">
              <div className="flow-line absolute bottom-0 left-0 top-0 w-px" />
              {agencies.map((agency) => (
                <AgencyNode key={agency.id} node={agency} />
              ))}
            </div>
          </div>
        )}

        {/* Data source attribution */}
        <div className="mt-8 border-t border-border pt-4 font-mono text-[10px] text-muted-foreground">
          <span>Data source: </span>
          <a
            href="https://api.usaspending.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            USASpending.gov API v2
          </a>
          <span> | Fiscal Year {fy} | All identifiers and dollar amounts from live federal data</span>
        </div>
      </div>
    </div>
  )
}
