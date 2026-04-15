"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingDown, TrendingUp, Receipt } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardsProps {
  totalExpense: number
  totalPaid: number
  netBalance: number
  totalEntries: number
}

export function KPICards({
  totalExpense,
  totalPaid,
  netBalance,
  totalEntries,
}: KPICardsProps) {
  const cards = [
    {
      title: "Total Expense",
      value: `₹${totalExpense.toLocaleString()}`,
      icon: Receipt,
      trend: null,
    },
    {
      title: "Total Paid",
      value: `₹${totalPaid.toLocaleString()}`,
      icon: DollarSign,
      trend: null,
    },
    {
      title: "Net Balance",
      value: `₹${Math.abs(netBalance).toLocaleString()}`,
      icon: netBalance >= 0 ? TrendingUp : TrendingDown,
      trend: netBalance >= 0 ? "positive" : "negative",
    },
    {
      title: "Total Entries",
      value: totalEntries.toString(),
      icon: Receipt,
      trend: null,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon
                className={cn(
                  "h-4 w-4",
                  card.trend === "positive"
                    ? "text-emerald-500"
                    : card.trend === "negative"
                    ? "text-red-500"
                    : "text-muted-foreground"
                )}
              />
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "text-2xl font-bold",
                  card.trend === "positive"
                    ? "text-emerald-500"
                    : card.trend === "negative"
                    ? "text-red-500"
                    : "text-card-foreground"
                )}
              >
                {card.value}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
