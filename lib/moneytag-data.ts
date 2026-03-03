// MoneyTag data types and helpers for USASpending.gov API integration
// ALL identifiers come from real USASpending.gov data -- zero placeholders.

// --- API Response Types ---

export interface ToptierAgency {
  agency_id: number
  toptier_code: string
  abbreviation: string
  agency_name: string
  congressional_justification_url: string | null
  active_fy: string
  active_fq: string
  outlay_amount: number
  obligated_amount: number
  budget_authority_amount: number
  current_total_budget_authority_amount: number
  percentage_of_total_budget_authority: number
  agency_slug: string
}

export interface AgencyOverview {
  fiscal_year: number
  toptier_code: string
  name: string
  abbreviation: string
  agency_id: number
  icon_filename: string
  mission: string
  website: string
  congressional_justification_url: string
  about_agency_data: string | null
  subtier_agency_count: number
  def_codes: unknown[]
  messages: string[]
}

export interface SubAgency {
  name: string
  abbreviation: string | null
  total_obligations: number
  transaction_count: number
  new_award_count: number
  children: SubAgencyOffice[]
}

export interface SubAgencyOffice {
  name: string
  total_obligations: number
  transaction_count: number
  new_award_count: number
}

export interface BudgetFunction {
  name: string
  code: string
  obligated_amount: number
  gross_outlay_amount: number
  children: BudgetSubfunction[]
}

export interface BudgetSubfunction {
  name: string
  code: string
  obligated_amount: number
  gross_outlay_amount: number
}

export interface FederalAccount {
  code: string
  name: string
  obligated_amount: number
  gross_outlay_amount: number
  children: TreasuryAccount[]
}

export interface TreasuryAccount {
  code: string
  name: string
  obligated_amount: number
  gross_outlay_amount: number
}

export interface ObligationsByCategory {
  total_aggregated_amount: number
  contracts: number
  direct_payments: number
  grants: number
  idvs: number
  loans: number
  other: number
}

export interface AgencyReportingOverview {
  agency_name: string
  abbreviation: string
  toptier_code: string
  agency_id: number | null
  current_total_budget_authority_amount: number
  recent_publication_date: string | null
  recent_publication_date_certified: boolean
  tas_accounts_total: number
  obligation_difference: number
  unlinked_contract_award_count: number
  unlinked_assistance_award_count: number
  assurance_statement_url: string | null
}

// --- Responses ---

export interface ToptierAgenciesResponse {
  results: ToptierAgency[]
}

export interface AgencyDetailResponse {
  overview: AgencyOverview
  sub_agencies: {
    results: SubAgency[]
    page_metadata: PageMetadata
  }
  obligations_by_category: ObligationsByCategory
  budget_functions: {
    results: BudgetFunction[]
    page_metadata: PageMetadata
  }
}

export interface AgenciesOverviewResponse {
  page_metadata: PageMetadata
  results: AgencyReportingOverview[]
}

export interface FederalAccountsResponse {
  toptier_code: string
  fiscal_year: number
  page_metadata: PageMetadata
  results: FederalAccount[]
}

export interface PageMetadata {
  page: number
  total: number
  limit: number
  next: number | null
  previous: number | null
  hasNext: boolean
  hasPrevious: boolean
}

// --- MoneyTag Node Types ---

export type SpendCategory =
  | "Contracts"
  | "Direct Payments"
  | "Grants"
  | "Loans"
  | "Other"
  | "Admin"
  | "Unknown"

export type NodeType =
  | "treasury"
  | "agency"
  | "sub-agency"
  | "budget-function"
  | "federal-account"
  | "treasury-account"
  | "terminal"

export type NodeStatus = "verified" | "pending" | "flagged"

/**
 * Every field uses REAL identifiers from USASpending.gov:
 * - sourceCode: actual toptier_code, budget function code, or federal account code
 * - sourceUrl: direct link to the entity on USASpending.gov
 * - parentTrail: real labels showing the funding path
 */
export interface LedgerNode {
  id: string
  name: string
  sourceCode: string
  sourceUrl: string
  amount: number
  outlayAmount?: number
  depth: number
  type: NodeType
  category?: SpendCategory
  children?: LedgerNode[]
  parentTrail: string[]
  status: NodeStatus
  toptierCode?: string
  abbreviation?: string
  percentOfParent?: number
  childCount?: number
  isExpandable?: boolean
}

export interface LeakStats {
  totalBudget: number
  totalObligated: number
  totalOutlayed: number
  unobligated: number
  obligatedPercent: number
  unobligatedPercent: number
  agencyCount: number
}

// --- Fiscal Year ---

export function getCurrentFiscalYear(): number {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  return month >= 9 ? year + 1 : year
}

// --- Helpers ---

export function formatCurrency(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000_000_000) return `$${(amount / 1_000_000_000_000).toFixed(2)}T`
  if (abs >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount.toLocaleString()}`
}

export function formatLargeCurrency(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000_000_000) return `$${(amount / 1_000_000_000_000).toFixed(3)}T`
  if (abs >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(2)}B`
  return formatCurrency(amount)
}

