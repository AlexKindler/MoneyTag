import { NextResponse } from "next/server"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { ToptierAgenciesResponseSchema, validateResponse } from "@/lib/schemas"

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

  // Allowlist sort and order parameters to prevent query parameter injection
  const ALLOWED_SORTS = ["budget_authority_amount", "agency_name", "obligated_amount", "outlay_amount", "percentage_of_total_budget_authority"]
  const ALLOWED_ORDERS = ["asc", "desc"]
  const sort = ALLOWED_SORTS.includes(searchParams.get("sort") || "") ? searchParams.get("sort")! : "budget_authority_amount"
  const order = ALLOWED_ORDERS.includes(searchParams.get("order") || "") ? searchParams.get("order")! : "desc"

  try {
    const res = await fetch(`${USASPENDING_BASE}/references/toptier_agencies/?sort=${sort}&order=${order}`, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      throw new Error(`Toptier agencies returned ${res.status}`)
    }

    const data = await res.json()
    validateResponse(ToptierAgenciesResponseSchema, data, "toptier-agencies")
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch toptier agencies:", error)
    return NextResponse.json(
      { error: "Failed to fetch toptier agencies" },
      { status: 500 }
    )
  }
}
