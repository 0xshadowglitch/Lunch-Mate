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
import { AlertCircle } from "lucide-react"

interface AuditEntry {
  id: string
  date: string
  totalExpense: number
  shares: Record<string, number>
  paid: Record<string, number>
  issues: string[]
  hasIssues: boolean
}

interface DataAuditTableProps {
  entries: AuditEntry[]
}

export function DataAuditTable({ entries }: DataAuditTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Data Audit
          <Badge variant="secondary">{entries.length} entries</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total Expense</TableHead>
              <TableHead className="text-right">Total Paid</TableHead>
              <TableHead>Issues</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const totalPaid = Object.values(entry.paid).reduce(
                (a, b) => a + b,
                0
              )
              return (
                <TableRow
                  key={entry.id}
                  className={cn(entry.hasIssues && "bg-destructive/5")}
                >
                  <TableCell>
                    {new Date(entry.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right",
                      entry.totalExpense === 0 && "text-red-500"
                    )}
                  >
                    ₹{entry.totalExpense.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right",
                      totalPaid === 0 &&
                        entry.totalExpense > 0 &&
                        "text-red-500"
                    )}
                  >
                    ₹{totalPaid.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {entry.hasIssues ? (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-500">
                          {entry.issues.join(", ")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No issues
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
