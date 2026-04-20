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
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle } from "lucide-react"

interface AuditEntry {
  id: string
  date: string
  totalExpense: number
  totalShares: number
  totalPayments: number
  issues: string[]
}

interface DataAuditTableProps {
  entries: AuditEntry[]
  currency?: string
}

export function DataAuditTable({ entries, currency }: DataAuditTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Data Audit
          <Badge variant="secondary">{entries.length} entries</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center">Total Expense</TableHead>
              <TableHead className="text-center">Total Shares</TableHead>
              <TableHead className="text-center">Total Paid</TableHead>
              <TableHead className="text-center">Issues</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const hasIssues = entry.issues.length > 0
              return (
                <TableRow
                  key={entry.id}
                  className={cn(hasIssues && "bg-destructive/5")}
                >
                  <TableCell className="text-center">
                    {new Date(entry.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center",
                      entry.totalExpense === 0 && "text-red-500"
                    )}
                  >
                    {currency} {entry.totalExpense.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {currency} {entry.totalShares.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center",
                      entry.totalPayments === 0 &&
                        entry.totalExpense > 0 &&
                        "text-red-500"
                    )}
                  >
                    {currency} {entry.totalPayments.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {hasIssues ? (
                      <div className="flex items-center justify-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-500">
                          {entry.issues.join(", ")}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm text-muted-foreground">
                          No issues
                        </span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {entries.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  No entries to audit.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
