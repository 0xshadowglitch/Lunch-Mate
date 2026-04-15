"use client"

import { useState, useEffect } from "react"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { SpendingTrendChart } from "@/components/dashboard/spending-trend-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSpendingTrend, getLunchEntries } from "@/lib/store"

export default function TrendsPage() {
  const [spendingTrend, setSpendingTrend] = useState(getSpendingTrend())
  const [avgExpense, setAvgExpense] = useState(0)
  const [maxExpense, setMaxExpense] = useState(0)
  const [minExpense, setMinExpense] = useState(0)

  useEffect(() => {
    const trend = getSpendingTrend()
    setSpendingTrend(trend)

    if (trend.length > 0) {
      const expenses = trend.map((t) => t.expense)
      setAvgExpense(Math.round(expenses.reduce((a, b) => a + b, 0) / expenses.length))
      setMaxExpense(Math.max(...expenses))
      setMinExpense(Math.min(...expenses))
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <TopNavbar title="Spending Trends" />
      <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-auto">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{avgExpense.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Highest Expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                ₹{maxExpense.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lowest Expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                ₹{minExpense.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
        <SpendingTrendChart data={spendingTrend} />
      </div>
    </div>
  )
}
