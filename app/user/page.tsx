"use client"

import { useState, useEffect, useCallback } from "react"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { UserDashboard } from "@/components/dashboard/user-dashboard"
import {
  getUsers,
  calculateUserBalances,
  getLunchEntries,
} from "@/lib/store"
import type { User, UserBalance, LunchEntry } from "@/lib/store"

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([])
  const [balances, setBalances] = useState<UserBalance[]>([])
  const [entries, setEntries] = useState<LunchEntry[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")

  const refreshData = useCallback(() => {
    const fetchedUsers = getUsers()
    setUsers(fetchedUsers)
    setBalances(calculateUserBalances())
    setEntries(getLunchEntries())
    
    // Set default selected user if not already set
    if (!selectedUserId && fetchedUsers.length > 0) {
      setSelectedUserId(fetchedUsers[0].id)
    }
  }, [selectedUserId])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  return (
    <div className="flex flex-col h-full">
      <TopNavbar title="My Dashboard" />
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <UserDashboard
          users={users}
          balances={balances}
          entries={entries}
          selectedUserId={selectedUserId}
          onUserChange={setSelectedUserId}
        />
      </div>
    </div>
  )
}
