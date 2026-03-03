import { NextResponse } from "next/server"

const USASPENDING_BASE = "https://api.usaspending.gov/api/v2"

function getCurrentFiscalYear(): string {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  return String(month >= 9 ? year + 1 : year)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fiscalYear = searchParams.get("fiscal_year") || getCurrentFiscalYear()
  const sort = searchParams.get("sort") || "current_total_budget_authority_amount"
  const order = searchParams.get("order") || "desc"
  const limit = searchParams.get("limit") || "50"

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
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch agencies overview:", error)
    return NextResponse.json(
      { error: "Failed to fetch agencies data" },
      { status: 500 }
    )
  }
}
