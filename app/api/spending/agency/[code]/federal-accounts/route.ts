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
  const limit = searchParams.get("limit") || "20"
  const page = searchParams.get("page") || "1"

  try {
    const url = `${USASPENDING_BASE}/agency/${code}/federal_account/?fiscal_year=${fiscalYear}&limit=${limit}&page=${page}&order=desc&sort=obligated_amount`

    const res = await fetch(url, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      throw new Error(`Federal accounts returned ${res.status}`)
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Failed to fetch federal accounts for ${code}:`, error)
    return NextResponse.json(
      { error: `Failed to fetch federal accounts for ${code}` },
      { status: 500 }
    )
  }
}
