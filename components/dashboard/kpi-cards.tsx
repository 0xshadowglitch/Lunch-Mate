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
    <div suppressHydrationWarning className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="relative group overflow-hidden border-white/[0.03]">
              {/* Corner Glow */}
              <div className={cn(
                "absolute -top-12 -right-12 w-24 h-24 blur-3xl rounded-full transition-opacity group-hover:opacity-100 opacity-50",
                card.trend === "positive" ? "bg-emerald-500/20" : 
                card.trend === "negative" ? "bg-red-500/10" : "bg-primary/10"
              )} />

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                  {card.title}
                </CardTitle>
                <div className={cn(
                  "p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]",
                  card.trend === "positive" ? "text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : 
                  card.trend === "negative" ? "text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "text-primary"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pb-8">
                <div
                  className={cn(
                    "text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent",
                    card.trend === "positive" && "from-emerald-400 to-emerald-600",
                    card.trend === "negative" && "from-red-400 to-red-600"
                  )}
                >
                  {card.value}
                </div>
                {card.trend && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full animate-pulse",
                      card.trend === "positive" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                    )} />
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      card.trend === "positive" ? "text-emerald-500/90" : "text-red-500/90"
                    )}>
                      {card.trend === "positive" ? "Healthy Credit" : "Needs Payment"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
    </div>
  )
}
