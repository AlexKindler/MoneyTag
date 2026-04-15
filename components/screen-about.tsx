"use client"

import { motion } from "framer-motion"
import { Shield, Database, Lock, Eye, FileText, Code, ExternalLink } from "lucide-react"

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
    q: "What do the depth levels (D0-D3) mean?",
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

const methodologySteps = [
  {
    icon: <Database className="h-5 w-5" />,
    title: "DATA INGESTION",
    description: "Live queries to USASpending.gov API v2 for toptier agencies, budget functions, federal accounts, and treasury accounts.",
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: "VALIDATION",
    description: "Every API response is validated against Zod schemas. Malformed data triggers warnings but never crashes the UI.",
  },
  {
    icon: <Eye className="h-5 w-5" />,
    title: "TREE CONSTRUCTION",
    description: "Raw API data is transformed into a 4-level spending tree: Treasury → Agency → Budget Function/Account → Sub-function/Treasury Account.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "STATUS CLASSIFICATION",
    description: "Nodes are classified as Verified (outlays recorded), Pending (obligations but no outlays), or Flagged (admin overhead categories).",
  },
]

export function ScreenAbout() {
  return (
    <div className="relative min-h-screen">
      <div className="grid-bg absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] text-primary">SYSTEM DOCUMENTATION</span>
          <h1 className="mt-3 font-mono text-4xl font-bold text-foreground">About MoneyTag</h1>
          <p className="mx-auto mt-4 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
            A federal spending transparency tool that traces every dollar from appropriation
            to expenditure using live Treasury data.
          </p>
        </motion.div>

        {/* Methodology */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="mb-8 font-mono text-xs tracking-[0.3em] text-primary">METHODOLOGY</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {methodologySteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="border border-border bg-card p-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center border border-primary/30 text-primary">
                    {step.icon}
                  </div>
                  <h3 className="font-mono text-xs font-bold tracking-wider text-foreground">{step.title}</h3>
                </div>
                <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="mb-6 font-mono text-xs tracking-[0.3em] text-primary">TECH STACK</h2>
          <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
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
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="mb-8 font-mono text-xs tracking-[0.3em] text-primary">FREQUENTLY ASKED QUESTIONS</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                className="border border-border bg-card p-5"
              >
                <h3 className="mb-2 font-mono text-xs font-bold text-foreground">{faq.q}</h3>
                <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Links */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="mb-6 font-mono text-xs tracking-[0.3em] text-primary">DATA SOURCES & REFERENCES</h2>
          <div className="space-y-2">
            {[
              { label: "USASpending.gov API Documentation", url: "https://api.usaspending.gov" },
              { label: "USASpending.gov Explorer", url: "https://www.usaspending.gov/explorer" },
              { label: "Congressional Budget Office", url: "https://www.cbo.gov" },
            ].map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-border bg-card px-4 py-3 font-mono text-xs text-primary transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                {link.label}
              </a>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
