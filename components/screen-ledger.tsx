"use client"

import React, { useState } from "react"
import {
  Landmark,
  X,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"
import {
  formatCurrency,
  buildToptierTree,
  getCurrentFiscalYear,
} from "@/lib/moneytag-data"
import { useToptierAgencies } from "@/hooks/use-spending-data"
import { AgencyNode } from "./ledger/agency-node"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [visibleCount, setVisibleCount] = useState(10)

  const tree = data ? buildToptierTree(data.results) : null
  const fy = getCurrentFiscalYear()

  const allAgencies = tree?.children || []
  const agencies = searchTerm.trim()
    ? allAgencies.filter((a) => {
        const q = searchTerm.trim().toLowerCase()
        return (
          a.name.toLowerCase().includes(q) ||
          (a.abbreviation && a.abbreviation.toLowerCase().includes(q))
        )
      })
    : allAgencies

  const visibleAgencies = agencies.slice(0, visibleCount)
  const hasMore = visibleCount < agencies.length

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

        {/* Search / filter bar */}
        {!isLoading && !error && allAgencies.length > 0 && (
          <div className="mb-4 flex items-center gap-3 border border-[#00FF41]/30 bg-black px-3 py-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <circle cx="7" cy="7" r="4.5" stroke="#00FF41" strokeWidth="1.5" />
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="#00FF41" strokeWidth="1.5" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(10) }}
              placeholder="FILTER AGENCIES BY NAME OR ABBREVIATION..."
              className="flex-1 bg-transparent font-mono text-xs text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(""); setVisibleCount(10) }}
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <span className="shrink-0 font-mono text-[10px] tracking-wider text-muted-foreground">
              SHOWING {agencies.length} OF {allAgencies.length} AGENCIES
            </span>
          </div>
        )}

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
            <div role="tree" aria-label="Federal spending tree" className="relative ml-4 flex flex-col gap-1 border-l border-border pl-4 md:ml-8">
              <div className="flow-line absolute bottom-0 left-0 top-0 w-px" />
              {visibleAgencies.map((agency) => (
                <AgencyNode key={agency.id} node={agency} />
              ))}

              {/* Pagination info + Show More */}
              <div className="mt-2 flex flex-col items-center gap-2">
                <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                  DISPLAYING {Math.min(visibleCount, agencies.length)} OF {agencies.length} AGENCIES
                </span>
                {hasMore && (
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 10)}
                    className="w-full border border-primary/30 bg-primary/5 px-4 py-2 font-mono text-xs text-primary transition-colors hover:bg-primary/10"
                  >
                    SHOW MORE AGENCIES
                  </button>
                )}
              </div>
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
