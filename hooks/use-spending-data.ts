import useSWR, { mutate } from "swr"
import type {
  ToptierAgenciesResponse,
  AgencyDetailResponse,
  FederalAccountsResponse,
  AgenciesOverviewResponse,
} from "@/lib/moneytag-data"
import { getCurrentFiscalYear } from "@/lib/moneytag-data"

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
})

const defaultSwrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  dedupingInterval: 600_000,
} as const

export function useToptierAgencies(sort = "budget_authority_amount", order = "desc") {
  return useSWR<ToptierAgenciesResponse>(
    `/api/spending/toptier?sort=${sort}&order=${order}`,
    fetcher,
    defaultSwrConfig
  )
}

export function useAgencyDetail(toptierCode: string | null) {
  const fy = getCurrentFiscalYear()
  return useSWR<AgencyDetailResponse>(
    toptierCode ? `/api/spending/agency/${toptierCode}?fiscal_year=${fy}` : null,
    fetcher,
    defaultSwrConfig
  )
}

export function useFederalAccounts(toptierCode: string | null) {
  const fy = getCurrentFiscalYear()
  return useSWR<FederalAccountsResponse>(
    toptierCode ? `/api/spending/agency/${toptierCode}/federal-accounts?fiscal_year=${fy}` : null,
    fetcher,
    defaultSwrConfig
  )
}

export function useAgenciesOverview(fiscalYear: number) {
  return useSWR<AgenciesOverviewResponse>(
    `/api/spending/agencies?fiscal_year=${fiscalYear}&limit=100`,
    fetcher,
    { ...defaultSwrConfig, dedupingInterval: 3_600_000 }
  )
}

/**
 * Prefetch agency detail data into the SWR cache.
 * Call on hover/pointer-enter over an agency row to warm the cache
 * before the user navigates to the detail view.
 */
export function prefetchAgencyDetail(toptierCode: string) {
  const fy = getCurrentFiscalYear()
  const key = `/api/spending/agency/${toptierCode}?fiscal_year=${fy}`

  // mutate with a fetcher populates the cache without a mounted hook
  mutate<AgencyDetailResponse>(key, fetcher(key), { revalidate: false })
}
