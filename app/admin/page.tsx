"use client"

import { useState, useEffect } from "react"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { UserBalanceTable } from "@/components/dashboard/user-balance-table"
import { SpendingTrendChart } from "@/components/dashboard/spending-trend-chart"
import { ContributionChart } from "@/components/dashboard/contribution-chart"
import {
  getMonthlyStats,
  calculateUserBalances,
  getSpendingTrend,
  getContributionData,
  getLunchEntries,
} from "@/lib/store"

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(getMonthlyStats())
  const [balances, setBalances] = useState(calculateUserBalances())
  const [spendingTrend, setSpendingTrend] = useState(getSpendingTrend())
  const [contributionData, setContributionData] = useState(getContributionData())

  useEffect(() => {
    // Refresh data on mount
    setStats(getMonthlyStats())
    setBalances(calculateUserBalances())
    setSpendingTrend(getSpendingTrend())
    setContributionData(getContributionData())
  }, [])

  const handleExport = () => {
    const entries = getLunchEntries()
    const csvContent = [
      ["Date", "Total Expense", ...balances.map((b) => `${b.name} Paid`), ...balances.map((b) => `${b.name} Share`)].join(","),
      ...entries.map((entry) => [
        entry.date,
        entry.totalExpense,
        ...balances.map((b) => entry.paid[b.userId] || 0),
        ...balances.map((b) => entry.shares[b.userId] || 0),
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "lunch-tracker-data.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      <TopNavbar
        title="Dashboard Overview"
        onMonthChange={(month) => console.log("Month changed:", month)}
        onExport={handleExport}
      />
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
