import { TopNavbar } from "@/components/dashboard/top-navbar"
import { UserBalanceTable } from "@/components/dashboard/user-balance-table"
import { getUserBalances, getCurrentUser } from "@/lib/actions"
import { getUserOrg } from "@/lib/org-actions"

export const dynamic = "force-dynamic"

export default async function AnalysisPage() {
  const [balances, user, org] = await Promise.all([
    getUserBalances(),
    getCurrentUser(),
    getUserOrg(),
  ])

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background/50">
      <TopNavbar title="Financial Status" />
      <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-auto">
        <UserBalanceTable balances={balances} currency={org?.currency} currentUserId={user?.id} />
      </div>
    </div>
  )
}
