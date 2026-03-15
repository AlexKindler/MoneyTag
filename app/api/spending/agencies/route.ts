import { NextResponse } from "next/server"
import { getCurrentFiscalYear } from "@/lib/moneytag-data"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { AgenciesOverviewResponseSchema, validateResponse } from "@/lib/schemas"

const USASPENDING_BASE = "https://api.usaspending.gov/api/v2"

export async function GET(request: Request) {
  const ip = getClientIp(request)
  const { success, remaining } = rateLimit(ip)
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    )
  }

  const { searchParams } = new URL(request.url)
  const rawFy = searchParams.get("fiscal_year") || String(getCurrentFiscalYear())
  const fiscalYear = /^\d{4}$/.test(rawFy) ? rawFy : String(getCurrentFiscalYear())

  // Allowlist sort and order parameters
  const ALLOWED_SORTS = ["current_total_budget_authority_amount", "agency_name", "obligation_difference", "recent_publication_date"]
  const ALLOWED_ORDERS = ["asc", "desc"]
  const sort = ALLOWED_SORTS.includes(searchParams.get("sort") || "") ? searchParams.get("sort")! : "current_total_budget_authority_amount"
  const order = ALLOWED_ORDERS.includes(searchParams.get("order") || "") ? searchParams.get("order")! : "desc"

  const rawLimit = parseInt(searchParams.get("limit") || "50", 10)
  const limit = String(Math.min(Math.max(1, isNaN(rawLimit) ? 50 : rawLimit), 100))

  try {
    const url = new URL(`${USASPENDING_BASE}/reporting/agencies/overview/`)
    url.searchParams.set("fiscal_year", fiscalYear)
    url.searchParams.set("fiscal_period", "12")
    url.searchParams.set("sort", sort)
    url.searchParams.set("order", order)
    url.searchParams.set("limit", limit)

    const res = await fetch(url.toString(), {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      throw new Error(`USASpending API returned ${res.status}`)
    }

    const data = await res.json()
    validateResponse(AgenciesOverviewResponseSchema, data, "agencies-overview")
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch agencies overview:", error)
    return NextResponse.json(
      { error: "Failed to fetch agencies data" },
      { status: 500 }
    )
  }
}
