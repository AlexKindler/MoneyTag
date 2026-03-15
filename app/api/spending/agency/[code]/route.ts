import { NextResponse } from "next/server"
import { getCurrentFiscalYear } from "@/lib/moneytag-data"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { AgencyDetailResponseSchema, validateResponse } from "@/lib/schemas"

const USASPENDING_BASE = "https://api.usaspending.gov/api/v2"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const ip = getClientIp(request)
  const { success, remaining } = rateLimit(ip)
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    )
  }

  const { code } = await params

  // Validate the agency code: must be alphanumeric (toptier codes are short numeric strings)
  if (!/^[A-Za-z0-9_-]{1,10}$/.test(code)) {
    return NextResponse.json(
      { error: "Invalid agency code" },
      { status: 400 }
    )
  }

  const { searchParams } = new URL(request.url)
  const rawFy = searchParams.get("fiscal_year") || String(getCurrentFiscalYear())
  // Validate fiscal year is a 4-digit number
  const fiscalYear = /^\d{4}$/.test(rawFy) ? rawFy : String(getCurrentFiscalYear())

  try {
    // Fetch agency overview, sub-agencies, and obligations by award category in parallel
    const [overviewRes, subAgencyRes, obligationsRes, budgetFunctionRes] = await Promise.all([
      fetch(`${USASPENDING_BASE}/agency/${code}/?fiscal_year=${fiscalYear}`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${USASPENDING_BASE}/agency/${code}/sub_agency/?fiscal_year=${fiscalYear}&limit=20&order=desc&sort=total_obligations`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${USASPENDING_BASE}/agency/${code}/obligations_by_award_category/?fiscal_year=${fiscalYear}`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${USASPENDING_BASE}/agency/${code}/budget_function/?fiscal_year=${fiscalYear}&limit=20&order=desc&sort=obligated_amount`, {
        next: { revalidate: 3600 },
      }),
    ])

    if (!overviewRes.ok) {
      throw new Error(`Agency overview returned ${overviewRes.status}`)
    }

    const overview = await overviewRes.json()
    const subAgencies = subAgencyRes.ok ? await subAgencyRes.json() : { results: [] }
    const obligations = obligationsRes.ok ? await obligationsRes.json() : {}
    const budgetFunctions = budgetFunctionRes.ok ? await budgetFunctionRes.json() : { results: [] }

    const responseData = {
      overview,
      sub_agencies: subAgencies,
      obligations_by_category: obligations,
      budget_functions: budgetFunctions,
    }
    validateResponse(AgencyDetailResponseSchema, responseData, `agency-detail-${code}`)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error(`Failed to fetch agency ${code}:`, error)
    return NextResponse.json(
      { error: `Failed to fetch agency ${code}` },
      { status: 500 }
    )
  }
}
