"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type UserStat = {
  userId: string
  userName: string
  paid: number
  shares: number
  balance: number
}

type MonthData = {
  monthKey: string
  totalExpense: number
  userStats: UserStat[]
}

interface MonthlySummaryProps {
  months: MonthData[]
  users: { id: string; name: string }[]
}

function formatMonthDisplay(monthKey: string): string {
  const [year, month] = monthKey.split("-")
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return `${year}-${date.toLocaleString("en-US", { month: "short" })}`
}

export function MonthlySummary({ months, users }: MonthlySummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Monthly Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/10 hover:bg-primary/10">
                <TableHead className="font-semibold text-primary">Date - Year-Month</TableHead>
                <TableHead className="text-right font-semibold text-primary">
                  Total Expense
                </TableHead>
                {users.map((user) => (
                  <TableHead
                    key={`${user.id}-paid`}
                    className="text-right font-semibold text-primary"
                  >
                    {user.name} Paid
                  </TableHead>
                ))}
                {users.map((user) => (
                  <TableHead
                    key={`${user.id}-bal`}
                    className="text-right font-semibold text-primary"
                  >
                    {user.name} Balance
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2 + users.length * 2}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                months.map((month) => (
                  <TableRow key={month.monthKey} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {formatMonthDisplay(month.monthKey)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {month.totalExpense.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    {users.map((user) => {
                      const stat = month.userStats.find((s) => s.userId === user.id)
                      return (
                        <TableCell
                          key={`${month.monthKey}-${user.id}-paid`}
                          className="text-right tabular-nums"
                        >
                          {(stat?.paid || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      )
                    })}
                    {users.map((user) => {
                      const stat = month.userStats.find((s) => s.userId === user.id)
                      const balance = stat?.balance || 0
                      return (
                        <TableCell
                          key={`${month.monthKey}-${user.id}-bal`}
                          className={cn(
                            "text-right tabular-nums font-medium",
                            balance > 0
                              ? "text-emerald-500"
                              : balance < 0
                              ? "text-red-500"
                              : "text-muted-foreground"
                          )}
                        >
                          {balance.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
