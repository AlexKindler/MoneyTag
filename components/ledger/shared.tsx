"use client"

import React from "react"
import {
  Landmark,
  Building2,
  Users,
  FileText,
  DollarSign,
} from "lucide-react"
import type { NodeType } from "@/lib/moneytag-data"

// --- Blurb cache to avoid redundant API calls ---
export const blurbCache = new Map<string, string>()

// --- Icon mapping for node types ---
export function getNodeIcon(type: NodeType) {
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

export function getStatusStyle(status: string) {
  switch (status) {
    case "verified": return "border-primary/30 bg-primary/5"
    case "pending": return "border-[#ffcc00]/30 bg-[#ffcc00]/5"
    case "flagged": return "border-destructive/30 bg-destructive/5"
    default: return "border-border bg-card"
  }
}

export function getStatusTextColor(status: string) {
  switch (status) {
    case "verified": return "text-primary"
    case "pending": return "text-[#ffcc00]"
    case "flagged": return "text-destructive"
    default: return "text-muted-foreground"
  }
}
