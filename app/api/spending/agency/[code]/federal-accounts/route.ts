import { NextResponse } from "next/server"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { FederalAccountsResponseSchema, validateResponse } from "@/lib/schemas"

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
  // Rate limit this endpoint
  const ip = getClientIp(request)
  const { success } = rateLimit(ip)
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    )
  }

  const { code } = await params

  // Validate the agency code
  if (!/^[A-Za-z0-9_-]{1,10}$/.test(code)) {
    return NextResponse.json(
      { error: "Invalid agency code" },
      { status: 400 }
    )
  }

  const { searchParams } = new URL(request.url)
  const rawFy = searchParams.get("fiscal_year") || getCurrentFiscalYear()
  const fiscalYear = /^\d{4}$/.test(rawFy) ? rawFy : getCurrentFiscalYear()

  // Validate limit and page are reasonable integers
  const rawLimit = parseInt(searchParams.get("limit") || "20", 10)
  const limit = String(Math.min(Math.max(1, isNaN(rawLimit) ? 20 : rawLimit), 100))
  const rawPage = parseInt(searchParams.get("page") || "1", 10)
  const page = String(Math.max(1, isNaN(rawPage) ? 1 : rawPage))

  try {
    const url = `${USASPENDING_BASE}/agency/${code}/federal_account/?fiscal_year=${fiscalYear}&limit=${limit}&page=${page}&order=desc&sort=obligated_amount`

    const res = await fetch(url, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      throw new Error(`Federal accounts returned ${res.status}`)
    }

    const data = await res.json()
    validateResponse(FederalAccountsResponseSchema, data, `federal-accounts-${code}`)
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Failed to fetch federal accounts for ${code}:`, error)
    return NextResponse.json(
      { error: `Failed to fetch federal accounts for ${code}` },
      { status: 500 }
    )
  }
}
