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

interface UserBalanceTableProps {
  balances: UserBalance[]
}

export function UserBalanceTable({ balances }: UserBalanceTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Total Paid</TableHead>
              <TableHead className="text-right">Total Shares</TableHead>
              <TableHead className="text-right">Current Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {balances.map((balance) => (
              <TableRow key={balance.id}>
                <TableCell className="font-medium">{balance.name}</TableCell>
                <TableCell className="text-right">
                  ₹{balance.totalPaid.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  ₹{balance.totalShares.toLocaleString()}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold",
                    balance.balance > 0
                      ? "text-emerald-500"
                      : balance.balance < 0
                      ? "text-red-500"
                      : "text-muted-foreground"
                  )}
                >
                  {balance.balance >= 0 ? "+" : ""}₹
                  {balance.balance.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
