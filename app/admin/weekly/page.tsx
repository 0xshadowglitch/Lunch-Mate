import { getWeeklySummary } from "@/lib/actions"
import { WeeklySummary } from "@/components/dashboard/weekly-summary"
import { TopNavbar } from "@/components/dashboard/top-navbar"

export default async function WeeklyPage() {
  const { weeks, users, overallBalances } = await getWeeklySummary()

  return (
    <div className="flex flex-col h-full">
      <TopNavbar title="Weekly Summary" />
      <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-auto">
        <WeeklySummary weeks={weeks} users={users} overallBalances={overallBalances} />
      </div>
    </div>
  )
}
