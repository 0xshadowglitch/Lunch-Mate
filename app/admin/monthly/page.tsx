import { getMonthlySummary } from "@/lib/actions"
import { MonthlySummary } from "@/components/dashboard/monthly-summary"

export default async function MonthlyPage() {
  const { months, users } = await getMonthlySummary()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Monthly Summary</h1>
        <p className="text-muted-foreground">
          View monthly expense breakdowns and per-person balances
        </p>
      </div>

      <MonthlySummary months={months} users={users} />
    </div>
  )
}
