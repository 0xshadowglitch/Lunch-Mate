"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts"
import { cn } from "@/lib/utils"
import type { User, UserBalance, LunchEntry } from "@/lib/store"

interface UserDashboardProps {
  users: User[]
  balances: UserBalance[]
  entries: LunchEntry[]
  selectedUserId: string
  onUserChange: (userId: string) => void
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]

export function UserDashboard({
  users,
  balances,
  entries,
  selectedUserId,
  onUserChange,
}: UserDashboardProps) {
  const selectedBalance = balances.find((b) => b.userId === selectedUserId)
  
  // Get recent activity for selected user
  const recentActivity = entries
    .slice(-5)
    .reverse()
    .map((entry) => ({
      date: entry.date,
      totalExpense: entry.totalExpense,
      share: entry.shares[selectedUserId] || 0,
      paid: entry.paid[selectedUserId] || 0,
    }))

  // Expense distribution pie data
  const expenseDistribution = balances.map((b) => ({
    name: b.name,
    value: b.totalShares,
  }))

  // Balance bar chart data
  const balanceData = balances.map((b) => ({
    name: b.name,
    balance: b.currentBalance,
  }))

  return (
    <div className="space-y-6">
      {/* User Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select User</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedUserId} onValueChange={onUserChange}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* My Balance */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                (selectedBalance?.currentBalance || 0) > 0
                  ? "text-emerald-500"
                  : (selectedBalance?.currentBalance || 0) < 0
                  ? "text-red-500"
                  : "text-card-foreground"
              )}
            >
              {(selectedBalance?.currentBalance || 0) >= 0 ? "+" : ""}₹
              {(selectedBalance?.currentBalance || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              ₹{(selectedBalance?.totalPaid || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Shares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              ₹{(selectedBalance?.totalShares || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Days Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {selectedBalance?.daysPresent || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Balance Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>All Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={balanceData} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => `₹${v}`} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`₹${value}`, "Balance"]}
                  />
                  <Bar
                    dataKey="balance"
                    fill="hsl(var(--chart-1))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {expenseDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`₹${value}`, "Shares"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total Expense</TableHead>
                <TableHead className="text-right">Your Share</TableHead>
                <TableHead className="text-right">You Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(activity.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{activity.totalExpense.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{activity.share.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right",
                      activity.paid > 0 ? "text-emerald-500 font-medium" : ""
                    )}
                  >
                    ₹{activity.paid.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {recentActivity.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    No recent activity found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
