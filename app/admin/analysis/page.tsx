"use client"

import { useState, useEffect } from "react"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { ContributionChart } from "@/components/dashboard/contribution-chart"
import { UserBalanceTable } from "@/components/dashboard/user-balance-table"
import { getContributionData, calculateUserBalances } from "@/lib/store"

export default function AnalysisPage() {
  const [contributionData, setContributionData] = useState(getContributionData())
  const [balances, setBalances] = useState(calculateUserBalances())

  useEffect(() => {
    setContributionData(getContributionData())
    setBalances(calculateUserBalances())
  }, [])

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
