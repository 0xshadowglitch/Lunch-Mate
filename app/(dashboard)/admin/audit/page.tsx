import { TopNavbar } from "@/components/dashboard/top-navbar"
import { DataAuditTable } from "@/components/dashboard/data-audit-table"
import { getEntriesWithDetails } from "@/lib/actions"

export const dynamic = "force-dynamic"

export default async function AuditPage() {
  const entriesWithDetails = await getEntriesWithDetails()

  // Transform entries to audit format
  const auditEntries = entriesWithDetails.map((entry) => {
    const totalShares = entry.shares.reduce((sum, s) => sum + s.share_amount, 0)
    const totalPayments = entry.payments.reduce((sum, p) => sum + p.paid_amount, 0)

    const issues: string[] = []
    if (entry.total_expense === 0) issues.push("Zero expense")
    if (totalPayments === 0) issues.push("No payments recorded")
    if (Math.abs(entry.total_expense - totalShares) > 1) issues.push("Shares mismatch")
    if (Math.abs(entry.total_expense - totalPayments) > 1) issues.push("Payment mismatch")

    return {
      id: entry.id,
      date: entry.date,
      totalExpense: entry.total_expense,
      totalShares,
      totalPayments,
      issues,
    }
  })

  return (
    <div className="flex flex-col h-full">
      <TopNavbar title="Data Audit" />
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <DataAuditTable entries={auditEntries} />
      </div>
    </div>
  )
}