function agencyUrl(code: string): string {
  return `https://www.usaspending.gov/agency/${code}`
}

function federalAccountUrl(code: string): string {
  return `https://www.usaspending.gov/federal_account/${code}`
}

export function getCategoryColor(category: SpendCategory): string {
  const colors: Record<SpendCategory, string> = {
    "Contracts": "#00ccff",
    "Direct Payments": "#00FF41",
    "Grants": "#ffcc00",
    "Loans": "#ff6600",
    "Other": "#666666",
    "Admin": "#FF3131",
    "Unknown": "#666666",
  }
  return colors[category]
}

export function categorizeBudgetFunction(name: string): SpendCategory {
  const lower = name.toLowerCase()
  if (lower.includes("health") || lower.includes("medicare") || lower.includes("medicaid")) return "Direct Payments"
  if (lower.includes("defense") || lower.includes("military")) return "Contracts"
  if (lower.includes("income security") || lower.includes("social") || lower.includes("security")) return "Direct Payments"
  if (lower.includes("education") || lower.includes("training") || lower.includes("science")) return "Grants"
  if (lower.includes("transportation") || lower.includes("community") || lower.includes("development")) return "Grants"
  if (lower.includes("interest") || lower.includes("general government") || lower.includes("administration")) return "Admin"
  if (lower.includes("agriculture") || lower.includes("energy") || lower.includes("environment")) return "Grants"
  if (lower.includes("commerce") || lower.includes("housing")) return "Loans"
  return "Other"
}

// --- Tree Builders (real USASpending identifiers only) ---

const TREASURY_LABEL = "U.S. Treasury"
const TREASURY_CODE = "TRES"
const TREASURY_URL = "https://www.usaspending.gov/explorer"

export function buildToptierTree(agencies: ToptierAgency[]): LedgerNode {
  const totalBudget = agencies.length > 0
    ? agencies[0].current_total_budget_authority_amount
    : 0

  const topAgencies = agencies
    .filter((a) => a.budget_authority_amount > 0)
    .sort((a, b) => b.budget_authority_amount - a.budget_authority_amount)
    .slice(0, 25)

  const children: LedgerNode[] = topAgencies.map((agency) => ({
    id: `agency-${agency.toptier_code}`,
    name: agency.agency_name,
    sourceCode: `${agency.abbreviation} / ${agency.toptier_code}`,
    sourceUrl: agencyUrl(agency.toptier_code),
    amount: agency.budget_authority_amount,
    outlayAmount: agency.outlay_amount,
    depth: 1,
    type: "agency" as NodeType,
    parentTrail: [TREASURY_LABEL],
    status: (agency.outlay_amount > 0 ? "verified" : "pending") as NodeStatus,
    toptierCode: agency.toptier_code,
    abbreviation: agency.abbreviation,
    percentOfParent: agency.percentage_of_total_budget_authority * 100,
    isExpandable: true,
  }))

  return {
    id: "us-treasury",
    name: TREASURY_LABEL,
    sourceCode: TREASURY_CODE,
    sourceUrl: TREASURY_URL,
    amount: totalBudget,
    depth: 0,
    type: "treasury",
    parentTrail: [],
    status: "verified",
    children,
    isExpandable: false,
  }
}

export function buildSubAgencyNodes(
  subAgencies: SubAgency[],
  parentNode: LedgerNode
): LedgerNode[] {
  return subAgencies
    .filter((sa) => sa.total_obligations !== 0)
    .sort((a, b) => Math.abs(b.total_obligations) - Math.abs(a.total_obligations))
    .slice(0, 15)
    .map((sa) => ({
      id: `sub-${parentNode.toptierCode}-${sa.name.slice(0, 20)}`,
      name: sa.name,
      sourceCode: sa.abbreviation || sa.name.slice(0, 12),
      sourceUrl: parentNode.sourceUrl,
      amount: sa.total_obligations,
      depth: 2,
      type: "sub-agency" as NodeType,
      parentTrail: [...parentNode.parentTrail, parentNode.sourceCode],
      status: (sa.total_obligations > 0 ? "verified" : "flagged") as NodeStatus,
      abbreviation: sa.abbreviation || undefined,
      percentOfParent: parentNode.amount > 0 ? (Math.abs(sa.total_obligations) / parentNode.amount) * 100 : 0,
      childCount: sa.transaction_count,
      isExpandable: false,
    }))
}

