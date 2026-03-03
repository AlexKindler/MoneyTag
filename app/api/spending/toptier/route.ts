import { NextResponse } from "next/server"

const USASPENDING_BASE = "https://api.usaspending.gov/api/v2"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sort = searchParams.get("sort") || "budget_authority_amount"
  const order = searchParams.get("order") || "desc"

  try {
    const res = await fetch(`${USASPENDING_BASE}/references/toptier_agencies/?sort=${sort}&order=${order}`, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      throw new Error(`Toptier agencies returned ${res.status}`)
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch toptier agencies:", error)
    return NextResponse.json(
      { error: "Failed to fetch toptier agencies" },
      { status: 500 }
    )
  }
}
