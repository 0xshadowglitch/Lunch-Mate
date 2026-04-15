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
import { formatDate } from "@/lib/date-utils"

type UserStat = {
  userId: string
  userName: string
  paid: number
  shares: number
  balance: number
}

type WeekData = {
  weekStart: string
  totalExpense: number
  userStats: UserStat[]
}

type OverallBalance = {
  userId: string
  userName: string
  balance: number
}

interface WeeklySummaryProps {
  weeks: WeekData[]
  users: { id: string; name: string }[]
  overallBalances: OverallBalance[]
}

export function WeeklySummary({ weeks, users, overallBalances }: WeeklySummaryProps) {
  return (
    <div className="space-y-6">
      {/* Overall Balances (Carry Over) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-primary">
            Overall Balances (Carry Over)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {overallBalances.map((balance) => (
              <div
                key={balance.userId}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <span className="font-medium text-foreground">{balance.userName}</span>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    balance.balance > 0
                      ? "text-emerald-500"
                      : balance.balance < 0
                      ? "text-red-500"
                      : "text-muted-foreground"
                  )}
                >
                  {balance.balance >= 0 ? "" : ""}
                  {balance.balance.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10 hover:bg-primary/10">
                  <TableHead className="font-semibold text-primary">Week Start</TableHead>
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
                      {user.name} Bal
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2 + users.length * 2}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  weeks.map((week) => (
                    <TableRow key={week.weekStart} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {formatDate(week.weekStart)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {week.totalExpense.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      {users.map((user) => {
                        const stat = week.userStats.find((s) => s.userId === user.id)
                        return (
                          <TableCell
                            key={`${week.weekStart}-${user.id}-paid`}
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
                        const stat = week.userStats.find((s) => s.userId === user.id)
                        const balance = stat?.balance || 0
                        return (
                          <TableCell
                            key={`${week.weekStart}-${user.id}-bal`}
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
    </div>
  )
}
