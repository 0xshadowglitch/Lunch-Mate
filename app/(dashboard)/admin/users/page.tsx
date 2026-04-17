import { TopNavbar } from "@/components/dashboard/top-navbar"
import { UserManagement } from "@/components/dashboard/user-management"
import { getUsers, getUserBalances } from "@/lib/actions"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const [users, balances] = await Promise.all([
    getUsers(),
    getUserBalances(),
  ])

  return (
    <div className="flex flex-col h-full">
      <TopNavbar title="User Management" />
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <UserManagement users={users} balances={balances} />
      </div>
    </div>
  )
}
