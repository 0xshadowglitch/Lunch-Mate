import { getDailyLunchData } from "@/lib/actions"
import { DailyLunchTracker } from "@/components/dashboard/daily-lunch-tracker"

export default async function LunchPage() {
  const { entries, users } = await getDailyLunchData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lunch Tracker</h1>
        <p className="text-muted-foreground">
          Daily lunch entries with presence, shares, payments, and running balances
        </p>
      </div>

      <DailyLunchTracker entries={entries} users={users} />
    </div>
  )
}
