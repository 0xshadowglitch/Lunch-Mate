"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { UserDashboard } from "@/components/dashboard/user-dashboard"
import { UserDashboardSkeleton } from "@/components/dashboard/skeletons"
import { 
  getUsers, 
  getUserBalances, 
  getEntriesWithDetails, 
  getWeeklySummary, 
  getMonthlySummary 
} from "@/lib/actions"

async function fetchData() {
  const [users, balances, entries, weeklyData, monthlyData] = await Promise.all([
    getUsers(),
    getUserBalances(),
    getEntriesWithDetails(),
    getWeeklySummary(),
    getMonthlySummary(),
  ])
  return { users, balances, entries, weeklyData, monthlyData }
}

export default function UserPage() {
  const { data, isLoading } = useSWR("user-dashboard-data", fetchData, {
    revalidateOnFocus: false,
  })

  const [selectedUserId, setSelectedUserId] = useState<string>("")

  useEffect(() => {
    if (data?.users && data.users.length > 0 && !selectedUserId) {
      setSelectedUserId(data.users[0].id)
    }
  }, [data?.users, selectedUserId])

  if (isLoading || !data) {
    return (
      <div className="flex flex-col h-full">
        <TopNavbar title="My Dashboard" />
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <UserDashboardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <TopNavbar title="My Dashboard" />
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <UserDashboard
          users={data.users}
          balances={data.balances}
          entries={data.entries}
          weeklyData={data.weeklyData}
          monthlyData={data.monthlyData}
          selectedUserId={selectedUserId}
          onUserChange={setSelectedUserId}
        />
      </div>
    </div>
  )
}
