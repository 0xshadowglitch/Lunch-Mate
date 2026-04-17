"use client"

import { useState } from "react"
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
import { ChevronDown, ChevronRight, Check } from "lucide-react"

type EntryDetail = {
  id: string
  date: string
  totalExpense: number
  userDetails: {
    userId: string
    userName: string
    isPresent: boolean
    share: number
    paid: number
  }[]
}

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
  entries: EntryDetail[]
}

import { UserLabel } from "./user-label"
import type { LunchUser } from "@/lib/actions"

interface MonthlySummaryProps {
  months: MonthData[]
  users: LunchUser[]
  currency?: string
  currentUserId?: string
}

export function MonthlySummary({ 
  months, 
  users, 
  currency = "₹",
  currentUserId
}: MonthlySummaryProps) {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())

  const toggleMonth = (monthKey: string) => {
    const next = new Set(expandedMonths)
    if (next.has(monthKey)) {
      next.delete(monthKey)
    } else {
      next.add(monthKey)
    }
    setExpandedMonths(next)
  }

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split("-")
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleString("en-US", { month: "long", year: "numeric" })
  }

  return (
    <Card>
      <CardHeader className="pb-3 px-6">
        <CardTitle className="text-lg font-semibold">Monthly Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/10 hover:bg-primary/10 border-none">
                <TableHead className="font-bold text-primary w-10"></TableHead>
                <TableHead className="font-bold text-primary min-w-[150px]">Month</TableHead>
                <TableHead className="text-right font-bold text-primary min-w-[120px]">
                  Total Expense
                </TableHead>
                    <TableHead
                      key={`${user.id}-paid`}
                      className="text-right font-bold text-primary min-w-[100px] max-w-[120px]"
                    >
                      <UserLabel 
                        name={user.name} 
                        isMe={user.linked_user_id === currentUserId} 
                        className="text-[10px] text-right" 
                      />
                    </TableHead>
                    <TableHead
                      key={`${user.id}-bal`}
                      className="text-right font-bold text-primary min-w-[100px] max-w-[120px]"
                    >
                      <UserLabel 
                        name={user.name} 
                        isMe={user.linked_user_id === currentUserId} 
                        className="text-[10px] text-right" 
                      />
                    </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3 + users.length * 2}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                months.map((month) => (
                  <>
                    <TableRow 
                      key={month.monthKey} 
                      className="hover:bg-muted/30 cursor-pointer transition-colors border-b border-border/5 group"
                      onClick={() => toggleMonth(month.monthKey)}
                    >
                      <TableCell className="py-4">
                        {expandedMonths.has(month.monthKey) ? (
                          <ChevronDown className="h-4 w-4 text-primary animate-in fade-in duration-300" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </TableCell>
                      <TableCell className="font-bold py-4">
                        {formatMonthLabel(month.monthKey)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-bold py-4">
                        {currency}{month.totalExpense.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      {users.map((user) => {
                        const stat = month.userStats.find((s) => s.userId === user.id)
                        return (
                          <TableCell
                            key={`${month.monthKey}-${user.id}-paid`}
                            className="text-right tabular-nums py-4"
                          >
                            {currency}{(stat?.paid || 0).toLocaleString("en-IN", {
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
                              "text-right tabular-nums font-bold py-4",
                              balance > 0
                                ? "text-emerald-500"
                                : balance < 0
                                ? "text-red-500"
                                : "text-muted-foreground"
                            )}
                          >
                            {currency}{Math.abs(balance).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                    {expandedMonths.has(month.monthKey) && (
                      <TableRow className="bg-muted/10 border-none">
                        <TableCell colSpan={3 + users.length * 2} className="p-0">
                          <div className="p-4 lg:p-6 bg-muted/5 animate-in slide-in-from-top-2 duration-300">
                            <h4 className="text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-primary" />
                              Detailed Daily Records
                            </h4>
                            <div className="rounded-2xl border border-border/50 overflow-hidden shadow-inner">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-background/50 hover:bg-background/50 border-none">
                                    <TableHead className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</TableHead>
                                    <TableHead className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</TableHead>
                                      <TableHead key={u.id} className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[100px] max-w-[120px]">
                                        <UserLabel 
                                          name={u.name} 
                                          isMe={u.linked_user_id === currentUserId} 
                                          className="text-[10px]" 
                                        />
                                      </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {month.entries.map(entry => (
                                    <TableRow key={entry.id} className="hover:bg-primary/5 border-b border-border/20 last:border-none">
                                      <TableCell className="py-3 px-4 text-sm font-medium">{formatDate(entry.date)}</TableCell>
                                      <TableCell className="py-3 px-4 text-right tabular-nums text-sm font-bold">{currency}{entry.totalExpense.toLocaleString()}</TableCell>
                                      {users.map(user => {
                                        const detail = entry.userDetails.find(d => d.userId === user.id)
                                        return (
                                          <TableCell key={user.id} className="py-3 px-4 text-center">
                                            {detail?.isPresent ? (
                                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-tight">
                                                <Check className="h-2.5 w-2.5" />
                                                Present
                                              </div>
                                            ) : (
                                              <span className="text-muted-foreground/30 text-[10px] font-bold">-</span>
                                            )}
                                          </TableCell>
                                        )
                                      })}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
