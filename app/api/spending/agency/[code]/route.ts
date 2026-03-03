import { NextResponse } from "next/server"

const USASPENDING_BASE = "https://api.usaspending.gov/api/v2"

function getCurrentFiscalYear(): string {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  return String(month >= 9 ? year + 1 : year)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const { searchParams } = new URL(request.url)
  const fiscalYear = searchParams.get("fiscal_year") || getCurrentFiscalYear()

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

    return NextResponse.json({
      overview,
      sub_agencies: subAgencies,
      obligations_by_category: obligations,
      budget_functions: budgetFunctions,
    })
  } catch (error) {
    console.error(`Failed to fetch agency ${code}:`, error)
    return NextResponse.json(
      { error: `Failed to fetch agency ${code}` },
      { status: 500 }
    )
  }
}
