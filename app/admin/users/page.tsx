"use client"

import { useState, useEffect, useCallback } from "react"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { UserManagement } from "@/components/dashboard/user-management"
import {
  getUsers,
  calculateUserBalances,
  addUser,
  deleteUser,
} from "@/lib/store"
import type { User, UserBalance } from "@/lib/store"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [balances, setBalances] = useState<UserBalance[]>([])

  const refreshData = useCallback(() => {
    setUsers(getUsers())
    setBalances(calculateUserBalances())
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const handleAddUser = (name: string) => {
    addUser(name)
    refreshData()
  }

  const handleDeleteUser = (id: string) => {
    deleteUser(id)
    refreshData()
  }

  return (
    <div className="flex flex-col h-full">
      <TopNavbar title="User Management" />
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <UserManagement
          users={users}
          balances={balances}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
        />
      </div>
    </div>
  )
}
