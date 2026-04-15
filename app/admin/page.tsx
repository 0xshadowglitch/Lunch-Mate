import { TopNavbar } from "@/components/dashboard/top-navbar"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { UserBalanceTable } from "@/components/dashboard/user-balance-table"
import { SpendingTrendChart } from "@/components/dashboard/spending-trend-chart"
import { ContributionChart } from "@/components/dashboard/contribution-chart"
import {
  getStats,
  getUserBalances,
  getSpendingTrend,
  getContributionData,
} from "@/lib/actions"

export const dynamic = "force-dynamic"

export default async function AdminOverviewPage() {
  const [stats, balances, spendingTrend, contributionData] = await Promise.all([
    getStats(),
    getUserBalances(),
    getSpendingTrend(),
    getContributionData(),
  ])

  return (
    <div className="flex flex-col h-full">
      <TopNavbar title="Dashboard Overview" />
      <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-auto">
        <KPICards
          totalExpense={stats.totalExpense}
          totalPaid={stats.totalPaid}
          netBalance={stats.netBalance}
          totalEntries={stats.totalEntries}
        />
        <UserBalanceTable balances={balances} />
        <div className="grid gap-6 lg:grid-cols-2">
          <SpendingTrendChart data={spendingTrend} />
          <ContributionChart data={contributionData} />
        </div>
      </div>
    </div>
  )
}
