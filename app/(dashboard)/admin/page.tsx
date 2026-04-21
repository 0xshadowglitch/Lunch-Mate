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
  getCurrentUser,
} from "@/lib/actions"
import { getUserOrg } from "@/lib/org-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Plus, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { InviteRecovery } from "@/components/dashboard/invite-recovery"

export const dynamic = "force-dynamic"

export default async function AdminOverviewPage() {
  const org = await getUserOrg()

  // If no org found, show the create org UI
  if (!org) {
    return (
      <div className="flex flex-col h-full bg-background/50">
        <TopNavbar title="Welcome to Lunch Mate" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 space-y-6">
          <InviteRecovery />
          <Card className="max-w-md w-full bg-card/40 backdrop-blur-2xl border-border/40 shadow-2xl rounded-[2rem] overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="text-center pt-10 pb-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/20">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-black uppercase tracking-widest leading-tight">
                No Team Found
              </CardTitle>
              <CardDescription className="text-sm font-medium uppercase tracking-tight opacity-60 pt-2">
                Create a shared space for your colleague lunch tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs font-bold leading-relaxed opacity-80 uppercase tracking-wide">
                  Set up your lunch tracker environment to start managing daily expenses and balances with your team.
                </p>
              </div>
              <Button asChild className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Link href="/onboarding">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your Team
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const [stats, balances, spendingTrend, contributionData, user] = await Promise.all([
    getStats(),
    getUserBalances(),
    getSpendingTrend(),
    getContributionData(),
    getCurrentUser(),
  ])

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background/50">
      <TopNavbar title="Admin Dashboard" />
      <div className="flex-1 p-4 md:p-6 lg:p-10 pb-24 space-y-6 md:space-y-8 overflow-auto">
        <KPICards
          totalExpense={stats.totalExpense}
          totalPaid={stats.totalPaid}
          netBalance={stats.netBalance}
          totalEntries={stats.totalEntries}
          currency={org.currency}
        />
        <UserBalanceTable balances={balances} currency={org.currency} currentUserId={user?.id} />
        <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2">
          <SpendingTrendChart data={spendingTrend} currency={org.currency} />
          <ContributionChart data={contributionData} currency={org.currency} />
        </div>
      </div>
    </div>
  )
}
