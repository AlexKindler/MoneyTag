import useSWR from "swr"
import type {
  ToptierAgenciesResponse,
  AgencyDetailResponse,
  FederalAccountsResponse,
} from "@/lib/moneytag-data"
import { getCurrentFiscalYear } from "@/lib/moneytag-data"

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
})

export function useToptierAgencies(sort = "budget_authority_amount", order = "desc") {
  return useSWR<ToptierAgenciesResponse>(
    `/api/spending/toptier?sort=${sort}&order=${order}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300_000,
    }
  )
}

export function useAgencyDetail(toptierCode: string | null) {
  const fy = getCurrentFiscalYear()
  return useSWR<AgencyDetailResponse>(
    toptierCode ? `/api/spending/agency/${toptierCode}?fiscal_year=${fy}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300_000,
    }
  )
}

export function useFederalAccounts(toptierCode: string | null) {
  const fy = getCurrentFiscalYear()
  return useSWR<FederalAccountsResponse>(
    toptierCode ? `/api/spending/agency/${toptierCode}/federal-accounts?fiscal_year=${fy}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300_000,
    }
  )
}
