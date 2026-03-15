"use client"

import React from "react"

// --- Money flow connector SVG ---
export function MoneyFlowConnector() {
  return (
    <svg width="2" height="20" viewBox="0 0 2 20" className="ml-3 shrink-0">
      <line x1="1" y1="0" x2="1" y2="20" stroke="#00FF41" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5">
        <animate attributeName="stroke-dashoffset" from="6" to="0" dur="0.6s" repeatCount="indefinite" />
      </line>
      <circle cx="1" cy="10" r="1.5" fill="#00FF41" opacity="0.8">
        <animate attributeName="cy" from="0" to="20" dur="0.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
