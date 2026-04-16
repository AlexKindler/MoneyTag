"use client"

import { motion } from "framer-motion"
import { ArrowRight, Lock, Tag, Terminal, Shield, ChevronDown, Loader2 } from "lucide-react"
import { formatLargeCurrency, calculateLeakStats, getCurrentFiscalYear } from "@/lib/moneytag-data"
import { useToptierAgencies, useAgenciesOverview } from "@/hooks/use-spending-data"
import type { Screen } from "@/components/nav-header"

export interface ScreenMissionProps {
  onNavigate: (screen: Screen) => void
}

function MoneyLeakAnimation({ totalBudgetLabel }: { totalBudgetLabel: string }) {
  const fy = getCurrentFiscalYear()

  const checkpoints = [
    { x: 140, label: "APPROPRIATED" },
    { x: 260, label: "OBLIGATED" },
    { x: 380, label: "EXPENDED" },
  ]

  const leaks = [
    { x: 200, height: 35 },
    { x: 320, height: 50 },
    { x: 440, height: 25 },
  ]

  return (
    <div className="relative w-full overflow-hidden">
      <svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet" className="h-auto w-full" aria-hidden="true">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0,255,65,0.04)" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="pipeGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00FF41" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#00FF41" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00FF41" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="leakGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF3131" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF3131" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="600" height="300" fill="url(#grid)" />

        {/* Source block — Treasury */}
        <motion.g
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <rect x="30" y="110" width="80" height="56" fill="none" stroke="#00FF41" strokeWidth="1.5" rx="2" />
          <text x="70" y="134" textAnchor="middle" fill="#00FF41" fontFamily="monospace" fontSize="9" letterSpacing="0.1em">
            U.S. TREASURY
          </text>
          <text x="70" y="153" textAnchor="middle" fill="#666" fontFamily="monospace" fontSize="8">
            {`FY${fy}`}
          </text>
        </motion.g>

        {/* Main pipeline — top and bottom lines */}
        <motion.line
          x1="110" y1="128" x2="520" y2="128"
          stroke="#00FF41" strokeWidth="1" strokeOpacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <motion.line
          x1="110" y1="148" x2="520" y2="148"
          stroke="#00FF41" strokeWidth="1" strokeOpacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Flow line inside pipeline */}
        <motion.line
          x1="110" y1="138" x2="520" y2="138"
          stroke="url(#pipeGlow)" strokeWidth="4" strokeLinecap="round"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, delay: 0.4, ease: "easeOut" }}
        />

        {/* Checkpoint markers */}
        {checkpoints.map((cp, i) => (
          <motion.g
            key={cp.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.3, duration: 0.4 }}
          >
            <line x1={cp.x} y1="122" x2={cp.x} y2="154" stroke="#00FF41" strokeWidth="1" strokeOpacity="0.5" />
            <rect x={cp.x - 3} y="134" width="6" height="6" fill="#00FF41" rx="1"
              style={{ filter: "drop-shadow(0 0 4px rgba(0,255,65,0.5))" }}
            />
            <text x={cp.x} y="116" textAnchor="middle" fill="#555" fontFamily="monospace" fontSize="8" letterSpacing="0.08em">
              {cp.label}
            </text>
          </motion.g>
        ))}

        {/* Leak drips */}
        {leaks.map((leak, i) => (
          <motion.g
            key={leak.x}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 + i * 0.2 }}
          >
            <motion.line
              x1={leak.x} y1="148" x2={leak.x} y2={148 + leak.height}
              stroke="url(#leakGrad)" strokeWidth="2" strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ delay: 2 + i * 0.3, duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
            />
            <motion.circle
              cx={leak.x} cy={148 + leak.height}
              r="2" fill="#FF3131"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ delay: 2.5 + i * 0.3, duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
            />
          </motion.g>
        ))}

        {/* Budget amount display */}
        <motion.g
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <text x="300" y="90" textAnchor="middle" fill="#00FF41" fontFamily="monospace" fontSize="24" fontWeight="bold"
            style={{ filter: "drop-shadow(0 0 10px rgba(0,255,65,0.3))" }}
          >
            {totalBudgetLabel}
          </text>
          <text x="300" y="104" textAnchor="middle" fill="#555" fontFamily="monospace" fontSize="8" letterSpacing="0.15em">
            TOTAL BUDGET AUTHORITY
          </text>
        </motion.g>

        {/* Destination block — MONEYTAG */}
        <motion.g
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
        >
          <rect x="520" y="122" width="60" height="32" fill="#050505" stroke="#00FF41" strokeWidth="1.5" rx="2" />
          <text x="550" y="142" textAnchor="middle" fill="#00FF41" fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="0.1em">
            TAGGED
          </text>
        </motion.g>

        {/* Status line at bottom */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <text x="300" y="230" textAnchor="middle" fill="#333" fontFamily="monospace" fontSize="8" letterSpacing="0.12em">
            MONEYTAG — TRACKING EVERY DOLLAR FROM APPROPRIATION TO EXPENDITURE
          </text>
          <motion.rect
            x="170" y="238" width="260" height="1" fill="#00FF41" rx="0.5"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 3, duration: 1.5, ease: "easeOut" }}
            style={{ transformOrigin: "170px 238px" }}
          />
        </motion.g>
      </svg>
    </div>
  )
}

