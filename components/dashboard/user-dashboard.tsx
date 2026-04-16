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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { LunchUser, UserBalance, EntryWithDetails } from "@/lib/actions"
import { formatDate } from "@/lib/date-utils"
import { WeeklySummary } from "./weekly-summary"
import { MonthlySummary } from "./monthly-summary"
import { LayoutDashboard, CalendarDays, CalendarRange } from "lucide-react"

interface UserDashboardProps {
  users: LunchUser[]
  balances: UserBalance[]
  entries: EntryWithDetails[]
  weeklyData: any
  monthlyData: any
  selectedUserId: string
  onUserChange: (userId: string) => void
}

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

export function UserDashboard({
  users,
  balances,
  entries,
  weeklyData,
  monthlyData,
  selectedUserId,
  onUserChange,
}: UserDashboardProps) {
  const selectedBalance = balances.find((b) => b.id === selectedUserId)
  
  // Get recent activity for selected user
  const recentActivity = entries
    .slice(0, 5)
    .map((entry) => {
      const share = entry.shares.find((s) => s.user_id === selectedUserId)
      const payment = entry.payments.find((p) => p.user_id === selectedUserId)
      return {
        date: entry.date,
        totalExpense: entry.total_expense,
        share: share?.share_amount || 0,
        paid: payment?.paid_amount || 0,
      }
    })

  // Expense distribution pie data
  const expenseDistribution = balances.map((b) => ({
    name: b.name,
    value: b.totalShares,
  }))

  // Balance bar chart data
  const balanceData = balances.map((b) => ({
    name: b.name,
    balance: b.balance,
  }))

  return (
    <div suppressHydrationWarning className="space-y-8">
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-card/50 backdrop-blur-md border border-border/50 p-1.5 h-14 rounded-2xl shadow-lg">
          <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-3 px-6 transition-all">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="weekly" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-3 px-6 transition-all">
            <CalendarDays className="h-4 w-4" />
            Weekly Summary
          </TabsTrigger>
          <TabsTrigger value="monthly" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-3 px-6 transition-all">
            <CalendarRange className="h-4 w-4" />
            Monthly Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
          {/* User Selector */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Select User Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedUserId} onValueChange={onUserChange}>
                <SelectTrigger className="w-full max-w-xs bg-background/50">
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden relative group">
              <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/20" />
              <CardHeader className="pb-3 pt-6 px-6">
                <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div
                  className={cn(
                    "text-3xl font-black tabular-nums",
                    (selectedBalance?.balance || 0) > 0
                      ? "text-emerald-500"
                      : (selectedBalance?.balance || 0) < 0
                      ? "text-red-500"
                      : "text-card-foreground"
                  )}
                >
                  {(selectedBalance?.balance || 0) >= 0 ? "+" : ""}₹
                  {(selectedBalance?.balance || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-3 pt-6 px-6">
                <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                  Total Paid
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-3xl font-black tabular-nums text-card-foreground">
                  ₹{(selectedBalance?.totalPaid || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-3 pt-6 px-6">
                <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                  Total Shares
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-3xl font-black tabular-nums text-card-foreground">
                  ₹{(selectedBalance?.totalShares || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-3 pt-6 px-6">
                <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                  Days Present
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-3xl font-black tabular-nums text-card-foreground">
                  {selectedBalance?.daysPresent || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Balance Bar Chart */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-bold">Team Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={balanceData} layout="vertical">
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                        tickFormatter={(v) => `₹${v}`}
                        stroke="var(--color-border)"
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={80}
                        tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                        stroke="var(--color-border)"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "16px",
                          backdropFilter: "blur(12px)",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        }}
                        itemStyle={{ fontWeight: "700", fontSize: "12px", color: "var(--color-chart-1)" }}
                        labelStyle={{ color: "var(--color-foreground)", marginBottom: "4px", fontSize: "14px", fontWeight: "900" }}
                        formatter={(value: number) => [`₹${value}`, "Balance"]}
                        cursor={{ fill: 'var(--color-primary)', opacity: 0.05 }}
                      />
                      <Bar
                        dataKey="balance"
                        fill="var(--color-chart-1)"
                        radius={[0, 6, 6, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Expense Distribution Pie */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-bold">Expense Sharing</CardTitle>
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
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {expenseDistribution.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            className="hover:opacity-80 transition-opacity outline-none"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "16px",
                          backdropFilter: "blur(12px)",
                        }}
                        itemStyle={{ fontWeight: "700", fontSize: "12px" }}
                        labelStyle={{ color: "var(--color-foreground)", marginBottom: "4px", fontSize: "14px", fontWeight: "900" }}
                        formatter={(value: number) => [`₹${value}`, "Total Shares"]}
                      />
                      <Legend 
                        iconType="circle" 
                        formatter={(value) => <span className="text-xs font-bold text-muted-foreground">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
            <CardHeader className="px-6 py-5">
              <CardTitle className="text-base font-bold">My Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5 hover:bg-primary/5 border-none">
                    <TableHead className="py-4 px-6 font-bold text-primary">Date</TableHead>
                    <TableHead className="py-4 px-6 text-right font-bold text-primary">Total Expense</TableHead>
                    <TableHead className="py-4 px-6 text-right font-bold text-primary">Your Share</TableHead>
                    <TableHead className="py-4 px-6 text-right font-bold text-primary">You Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((activity, index) => (
                    <TableRow key={index} className="hover:bg-muted/40 transition-colors border-b border-border/30 last:border-none">
                      <TableCell className="py-4 px-6 font-bold text-sm">
                        {formatDate(activity.date)}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right tabular-nums text-sm font-medium">
                        ₹{activity.totalExpense.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right tabular-nums text-sm font-medium">
                        ₹{activity.share.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "py-4 px-6 text-right tabular-nums text-sm font-black",
                          activity.paid > 0 ? "text-emerald-500" : "text-muted-foreground"
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
                        className="text-center text-muted-foreground py-12"
                      >
                        No recent activity found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="animate-in fade-in slide-in-from-bottom-4 duration-500 focus-visible:outline-none">
          <WeeklySummary 
            weeks={weeklyData.weeks} 
            users={weeklyData.users} 
            overallBalances={weeklyData.overallBalances} 
          />
        </TabsContent>

        <TabsContent value="monthly" className="animate-in fade-in slide-in-from-bottom-4 duration-500 focus-visible:outline-none">
          <MonthlySummary 
            months={monthlyData.months} 
            users={monthlyData.users} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
