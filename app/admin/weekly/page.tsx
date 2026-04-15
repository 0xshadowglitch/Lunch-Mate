import { getWeeklySummary } from "@/lib/actions"
import { WeeklySummary } from "@/components/dashboard/weekly-summary"

export default async function WeeklyPage() {
  const { weeks, users, overallBalances } = await getWeeklySummary()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Weekly Summary</h1>
        <p className="text-muted-foreground">
          View weekly expense breakdowns and per-person balances
        </p>
      </div>

      <WeeklySummary weeks={weeks} users={users} overallBalances={overallBalances} />
    </div>
  )
}
