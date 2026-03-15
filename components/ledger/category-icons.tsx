"use client"

import React from "react"

// --- SVG category icons ---
export function getCategoryIcon(category: string | undefined) {
  if (!category) return null
  const c = category.toLowerCase()
  if (c.includes("contract")) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12V4h5l1 2h6v6H2z" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <path d="M5 8h6M5 10h4" stroke="currentColor" strokeWidth="0.8" />
      </svg>
    )
  }
  if (c.includes("direct") || c.includes("payment")) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="4" width="14" height="8" rx="0" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="0.8" fill="none" />
        <path d="M8 6.5v3M7 7.5h2M7 8.5h2" stroke="currentColor" strokeWidth="0.6" />
      </svg>
    )
  }
  if (c.includes("grant")) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z" stroke="currentColor" strokeWidth="1" fill="none" />
      </svg>
    )
  }
  if (c.includes("loan")) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 13V5h10v8H3z" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <path d="M5 5V3h6v2" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M6 8h4M6 10h4" stroke="currentColor" strokeWidth="0.8" />
      </svg>
    )
  }
  if (c.includes("insurance") || c.includes("admin")) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 1.5L2.5 4v4c0 3.5 2.5 5.5 5.5 7 3-1.5 5.5-3.5 5.5-7V4L8 1.5z" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 2L5 7h6L8 2z" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M5 7v5h6V7" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M4 12h8" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}
