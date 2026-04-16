import { DailyLunchTracker } from "@/components/dashboard/daily-lunch-tracker"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { getUserOrg } from "@/lib/org-actions"

export const dynamic = "force-dynamic"

export default async function LunchPage() {
  const [{ entries, users }, org] = await Promise.all([
    getDailyLunchData(),
    getUserOrg()
  ])

  return (
    <div className="flex flex-col h-full">
      <TopNavbar title="Daily Lunch Tracker" />
      <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-auto">
        <DailyLunchTracker entries={entries} users={users} currency={org?.currency || "₹"} />
      </div>
    </div>
  )
}
