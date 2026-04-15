import { TopNavbar } from "@/components/dashboard/top-navbar"
import { ContributionChart } from "@/components/dashboard/contribution-chart"
import { UserBalanceTable } from "@/components/dashboard/user-balance-table"
import { getContributionData, getUserBalances } from "@/lib/actions"

export const dynamic = "force-dynamic"

export default async function AnalysisPage() {
  const [contributionData, balances] = await Promise.all([
    getContributionData(),
    getUserBalances(),
  ])

  return (
    <div className="flex flex-col h-full">
      <TopNavbar title="Contribution Analysis" />
      <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-auto">
        <ContributionChart data={contributionData} />
        <UserBalanceTable balances={balances} />
      </div>
    </div>
  )
}
