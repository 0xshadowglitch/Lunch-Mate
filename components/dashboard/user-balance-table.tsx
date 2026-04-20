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
import type { UserBalance } from "@/lib/actions"

import { UserLabel } from "./user-label"

interface UserBalanceTableProps {
  balances: UserBalance[]
  currency?: string
  currentUserId?: string
}

export function UserBalanceTable({ balances, currency, currentUserId }: UserBalanceTableProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pt-8 px-8 pb-4">
        <CardTitle className="text-lg font-black tracking-tight uppercase">Financial Overview</CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5 hover:bg-primary/5 border-none">
              <TableHead className="py-4 px-4 text-center font-black text-primary uppercase text-[10px] tracking-widest">User</TableHead>
              <TableHead className="py-4 px-4 text-center font-black text-primary uppercase text-[10px] tracking-widest">Total Paid</TableHead>
              <TableHead className="py-4 px-4 text-center font-black text-primary uppercase text-[10px] tracking-widest">Total Shares</TableHead>
              <TableHead className="py-4 px-4 text-center font-black text-primary uppercase text-[10px] tracking-widest">Current Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {balances.map((balance) => (
              <TableRow key={balance.id} className="hover:bg-muted/40 transition-colors border-b border-border/30 last:border-none">
                <TableCell className="py-5 px-4 text-center font-bold text-sm tracking-tight max-w-[150px]">
                  <div className="flex justify-center">
                    <UserLabel 
                      name={balance.name} 
                      isMe={balance.linked_user_id === currentUserId} 
                      className="text-sm"
                    />
                  </div>
                </TableCell>
                <TableCell className="py-5 px-4 text-center tabular-nums text-sm font-medium">
                  {currency} {balance.totalPaid.toLocaleString()}
                </TableCell>
                <TableCell className="py-5 px-4 text-center tabular-nums text-sm font-medium">
                  {currency} {balance.totalShares.toLocaleString()}
                </TableCell>
                <TableCell
                  className={cn(
                    "py-5 px-4 text-center tabular-nums text-sm font-black",
                    balance.balance > 0
                      ? "text-emerald-500"
                      : balance.balance < 0
                      ? "text-red-500"
                      : "text-muted-foreground"
                  )}
                >
                  {balance.balance >= 0 ? "+" : ""}{currency} {balance.balance.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

  )
}
