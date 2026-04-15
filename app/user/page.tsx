"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { UserDashboard } from "@/components/dashboard/user-dashboard"
import { getUsers, getUserBalances, getEntriesWithDetails } from "@/lib/actions"
import type { LunchUser, UserBalance, EntryWithDetails } from "@/lib/actions"

async function fetchData() {
  const [users, balances, entries] = await Promise.all([
    getUsers(),
    getUserBalances(),
    getEntriesWithDetails(),
  ])
  return { users, balances, entries }
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
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
          selectedUserId={selectedUserId}
          onUserChange={setSelectedUserId}
        />
      </div>
    </div>
  )
}
