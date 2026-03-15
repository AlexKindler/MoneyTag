"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import {
  X,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Info,
} from "lucide-react"
import { formatCurrency, getCategoryColor } from "@/lib/moneytag-data"
import type { LedgerNode } from "@/lib/moneytag-data"
import { getNodeIcon, getStatusTextColor, blurbCache } from "./shared"

// --- SVG spending breakdown bar ---
export function SpendingBreakdownBar({ node }: { node: LedgerNode }) {
  const obligation = node.amount || 0
  const outlay = node.outlayAmount || 0
  const remaining = Math.max(0, obligation - outlay)
  const total = obligation || 1

  const outlayPct = (outlay / total) * 100
  const remainingPct = (remaining / total) * 100

  if (!node.outlayAmount) return null

  return (
    <div className="space-y-1">
      <span className="font-mono text-[10px] tracking-wider text-muted-foreground">SPENDING FLOW</span>
      <svg width="100%" height="28" viewBox="0 0 400 28" preserveAspectRatio="none" className="border border-border">
        <rect x="0" y="0" width="400" height="28" fill="#111111" />
        <rect x="0" y="0" width={outlayPct * 4} height="28" fill="#00FF41" opacity="0.7">
          <animate attributeName="width" from="0" to={outlayPct * 4} dur="0.8s" fill="freeze" />
        </rect>
        <rect x={outlayPct * 4} y="0" width={remainingPct * 4} height="28" fill="#ffcc00" opacity="0.3">
          <animate attributeName="width" from="0" to={remainingPct * 4} dur="0.8s" fill="freeze" begin="0.4s" />
        </rect>
        <text x="8" y="18" fill="#050505" fontSize="10" fontFamily="monospace" fontWeight="bold">
          OUTLAYED {outlayPct.toFixed(1)}%
        </text>
        {remainingPct > 15 && (
          <text x={outlayPct * 4 + 8} y="18" fill="#ffcc00" fontSize="10" fontFamily="monospace">
            REMAINING {remainingPct.toFixed(1)}%
          </text>
        )}
      </svg>
    </div>
  )
}

// --- Spending Blurb for D3 nodes ---
export function SpendingBlurb({ node }: { node: LedgerNode }) {
  const [blurb, setBlurb] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (node.depth !== 3) {
      setLoading(false)
      return
    }

    let cancelled = false
    const cacheKey = node.sourceCode || node.name

    async function fetchBlurb() {
      const cached = blurbCache.get(cacheKey)
      if (cached) {
        if (!cancelled) {
          setBlurb(cached)
          setLoading(false)
        }
        return
      }

      try {
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

        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        if (!cancelled && data.blurb) {
          blurbCache.set(cacheKey, data.blurb)
          setBlurb(data.blurb)
        }
      } catch {
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
export function DetailModal({ node, onClose }: { node: LedgerNode; onClose: () => void }) {
  const catColor = node.category ? getCategoryColor(node.category) : "#00FF41"
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [copied, setCopied] = useState<"copy" | "share" | null>(null)

  // ESC key handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  // Lock body scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Auto-focus close button on mount
  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  // Focus trap: keep Tab cycling within the modal
  const handleFocusTrap = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return
    const modal = dialogRef.current
    if (!modal) return

    const focusable = modal.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleFocusTrap}
        role="dialog"
        aria-modal="true"
        aria-label="Spending details"
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
          <button ref={closeButtonRef} onClick={onClose} className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Close detail">
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

          {/* Spending breakdown bar */}
          <SpendingBreakdownBar node={node} />

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

          {/* Money trail */}
          <div className="space-y-1">
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground">MONEY TRAIL</span>
            <div className="space-y-1.5 border border-border bg-secondary/50 p-3">
              {node.parentTrail.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="truncate font-mono text-[10px] text-foreground">{label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 shrink-0 text-primary" />
                <span className="truncate font-mono text-[10px] font-bold text-primary">{node.name}</span>
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

          {/* Export / Share buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => {
                const trail = node.parentTrail.concat(node.name).join(" > ")
                const text = [
                  node.name,
                  `Source: ${node.sourceCode || "N/A"}`,
                  `Amount: ${formatCurrency(node.amount)}`,
                  node.outlayAmount !== undefined ? `Outlayed: ${formatCurrency(node.outlayAmount)}` : null,
                  node.category ? `Category: ${node.category}` : null,
                  `Money Trail: ${trail}`,
                  node.sourceUrl ? `Link: ${node.sourceUrl}` : null,
                ].filter(Boolean).join("\n")
                navigator.clipboard.writeText(text).then(() => {
                  setCopied("copy")
                  setTimeout(() => setCopied(null), 1500)
                })
              }}
              className="flex items-center gap-1.5 border border-primary/30 px-2.5 py-1.5 font-mono text-[10px] text-primary transition-colors hover:bg-primary/10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00FF41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied === "copy" ? "COPIED!" : "COPY DATA"}
            </button>
            <button
              onClick={async () => {
                const trail = node.parentTrail.concat(node.name).join(" > ")
                const text = [
                  `${node.name} — ${formatCurrency(node.amount)}`,
                  `Source: ${node.sourceCode || "N/A"}`,
                  `Trail: ${trail}`,
                  node.sourceUrl || "",
                ].filter(Boolean).join("\n")
                if (navigator.share) {
                  try {
                    await navigator.share({ title: node.name, text })
                  } catch {
                    // user cancelled share
                  }
                } else {
                  navigator.clipboard.writeText(text).then(() => {
                    setCopied("share")
                    setTimeout(() => setCopied(null), 1500)
                  })
                }
              }}
              className="flex items-center gap-1.5 border border-primary/30 px-2.5 py-1.5 font-mono text-[10px] text-primary transition-colors hover:bg-primary/10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00FF41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {copied === "share" ? "COPIED!" : "SHARE"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
