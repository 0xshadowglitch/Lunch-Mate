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
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate, getDayName } from "@/lib/date-utils"

type UserDetail = {
  userId: string
  userName: string
  isPresent: boolean
  share: number
  paid: number
  balance: number
}

type EntryData = {
  id: string
  date: string
  totalExpense: number
  userDetails: UserDetail[]
}

import { AddEntryDialog } from "./add-entry-dialog"
import { UserLabel } from "./user-label"

interface DailyLunchTrackerProps {
  entries: EntryData[]
  users: { id: string; name: string; linked_user_id?: string | null }[]
  currency?: string
  currentUserId?: string
}

export function DailyLunchTracker({ entries, users, currency, currentUserId }: DailyLunchTrackerProps) {
  return (
    <Card>
      <CardHeader className="pb-3 px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            Daily Lunch Tracker
            <Badge variant="secondary" className="font-normal">
              {entries.length} entries
            </Badge>
          </CardTitle>
          <AddEntryDialog users={users} currency={currency} currentUserId={currentUserId} />
        </div>
      </CardHeader>
      <CardContent className="mb-8">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/10 hover:bg-primary/10">
                <TableHead className="font-semibold text-primary">Date</TableHead>
                <TableHead className="font-semibold text-primary">Day</TableHead>
                <TableHead className="text-right font-semibold text-primary">
                  Total Expense
                </TableHead>
                {users.map((user) => (
                  <TableHead
                    key={`${user.id}-present`}
                    className="text-center font-semibold text-primary min-w-[100px] max-w-[120px]"
                  >
                    <UserLabel 
                      name={user.name} 
                      isMe={user.linked_user_id === currentUserId} 
                      suffix="Atten"
                      className="text-[10px]" 
                    />
                  </TableHead>
                ))}
                {users.map((user) => (
                  <TableHead
                    key={`${user.id}-share`}
                    className="text-right font-semibold text-primary min-w-[100px] max-w-[120px]"
                  >
                    <UserLabel 
                      name={user.name} 
                      isMe={user.linked_user_id === currentUserId} 
                      suffix="Share"
                      className="text-[10px] text-right" 
                    />
                  </TableHead>
                ))}
                {users.map((user) => (
                  <TableHead
                    key={`${user.id}-paid`}
                    className="text-right font-semibold text-primary min-w-[100px] max-w-[120px]"
                  >
                    <UserLabel 
                      name={user.name} 
                      isMe={user.linked_user_id === currentUserId} 
                      suffix="Paid"
                      className="text-[10px] text-right" 
                    />
                  </TableHead>
                ))}
                {users.map((user) => (
                  <TableHead
                    key={`${user.id}-bal`}
                    className="text-right font-semibold text-primary min-w-[100px] max-w-[120px]"
                  >
                    <UserLabel 
                      name={user.name} 
                      isMe={user.linked_user_id === currentUserId} 
                      suffix="Bal"
                      className="text-[10px] text-right" 
                    />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3 + users.length * 4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No entries found
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDate(entry.date)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getDayName(entry.date)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {currency}{entry.totalExpense.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    {users.map((user) => {
                      const detail = entry.userDetails.find((d) => d.userId === user.id)
                      return (
                        <TableCell
                          key={`${entry.id}-${user.id}-present`}
                          className="text-center"
                        >
                          {detail?.isPresent ? (
                            <div className="flex justify-center">
                              <div className="rounded bg-primary/20 p-1">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                          ) : null}
                        </TableCell>
                      )
                    })}
                    {users.map((user) => {
                      const detail = entry.userDetails.find((d) => d.userId === user.id)
                      return (
                        <TableCell
                          key={`${entry.id}-${user.id}-share`}
                          className="text-right tabular-nums"
                        >
                          {currency}{(detail?.share || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      )
                    })}
                    {users.map((user) => {
                      const detail = entry.userDetails.find((d) => d.userId === user.id)
                      return (
                        <TableCell
                          key={`${entry.id}-${user.id}-paid`}
                          className="text-right tabular-nums"
                        >
                          {currency}{(detail?.paid || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      )
                    })}
                    {users.map((user) => {
                      const detail = entry.userDetails.find((d) => d.userId === user.id)
                      const balance = detail?.balance || 0
                      return (
                        <TableCell
                          key={`${entry.id}-${user.id}-bal`}
                          className={cn(
                            "text-right tabular-nums font-medium",
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
