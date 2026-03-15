import { describe, it, expect } from "vitest"
import {
  formatCurrency,
  formatLargeCurrency,
  getCurrentFiscalYear,
  calculateLeakStats,
  getCategoryColor,
  categorizeBudgetFunction,
  buildToptierTree,
  type ToptierAgency,
  type SpendCategory,
} from "@/lib/moneytag-data"

// ---------------------------------------------------------------------------
// formatCurrency
// ---------------------------------------------------------------------------
describe("formatCurrency", () => {
  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0")
  })

  it("formats small amounts below 1K", () => {
    expect(formatCurrency(500)).toBe("$500")
  })

  it("formats thousands", () => {
    expect(formatCurrency(5_000)).toBe("$5K")
    expect(formatCurrency(45_678)).toBe("$46K")
  })

  it("formats millions", () => {
    expect(formatCurrency(1_000_000)).toBe("$1.0M")
    expect(formatCurrency(7_500_000)).toBe("$7.5M")
  })

  it("formats billions", () => {
    expect(formatCurrency(1_000_000_000)).toBe("$1.0B")
    expect(formatCurrency(42_300_000_000)).toBe("$42.3B")
  })

  it("formats trillions", () => {
    expect(formatCurrency(1_000_000_000_000)).toBe("$1.00T")
    expect(formatCurrency(6_780_000_000_000)).toBe("$6.78T")
  })

  it("handles negative amounts using abs for bracket selection", () => {
    // Negative trillions: abs >= 1T
    expect(formatCurrency(-2_500_000_000_000)).toBe("$-2.50T")
    // Negative billions: abs >= 1B
    expect(formatCurrency(-3_200_000_000)).toBe("$-3.2B")
  })
})

// ---------------------------------------------------------------------------
// formatLargeCurrency
// ---------------------------------------------------------------------------
describe("formatLargeCurrency", () => {
  it("formats trillions with 3 decimal places", () => {
    expect(formatLargeCurrency(1_234_000_000_000)).toBe("$1.234T")
  })

  it("formats billions with 2 decimal places", () => {
    expect(formatLargeCurrency(45_670_000_000)).toBe("$45.67B")
  })

  it("falls through to formatCurrency for amounts below 1B", () => {
    expect(formatLargeCurrency(5_000_000)).toBe("$5.0M")
    expect(formatLargeCurrency(500)).toBe("$500")
  })
})

// ---------------------------------------------------------------------------
// getCurrentFiscalYear
// ---------------------------------------------------------------------------
describe("getCurrentFiscalYear", () => {
  it("returns the correct fiscal year based on October boundary", () => {
    const fy = getCurrentFiscalYear()
    const now = new Date()
    const month = now.getMonth() // 0-indexed
    const year = now.getFullYear()
    const expected = month >= 9 ? year + 1 : year
    expect(fy).toBe(expected)
  })

  it("returns a reasonable 4-digit year", () => {
    const fy = getCurrentFiscalYear()
    expect(fy).toBeGreaterThanOrEqual(2025)
    expect(fy).toBeLessThanOrEqual(2030)
  })
})