export function buildBudgetFunctionNodes(
  functions: BudgetFunction[],
  parentNode: LedgerNode
): LedgerNode[] {
  return functions
    .filter((bf) => bf.obligated_amount !== 0)
    .sort((a, b) => Math.abs(b.obligated_amount) - Math.abs(a.obligated_amount))
    .slice(0, 12)
    .map((bf) => {
      const category = categorizeBudgetFunction(bf.name)
      const isAdmin = category === "Admin"
      const bfCode = `BF-${bf.code}`
      return {
        id: `bf-${parentNode.toptierCode}-${bf.code}`,
        name: bf.name,
        sourceCode: bfCode,
        sourceUrl: parentNode.sourceUrl,
        amount: bf.obligated_amount,
        outlayAmount: bf.gross_outlay_amount,
        depth: 2,
        type: "budget-function" as NodeType,
        category,
        parentTrail: [...parentNode.parentTrail, parentNode.sourceCode],
        status: (isAdmin ? "flagged" : bf.obligated_amount > 0 ? "verified" : "pending") as NodeStatus,
        percentOfParent: parentNode.amount > 0 ? (Math.abs(bf.obligated_amount) / parentNode.amount) * 100 : 0,
        isExpandable: bf.children && bf.children.length > 0,
        children: bf.children
          ?.filter((c) => c.obligated_amount !== 0)
          .sort((a, b) => Math.abs(b.obligated_amount) - Math.abs(a.obligated_amount))
          .slice(0, 8)
          .map((sub) => {
            const subCat = categorizeBudgetFunction(sub.name)
            return {
              id: `bsf-${parentNode.toptierCode}-${sub.code}`,
              name: sub.name,
              sourceCode: `BSF-${sub.code}`,
              sourceUrl: parentNode.sourceUrl,
              amount: sub.obligated_amount,
              outlayAmount: sub.gross_outlay_amount,
              depth: 3,
              type: "terminal" as NodeType,
              category: subCat,
              parentTrail: [...parentNode.parentTrail, parentNode.sourceCode, bfCode],
              status: (subCat === "Admin" ? "flagged" : sub.obligated_amount > 0 ? "verified" : "pending") as NodeStatus,
              percentOfParent: bf.obligated_amount > 0 ? (Math.abs(sub.obligated_amount) / Math.abs(bf.obligated_amount)) * 100 : 0,
              isExpandable: false,
            }
          }),
      }
    })
}

export function buildFederalAccountNodes(
  accounts: FederalAccount[],
  parentNode: LedgerNode
): LedgerNode[] {
  return accounts
    .filter((fa) => fa.obligated_amount !== 0)
    .sort((a, b) => Math.abs(b.obligated_amount) - Math.abs(a.obligated_amount))
    .slice(0, 15)
    .map((fa) => {
      const faCode = `FA-${fa.code}`
      return {
        id: `fa-${fa.code}`,
        name: fa.name,
        sourceCode: faCode,
        sourceUrl: federalAccountUrl(fa.code),
        amount: fa.obligated_amount,
        outlayAmount: fa.gross_outlay_amount,
        depth: 2,
        type: "federal-account" as NodeType,
        parentTrail: [...parentNode.parentTrail, parentNode.sourceCode],
        status: (fa.obligated_amount > 0 ? "verified" : "pending") as NodeStatus,
        percentOfParent: parentNode.amount > 0 ? (Math.abs(fa.obligated_amount) / parentNode.amount) * 100 : 0,
        isExpandable: fa.children && fa.children.length > 0,
        children: fa.children
          ?.filter((c) => c.obligated_amount !== 0)
          .sort((a, b) => Math.abs(b.obligated_amount) - Math.abs(a.obligated_amount))
          .slice(0, 8)
          .map((ta) => ({
            id: `ta-${ta.code}`,
            name: ta.name,
            sourceCode: `TAS-${ta.code}`,
            sourceUrl: federalAccountUrl(fa.code),
            amount: ta.obligated_amount,
            outlayAmount: ta.gross_outlay_amount,
            depth: 3,
            type: "treasury-account" as NodeType,
            parentTrail: [...parentNode.parentTrail, parentNode.sourceCode, faCode],
            status: (ta.obligated_amount > 0 ? "verified" : "pending") as NodeStatus,
            percentOfParent: fa.obligated_amount > 0 ? (Math.abs(ta.obligated_amount) / Math.abs(fa.obligated_amount)) * 100 : 0,
            isExpandable: false,
          })),
      }
    })
}

export function calculateLeakStats(agencies: ToptierAgency[]): LeakStats {
  const totalBudget = agencies.length > 0
    ? agencies[0].current_total_budget_authority_amount
    : 0

  const totalObligated = agencies.reduce((sum, a) => sum + a.obligated_amount, 0)
  const totalOutlayed = agencies.reduce((sum, a) => sum + a.outlay_amount, 0)
  const unobligated = totalBudget - totalObligated

  return {
    totalBudget,
    totalObligated,
    totalOutlayed,
    unobligated,
    obligatedPercent: totalBudget > 0 ? (totalObligated / totalBudget) * 100 : 0,
    unobligatedPercent: totalBudget > 0 ? (unobligated / totalBudget) * 100 : 0,
    agencyCount: agencies.filter((a) => a.budget_authority_amount > 0).length,
  }
}
