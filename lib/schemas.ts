import { z } from "zod"

// --- Leaf schemas ---

const PageMetadataSchema = z.object({
  page: z.number(),
  total: z.number(),
  limit: z.number(),
  next: z.number().nullable(),
  previous: z.number().nullable(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
})

// --- API Response Schemas ---

export const ToptierAgencySchema = z.object({
  agency_id: z.number(),
  toptier_code: z.string(),
  abbreviation: z.string(),
  agency_name: z.string(),
  congressional_justification_url: z.string().nullable(),
  active_fy: z.string(),
  active_fq: z.string(),
  outlay_amount: z.number(),
  obligated_amount: z.number(),
  budget_authority_amount: z.number(),
  current_total_budget_authority_amount: z.number(),
  percentage_of_total_budget_authority: z.number(),
  agency_slug: z.string(),
})

export const ToptierAgenciesResponseSchema = z.object({
  results: z.array(ToptierAgencySchema),
})

export const AgencyOverviewSchema = z.object({
  fiscal_year: z.number(),
  toptier_code: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  agency_id: z.number(),
  icon_filename: z.string(),
  mission: z.string(),
  website: z.string(),
  congressional_justification_url: z.string(),
  about_agency_data: z.string().nullable(),
  subtier_agency_count: z.number(),
  def_codes: z.array(z.unknown()),
  messages: z.array(z.string()),
})

const BudgetSubfunctionSchema = z.object({
  name: z.string(),
  code: z.string(),
  obligated_amount: z.number(),
  gross_outlay_amount: z.number(),
})

export const BudgetFunctionSchema = z.object({
  name: z.string(),
  code: z.string(),
  obligated_amount: z.number(),
  gross_outlay_amount: z.number(),
  children: z.array(BudgetSubfunctionSchema),
})

const TreasuryAccountSchema = z.object({
  code: z.string(),
  name: z.string(),
  obligated_amount: z.number(),
  gross_outlay_amount: z.number(),
})

export const FederalAccountSchema = z.object({
  code: z.string(),
  name: z.string(),
  obligated_amount: z.number(),
  gross_outlay_amount: z.number(),
  children: z.array(TreasuryAccountSchema),
})

export const FederalAccountsResponseSchema = z.object({
  toptier_code: z.string(),
  fiscal_year: z.number(),
  page_metadata: PageMetadataSchema,
  results: z.array(FederalAccountSchema),
})

const SubAgencyOfficeSchema = z.object({
  name: z.string(),
  total_obligations: z.number(),
  transaction_count: z.number(),
  new_award_count: z.number(),
})

const SubAgencySchema = z.object({
  name: z.string(),
  abbreviation: z.string().nullable(),
  total_obligations: z.number(),
  transaction_count: z.number(),
  new_award_count: z.number(),
  children: z.array(SubAgencyOfficeSchema),
})

const ObligationsByCategorySchema = z.object({
  total_aggregated_amount: z.number(),
  contracts: z.number(),
  direct_payments: z.number(),
  grants: z.number(),
  idvs: z.number(),
  loans: z.number(),
  other: z.number(),
})

export const AgencyDetailResponseSchema = z.object({
  overview: AgencyOverviewSchema,
  sub_agencies: z.object({
    results: z.array(SubAgencySchema),
    page_metadata: PageMetadataSchema,
  }),
  obligations_by_category: ObligationsByCategorySchema,
  budget_functions: z.object({
    results: z.array(BudgetFunctionSchema),
    page_metadata: PageMetadataSchema,
  }),
})

const AgencyReportingOverviewSchema = z.object({
  agency_name: z.string(),
  abbreviation: z.string(),
  toptier_code: z.string(),
  agency_id: z.number().nullable(),
  current_total_budget_authority_amount: z.number(),
  recent_publication_date: z.string().nullable(),
  recent_publication_date_certified: z.boolean(),
  tas_accounts_total: z.number(),
  obligation_difference: z.number(),
  unlinked_contract_award_count: z.number(),
  unlinked_assistance_award_count: z.number(),
  assurance_statement_url: z.string().nullable(),
})

export const AgenciesOverviewResponseSchema = z.object({
  page_metadata: PageMetadataSchema,
  results: z.array(AgencyReportingOverviewSchema),
})

// --- Validation helper ---

export function validateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  label: string
): void {
  const result = schema.safeParse(data)
  if (!result.success) {
    console.warn(
      `[schema-validation] ${label}: response did not match expected schema`,
      result.error.issues.slice(0, 5)
    )
  }
}