// ---------------------------------------------------------------------------
// calculateLeakStats
// ---------------------------------------------------------------------------
describe("calculateLeakStats", () => {
  const mockAgencies: ToptierAgency[] = [
    {
      agency_id: 1,
      toptier_code: "012",
      abbreviation: "DOD",
      agency_name: "Department of Defense",
      congressional_justification_url: null,
      active_fy: "2025",
      active_fq: "1",
      outlay_amount: 600_000_000_000,
      obligated_amount: 800_000_000_000,
      budget_authority_amount: 900_000_000_000,
      current_total_budget_authority_amount: 6_000_000_000_000,
      percentage_of_total_budget_authority: 0.15,
      agency_slug: "department-of-defense",
    },
    {
      agency_id: 2,
      toptier_code: "015",
      abbreviation: "HHS",
      agency_name: "Department of Health and Human Services",
      congressional_justification_url: null,
      active_fy: "2025",
      active_fq: "1",
      outlay_amount: 1_200_000_000_000,
      obligated_amount: 1_500_000_000_000,
      budget_authority_amount: 1_700_000_000_000,
      current_total_budget_authority_amount: 6_000_000_000_000,
      percentage_of_total_budget_authority: 0.28,
      agency_slug: "department-of-health-and-human-services",
    },
  ]

  it("calculates totalBudget from first agency", () => {
    const stats = calculateLeakStats(mockAgencies)
    expect(stats.totalBudget).toBe(6_000_000_000_000)
  })

  it("sums obligated and outlayed amounts", () => {
    const stats = calculateLeakStats(mockAgencies)
    expect(stats.totalObligated).toBe(800_000_000_000 + 1_500_000_000_000)
    expect(stats.totalOutlayed).toBe(600_000_000_000 + 1_200_000_000_000)
  })

  it("calculates unobligated and percentages", () => {
    const stats = calculateLeakStats(mockAgencies)
    expect(stats.unobligated).toBe(6_000_000_000_000 - 2_300_000_000_000)
    expect(stats.obligatedPercent).toBeCloseTo((2_300_000_000_000 / 6_000_000_000_000) * 100, 5)
    expect(stats.unobligatedPercent).toBeCloseTo((3_700_000_000_000 / 6_000_000_000_000) * 100, 5)
  })

  it("counts agencies with positive budget authority", () => {
    const stats = calculateLeakStats(mockAgencies)
    expect(stats.agencyCount).toBe(2)
  })

  it("handles empty array", () => {
    const stats = calculateLeakStats([])
    expect(stats.totalBudget).toBe(0)
    expect(stats.totalObligated).toBe(0)
    expect(stats.totalOutlayed).toBe(0)
    expect(stats.obligatedPercent).toBe(0)
    expect(stats.unobligatedPercent).toBe(0)
    expect(stats.agencyCount).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// getCategoryColor
// ---------------------------------------------------------------------------
describe("getCategoryColor", () => {
  const categories: SpendCategory[] = [
    "Contracts",
    "Direct Payments",
    "Grants",
    "Loans",
    "Other",
    "Admin",
    "Unknown",
  ]

  it("returns a valid hex color for every category", () => {
    for (const cat of categories) {
      const color = getCategoryColor(cat)
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it("returns specific known colors", () => {
    expect(getCategoryColor("Contracts")).toBe("#00ccff")
    expect(getCategoryColor("Direct Payments")).toBe("#00FF41")
    expect(getCategoryColor("Grants")).toBe("#ffcc00")
    expect(getCategoryColor("Loans")).toBe("#ff6600")
    expect(getCategoryColor("Admin")).toBe("#FF3131")
  })

  it("returns the same color for Other and Unknown", () => {
    expect(getCategoryColor("Other")).toBe(getCategoryColor("Unknown"))
  })
})

// ---------------------------------------------------------------------------
// categorizeBudgetFunction
// ---------------------------------------------------------------------------
describe("categorizeBudgetFunction", () => {
  it("categorizes health-related as Direct Payments", () => {
    expect(categorizeBudgetFunction("Health")).toBe("Direct Payments")
    expect(categorizeBudgetFunction("Medicare")).toBe("Direct Payments")
    expect(categorizeBudgetFunction("Medicaid services")).toBe("Direct Payments")
  })

  it("categorizes defense as Contracts", () => {
    expect(categorizeBudgetFunction("National Defense")).toBe("Contracts")
    expect(categorizeBudgetFunction("Military Construction")).toBe("Contracts")
  })

  it("categorizes income security and social as Direct Payments", () => {
    expect(categorizeBudgetFunction("Income Security")).toBe("Direct Payments")
    expect(categorizeBudgetFunction("Social Security")).toBe("Direct Payments")
  })

  it("categorizes education/science as Grants", () => {
    expect(categorizeBudgetFunction("Education")).toBe("Grants")
    expect(categorizeBudgetFunction("Training Employment")).toBe("Grants")
    expect(categorizeBudgetFunction("General Science")).toBe("Grants")
  })

  it("categorizes transportation and community as Grants", () => {
    expect(categorizeBudgetFunction("Transportation")).toBe("Grants")
    expect(categorizeBudgetFunction("Community Development")).toBe("Grants")
  })

  it("categorizes interest and administration as Admin", () => {
    expect(categorizeBudgetFunction("Net Interest")).toBe("Admin")
    expect(categorizeBudgetFunction("General Government")).toBe("Admin")
    expect(categorizeBudgetFunction("Administration of Justice")).toBe("Admin")
  })

  it("categorizes agriculture/energy/environment as Grants", () => {
    expect(categorizeBudgetFunction("Agriculture")).toBe("Grants")
    expect(categorizeBudgetFunction("Energy")).toBe("Grants")
    expect(categorizeBudgetFunction("Natural Resources and Environment")).toBe("Grants")
  })

  it("categorizes commerce/housing as Loans", () => {
    expect(categorizeBudgetFunction("Commerce and Housing Credit")).toBe("Loans")
    expect(categorizeBudgetFunction("Housing")).toBe("Loans")
  })

  it("falls back to Other for unknown names", () => {
    expect(categorizeBudgetFunction("Alien Artifact Research")).toBe("Other")
  })
})

// ---------------------------------------------------------------------------
// buildToptierTree
// ---------------------------------------------------------------------------
describe("buildToptierTree", () => {
  function makeAgency(overrides: Partial<ToptierAgency> = {}): ToptierAgency {
    return {
      agency_id: 1,
      toptier_code: "012",
      abbreviation: "TST",
      agency_name: "Test Agency",
      congressional_justification_url: null,
      active_fy: "2025",
      active_fq: "1",
      outlay_amount: 100,
      obligated_amount: 200,
      budget_authority_amount: 300,
      current_total_budget_authority_amount: 1000,
      percentage_of_total_budget_authority: 0.3,
      agency_slug: "test-agency",
      ...overrides,
    }
  }

  it("returns a treasury root node with correct metadata", () => {
    const tree = buildToptierTree([makeAgency()])
    expect(tree.id).toBe("us-treasury")
    expect(tree.name).toBe("U.S. Treasury")
    expect(tree.type).toBe("treasury")
    expect(tree.depth).toBe(0)
    expect(tree.status).toBe("verified")
    expect(tree.sourceUrl).toBe("https://www.usaspending.gov/explorer")
  })

  it("uses first agency current_total_budget_authority_amount as root amount", () => {
    const tree = buildToptierTree([
      makeAgency({ current_total_budget_authority_amount: 5_000 }),
    ])
    expect(tree.amount).toBe(5_000)
  })

  it("filters out agencies with zero budget authority", () => {
    const tree = buildToptierTree([
      makeAgency({ budget_authority_amount: 0, toptier_code: "000" }),
      makeAgency({ budget_authority_amount: 500, toptier_code: "001" }),
    ])
    expect(tree.children).toHaveLength(1)
    expect(tree.children![0].toptierCode).toBe("001")
  })

  it("sorts children by budget_authority_amount descending", () => {
    const tree = buildToptierTree([
      makeAgency({ budget_authority_amount: 100, toptier_code: "A" }),
      makeAgency({ budget_authority_amount: 500, toptier_code: "B" }),
      makeAgency({ budget_authority_amount: 300, toptier_code: "C" }),
    ])
    const codes = tree.children!.map((c) => c.toptierCode)
    expect(codes).toEqual(["B", "C", "A"])
  })

  it("limits to 25 children", () => {
    const agencies = Array.from({ length: 30 }, (_, i) =>
      makeAgency({ toptier_code: String(i).padStart(3, "0"), budget_authority_amount: 30 - i })
    )
    const tree = buildToptierTree(agencies)
    expect(tree.children).toHaveLength(25)
  })

  it("sets child node fields correctly", () => {
    const tree = buildToptierTree([makeAgency()])
    const child = tree.children![0]
    expect(child.type).toBe("agency")
    expect(child.depth).toBe(1)
    expect(child.parentTrail).toEqual(["U.S. Treasury"])
    expect(child.isExpandable).toBe(true)
    expect(child.sourceUrl).toBe("https://www.usaspending.gov/agency/012")
    expect(child.sourceCode).toBe("TST / 012")
    expect(child.percentOfParent).toBe(30) // 0.3 * 100
  })

  it("marks children with outlay > 0 as verified", () => {
    const tree = buildToptierTree([makeAgency({ outlay_amount: 10 })])
    expect(tree.children![0].status).toBe("verified")
  })

  it("marks children with outlay 0 as pending", () => {
    const tree = buildToptierTree([makeAgency({ outlay_amount: 0 })])
    expect(tree.children![0].status).toBe("pending")
  })

  it("handles empty array", () => {
    const tree = buildToptierTree([])
    expect(tree.amount).toBe(0)
    expect(tree.children).toEqual([])
  })
})
