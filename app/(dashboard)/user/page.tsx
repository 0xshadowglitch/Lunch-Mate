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
  getMonthlySummary,
  getCurrentUser
} from "@/lib/actions"
import { getUserOrg } from "@/lib/org-actions"

async function fetchData() {
  const [users, balances, entries, weeklyData, monthlyData, org, user] = await Promise.all([
    getUsers(),
    getUserBalances(),
    getEntriesWithDetails(),
    getWeeklySummary(),
    getMonthlySummary(),
    getUserOrg(),
    getCurrentUser(),
  ])
  return { users, balances, entries, weeklyData, monthlyData, org, user }
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
      <div className="flex flex-col h-full bg-background/50">
        <TopNavbar title="My Dashboard" />
        <div className="flex-1 p-6 lg:p-10 pb-24 overflow-auto">
          <UserDashboardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background/50">
      <TopNavbar title="My Dashboard" />
      <div className="flex-1 p-6 lg:p-10 pb-24 overflow-auto">
        <UserDashboard
          users={data.users}
          balances={data.balances}
          entries={data.entries}
          weeklyData={data.weeklyData}
          monthlyData={data.monthlyData}
          selectedUserId={selectedUserId}
          onUserChange={setSelectedUserId}
          currency={data.org?.currency || "₹"}
          currentUserId={data.user?.id}
        />
      </div>
    </div>
  )
}
