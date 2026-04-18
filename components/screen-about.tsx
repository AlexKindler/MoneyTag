"use client"

import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"

const sections = [
  {
    kicker: "OUR MISSION",
    title: "Make every federal dollar traceable.",
    body: "MoneyTag exists because the public deserves to see where their tax dollars go. Not quarterly. Not annually. Right now. We ingest the entire USASpending.gov dataset and expose it as a live chain of custody — from the U.S. Treasury, through each toptier agency, down to the final expenditure.",
  },
  {
    kicker: "METHODOLOGY",
    title: "Hard sources. Zero narrative.",
    body: "Every number on this site is pulled directly from usaspending.gov APIs. We do not edit, editorialize, or re-categorize. Obligated vs unobligated splits are calculated from budget authority amounts reported by each toptier agency. Status flags (VERIFIED / PENDING / FLAGGED) are derived from outlay-to-obligation ratios.",
  },
  {
    kicker: "WHAT TRIGGERS A FLAG",
    title: "Administrative overhead above threshold.",
    body: "MoneyTag flags budget functions where the category is classified as administrative overhead and the amount exceeds 5% of an agency's total obligations. A flag is not an accusation. It is a signal for the reader to look closer.",
  },
]

const facts = [
  { k: "DATA SOURCE", v: "usaspending.gov" },
  { k: "UPDATE CADENCE", v: "Daily" },
  { k: "AGENCIES TRACKED", v: "25 toptier" },
  { k: "FISCAL YEAR", v: "2026" },
  { k: "LICENSE", v: "MIT · open-source" },
  { k: "BUILT FOR", v: "Vibe Coding Hackathon" },
]

const faqs = [
  {
    q: "Where does the data come from?",
    a: "All data is sourced live from the USASpending.gov API (api.usaspending.gov), the official open data source published by the U.S. Department of the Treasury. Nothing is estimated or simulated.",
  },
  {
    q: "What does 'unobligated' mean?",
    a: "Unobligated funds are money Congress has authorized but agencies haven't yet committed to specific contracts, grants, or payments. High unobligated balances can indicate slow execution or excess appropriation.",
  },
  {
    q: "What do the depth levels (D0–D3) mean?",
    a: "D0 is the U.S. Treasury (the source of all funds). D1 is a top-level federal agency (e.g., DOD, HHS). D2 is a budget function or federal account within that agency. D3 is a sub-function or treasury account — the most granular level of tracking.",
  },
  {
    q: "What does the 'flagged' status mean?",
    a: "Nodes flagged in red are categorized as administrative overhead. This doesn't mean the spending is wasteful — it means the ratio of admin costs to program delivery is worth reviewing.",
  },
  {
    q: "How often is the data updated?",
    a: "The USASpending API is updated on a monthly cycle by the Treasury. MoneyTag caches responses for 1 hour to balance freshness with API rate limits.",
  },
  {
    q: "What are the AI-generated explanations?",
    a: "When you drill down to a D3 (sub-function) node and open its detail view, MoneyTag uses AI to generate a plain-language explanation of what that money actually pays for, so citizens don't need to decode budget jargon.",
  },
]

export function ScreenAbout() {
  return (
    <div className="relative px-6 py-20">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,65,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.04) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="font-mono text-[10px] tracking-[0.3em] text-primary">03 · ABOUT</span>
          <h1 className="mt-2 font-mono text-5xl font-bold leading-tight text-foreground">
            We don&apos;t ask for permission.
            <br />
            <span className="text-primary" style={{ textShadow: "0 0 10px rgba(0,255,65,0.4)" }}>
              We demand proof.
            </span>
          </h1>
        </motion.div>

        {/* Facts grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-14 grid grid-cols-2 gap-px bg-border md:grid-cols-3"
        >
          {facts.map((f) => (
            <div key={f.k} className="flex flex-col gap-1 bg-card p-5">
              <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">{f.k}</span>
              <span className="font-mono text-sm font-bold text-primary">{f.v}</span>
            </div>
          ))}
        </motion.div>

        {/* Content sections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-14 flex flex-col gap-10"
        >
          {sections.map((s, i) => (
            <motion.div
              key={s.kicker}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="border-l border-primary/40 pl-6"
            >
              <span className="font-mono text-[10px] tracking-[0.3em] text-primary">{s.kicker}</span>
              <h2 className="mt-2 font-mono text-2xl font-bold text-foreground">{s.title}</h2>
              <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech stack */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-14"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] text-primary">TECH STACK</span>
          <div className="mt-4 grid grid-cols-2 gap-px bg-border md:grid-cols-4">
            {[
              { label: "FRAMEWORK", value: "Next.js 16" },
              { label: "LANGUAGE", value: "TypeScript" },
              { label: "STYLING", value: "Tailwind CSS 4" },
              { label: "DATA SOURCE", value: "USASpending API" },
              { label: "ANIMATIONS", value: "Framer Motion" },
              { label: "VALIDATION", value: "Zod Schemas" },
              { label: "DATA FETCHING", value: "SWR" },
              { label: "DEPLOYMENT", value: "Vercel" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1 bg-card p-4">
                <span className="font-mono text-[9px] tracking-wider text-muted-foreground">{item.label}</span>
                <span className="font-mono text-xs font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-14"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] text-primary">FREQUENTLY ASKED QUESTIONS</span>
          <div className="mt-4 space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.07 }}
                className="border border-border bg-card p-5"
              >
                <h3 className="mb-2 font-mono text-xs font-bold text-foreground">{faq.q}</h3>
                <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Learn more card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-14 flex flex-col items-start justify-between gap-4 border border-border bg-card p-6 md:flex-row md:items-center"
        >
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">LEARN MORE</span>
            <span className="font-mono text-base font-bold text-foreground">View the raw USASpending.gov data</span>
          </div>
          <a
            href="https://www.usaspending.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-primary/40 px-4 py-2 font-mono text-xs tracking-wider text-primary transition-colors hover:bg-primary/10"
          >
            OPEN DATASET <ExternalLink className="h-3 w-3" />
          </a>
        </motion.div>
      </div>
    </div>
  )
}