function PipelineStep({ icon, label, description, delay }: { icon: React.ReactNode; label: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
      className="flex flex-1 flex-col items-center gap-3 border border-border bg-card p-6 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center border border-primary/30 bg-primary/5">
        {icon}
      </div>
      <h3 className="font-mono text-sm font-bold tracking-wider text-primary">{label}</h3>
      <p className="font-mono text-xs leading-relaxed text-muted-foreground">{description}</p>
    </motion.div>
  )
}

function formatDelta(current: number, previous: number): string | null {
  if (!previous || previous === 0) return null
  const pct = ((current - previous) / Math.abs(previous)) * 100
  if (Math.abs(pct) < 0.1) return null
  const sign = pct >= 0 ? "+" : ""
  return `${sign}${pct.toFixed(1)}%`
}

function LiveStats() {
  const fy = getCurrentFiscalYear()
  const { data, isLoading } = useToptierAgencies()
  const { data: currentOverview } = useAgenciesOverview(fy)
  const { data: priorOverview } = useAgenciesOverview(fy - 1)
  const stats = data ? calculateLeakStats(data.results) : null

  if (isLoading || !stats) {
    return (
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-px bg-border md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 bg-card p-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div className="h-3 w-24 animate-pulse bg-secondary" />
          </div>
        ))}
      </div>
    )
  }

  const obligatedPct = stats.obligatedPercent
  const unobligatedPct = stats.unobligatedPercent

  // SVG donut arc path helper (radius 18, center 24,24)
  const donutArc = (pct: number) => {
    const r = 18
    const cx = 24
    const cy = 24
    const angle = (Math.min(pct, 99.99) / 100) * 360
    const rad = (angle - 90) * (Math.PI / 180)
    const x = cx + r * Math.cos(rad)
    const y = cy + r * Math.sin(rad)
    const large = angle > 180 ? 1 : 0
    return `M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x} ${y}`
  }

  const miniCharts: Record<string, React.ReactNode> = {
    "TOTAL BUDGET AUTHORITY": (
      <svg width="50" height="10" viewBox="0 0 50 10" aria-hidden="true" className="mt-1">
        <rect x="0" y="2" width="50" height="6" rx="1" fill="#00FF4115" />
        <motion.rect
          x="0" y="2" width="50" height="6" rx="1" fill="#00FF41"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true }}
          style={{ transformOrigin: "0 5px", filter: "drop-shadow(0 0 3px rgba(0,255,65,0.4))" }}
        />
      </svg>
    ),
    "TOTAL OBLIGATED": (
      <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true" className="mt-1">
        <circle cx="24" cy="24" r="18" fill="none" stroke="#00FF4115" strokeWidth="3.5" />
        <motion.path
          d={donutArc(obligatedPct)}
          fill="none" stroke="#00FF41" strokeWidth="3.5" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true }}
          style={{ filter: "drop-shadow(0 0 3px rgba(0,255,65,0.4))" }}
        />
        <text x="24" y="26" textAnchor="middle" fill="#00FF41" fontFamily="monospace" fontSize="8" fontWeight="bold">
          {Math.round(obligatedPct)}%
        </text>
      </svg>
    ),
    "UNOBLIGATED FUNDS": (
      <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true" className="mt-1">
        <circle cx="24" cy="24" r="18" fill="none" stroke="#FF313115" strokeWidth="3.5" />
        <motion.path
          d={donutArc(unobligatedPct)}
          fill="none" stroke="#FF3131" strokeWidth="3.5" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true }}
          style={{ filter: "drop-shadow(0 0 3px rgba(255,49,49,0.4))" }}
        />
        <text x="24" y="26" textAnchor="middle" fill="#FF3131" fontFamily="monospace" fontSize="8" fontWeight="bold">
          {Math.round(unobligatedPct)}%
        </text>
      </svg>
    ),
    "ACTIVE AGENCIES": (
      <svg width="50" height="40" viewBox="0 0 50 40" aria-hidden="true" className="mt-1">
        {[
          { x: 4, h: 18 },
          { x: 14, h: 28 },
          { x: 24, h: 22 },
          { x: 34, h: 34 },
          { x: 44, h: 14 },
        ].map((bar, i) => (
          <motion.rect
            key={bar.x}
            x={bar.x - 3}
            y={40 - bar.h}
            width="6"
            height={bar.h}
            rx="1"
            fill="#00FF41"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease: "easeOut" }}
            viewport={{ once: true }}
            style={{
              transformOrigin: `${bar.x}px 40px`,
              filter: "drop-shadow(0 0 2px rgba(0,255,65,0.3))",
              opacity: 0.7 + i * 0.06,
            }}
          />
        ))}
      </svg>
    ),
  }

  // Year-over-year comparison using reporting agencies overview (supports fiscal_year)
  const currentTotal = currentOverview?.results?.reduce((sum, a) => sum + a.current_total_budget_authority_amount, 0) ?? 0
  const priorTotal = priorOverview?.results?.reduce((sum, a) => sum + a.current_total_budget_authority_amount, 0) ?? 0
  const budgetDelta = priorTotal > 0 ? formatDelta(currentTotal, priorTotal) : null
  const agencyDelta = priorOverview?.results ? formatDelta(
    currentOverview?.results?.length ?? 0,
    priorOverview.results.length
  ) : null

  const statItems = [
    { value: formatLargeCurrency(stats.totalBudget), label: "TOTAL BUDGET AUTHORITY", color: "text-primary", glow: "glow-green", delta: budgetDelta },
    { value: formatLargeCurrency(stats.totalObligated), label: "TOTAL OBLIGATED", color: "text-primary", glow: "glow-green", delta: null as string | null },
    { value: formatLargeCurrency(stats.unobligated), label: "UNOBLIGATED FUNDS", color: "text-destructive", glow: "glow-red", delta: null as string | null },
    { value: `${stats.agencyCount}`, label: "ACTIVE AGENCIES", color: "text-primary", glow: "glow-green", delta: agencyDelta },
  ]

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-border md:grid-cols-4">
      {statItems.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-2 bg-card p-6 md:p-10"
        >
          <span className={`font-mono text-2xl font-bold md:text-4xl ${stat.color} ${stat.glow}`}>
            {stat.value}
          </span>
          <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground md:text-[10px]">{stat.label}</span>
          {stat.delta && (
            <span className={`font-mono text-[9px] ${stat.delta.startsWith("+") ? "text-primary" : "text-destructive"}`}>
              {stat.delta} vs FY{fy - 1}
            </span>
          )}
          {miniCharts[stat.label]}
        </motion.div>
      ))}
    </div>
  )
}

const DISTRIBUTION_COLORS = [
  "#00FF41", // bright green
  "#00CC66", // emerald
  "#009980", // teal
  "#00B88A", // sea green
  "#33AA55", // forest
] as const

function BudgetDistributionChart({ agencies }: { agencies: { abbreviation: string; agency_name: string; budget_authority_amount: number }[] }) {
  const top5 = [...agencies]
    .filter((a) => a.budget_authority_amount > 0)
    .sort((a, b) => b.budget_authority_amount - a.budget_authority_amount)
    .slice(0, 5)

  const total = top5.reduce((sum, a) => sum + a.budget_authority_amount, 0)
  if (total === 0) return null

  const segments = top5.map((a, i) => ({
    abbr: a.abbreviation,
    name: a.agency_name,
    pct: (a.budget_authority_amount / total) * 100,
    color: DISTRIBUTION_COLORS[i],
  }))

  // Build cumulative offsets (as percentages)
  let cumulative = 0
  const positioned = segments.map((seg) => {
    const offset = cumulative
    cumulative += seg.pct
    return { ...seg, offset }
  })

  return (
    <section className="border-t border-border px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] text-primary">TOP 5 AGENCIES BY BUDGET AUTHORITY</span>
          <h2 className="mt-2 font-mono text-3xl font-bold text-foreground">Budget Distribution by Agency</h2>
        </motion.div>

        {/* SVG stacked bar */}
        <div className="mx-auto w-full max-w-4xl">
          <svg
            viewBox="0 0 1000 80"
            preserveAspectRatio="xMidYMid meet"
            className="h-auto w-full"
            aria-label="Horizontal stacked bar chart showing top 5 agencies by budget authority"
            role="img"
          >
            <defs>
              <filter id="barGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background track */}
            <rect x="0" y="8" width="1000" height="32" rx="2" fill="#0a0a0a" stroke="#222" strokeWidth="1" />

            {/* Animated segments */}
            {positioned.map((seg, i) => {
              const x = (seg.offset / 100) * 1000
              const w = (seg.pct / 100) * 1000
              return (
                <motion.rect
                  key={seg.abbr}
                  x={x}
                  y="8"
                  width={w}
                  height="32"
                  rx={i === 0 ? 2 : 0}
                  fill={seg.color}
                  fillOpacity="0.75"
                  filter="url(#barGlow)"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.15 * i, ease: "easeOut" }}
                  viewport={{ once: true }}
                  style={{ transformOrigin: `${x}px 24px` }}
                />
              )
            })}

            {/* Segment dividers */}
            {positioned.slice(1).map((seg) => {
              const x = (seg.offset / 100) * 1000
              return (
                <motion.line
                  key={`div-${seg.abbr}`}
                  x1={x} y1="8" x2={x} y2="40"
                  stroke="#0a0a0a" strokeWidth="2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  viewport={{ once: true }}
                />
              )
            })}

            {/* Labels below */}
            {positioned.map((seg, i) => {
              const cx = ((seg.offset + seg.pct / 2) / 100) * 1000
              return (
                <motion.g
                  key={`lbl-${seg.abbr}`}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <line x1={cx} y1="40" x2={cx} y2="50" stroke="#333" strokeWidth="1" />
                  <text
                    x={cx}
                    y="62"
                    textAnchor="middle"
                    fill={seg.color}
                    fontFamily="monospace"
                    fontSize="11"
                    fontWeight="bold"
                    letterSpacing="0.05em"
                  >
                    {seg.abbr}
                  </text>
                  <text
                    x={cx}
                    y="76"
                    textAnchor="middle"
                    fill="#555"
                    fontFamily="monospace"
                    fontSize="9"
                  >
                    {seg.pct.toFixed(1)}%
                  </text>
                </motion.g>
              )
            })}
          </svg>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {segments.map((seg) => (
              <div key={seg.abbr} className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: seg.color, opacity: 0.75 }} />
                <span className="font-mono text-[10px] tracking-wide text-muted-foreground">{seg.abbr}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function ScreenMission({ onNavigate }: ScreenMissionProps) {
  const { data: agenciesData } = useToptierAgencies()
  const stats = agenciesData ? calculateLeakStats(agenciesData.results) : null
  const totalBudgetLabel = stats ? formatLargeCurrency(stats.totalBudget) : "..."

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 pb-16 pt-20">
        <div className="grid-bg absolute inset-0" />
        <div className="relative z-10 flex max-w-5xl flex-col items-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 border border-primary/30 bg-primary/5 px-4 py-1.5"
          >
            <Shield className="h-3 w-3 text-primary" />
            <span className="font-mono text-[10px] tracking-[0.3em] text-primary">FEDERAL SPENDING TRACKER v1.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-balance text-center font-mono text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl"
          >
            From Treasury
            <br />
            <span className="glow-green text-primary">to Bedside.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="max-w-2xl text-pretty text-center font-mono text-sm leading-relaxed text-muted-foreground"
          >
            MoneyTag tracks every federal dollar from appropriation to expenditure,
            creating a transparent chain of custody from the U.S. Treasury
            to its final destination. Powered by live USASpending.gov data.
            Every. Single. Dollar. Tracked.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <button
              onClick={() => onNavigate("ledger")}
              className="group flex items-center gap-2 bg-primary px-6 py-3 font-mono text-xs font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
            >
              VIEW LIVE LEDGER
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 mt-12 mx-auto w-full max-w-3xl px-2 sm:px-0"
        >
          <MoneyLeakAnimation totalBudgetLabel={totalBudgetLabel} />
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="mt-8">
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Pipeline Section */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12 text-center">
            <span className="font-mono text-[10px] tracking-[0.3em] text-primary">HOW IT WORKS</span>
            <h2 className="mt-2 font-mono text-3xl font-bold text-foreground">The Spending Lifecycle</h2>
          </motion.div>

          <div className="flex flex-col gap-4 md:flex-row">
            <PipelineStep
              icon={<Lock className="h-6 w-6 text-primary" />}
              label="PHASE A: APPROPRIATION"
              description="Congress allocates funds and the Treasury issues budget authority. Every dollar is tagged and tracked from the moment it enters the federal pipeline."
              delay={0}
            />
            <div className="hidden items-center md:flex">
              <ArrowRight className="h-5 w-5 text-primary" />
            </div>
            <PipelineStep
              icon={<Tag className="h-6 w-6 text-primary" />}
              label="PHASE B: FLOW"
              description="Funds flow through federal agencies, bureaus, and sub-agencies. Every organization is a node in the spending hierarchy, fully traceable."
              delay={0.15}
            />
            <div className="hidden items-center md:flex">
              <ArrowRight className="h-5 w-5 text-primary" />
            </div>
            <PipelineStep
              icon={<Terminal className="h-6 w-6 text-primary" />}
              label="PHASE C: EXPENDITURE"
              description="Money reaches the final expenditure. Direct payments, contracts, grants, and purchases are recorded with full accountability at the terminal level."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Stats Section -- LIVE DATA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto mb-8 max-w-5xl text-center">
          <span className="font-mono text-[10px] tracking-[0.3em] text-primary">LIVE FROM USASPENDING.GOV</span>
          <h2 className="mt-2 font-mono text-3xl font-bold text-foreground">Federal Budget at a Glance</h2>
        </div>
        <LiveStats />
      </section>

      {/* Budget Distribution Chart */}
      {agenciesData?.results && <BudgetDistributionChart agencies={agenciesData.results} />}

      {/* CTA Section */}
      <section className="border-t border-border px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] text-destructive">THE PROBLEM IS SYSTEMIC</span>
          <h2 className="text-balance font-mono text-3xl font-bold text-foreground">
            Trillions flow through federal agencies with limited real-time visibility.
          </h2>
          <p className="text-pretty font-mono text-sm leading-relaxed text-muted-foreground">
            MoneyTag doesn{"'"}t ask for permission. It demands proof.
            Explore the live ledger powered by real USASpending data to see where every tagged dollar sits right now.
          </p>
          <button
            onClick={() => onNavigate("ledger")}
            className="group mt-4 flex items-center gap-2 bg-primary px-8 py-4 font-mono text-xs font-bold tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
          >
            ENTER THE LEDGER
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </section>
    </div>
  )
}
