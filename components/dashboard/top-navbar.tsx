"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, Menu } from "lucide-react"

interface TopNavbarProps {
  title: string
  onMonthChange?: (month: string) => void
  onExport?: () => void
  onMenuClick?: () => void
}

export function TopNavbar({
  title,
  onMonthChange,
  onExport,
  onMenuClick,
}: TopNavbarProps) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const currentMonth = new Date().toLocaleString("default", { month: "long" })

  return (
    <header suppressHydrationWarning className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border/50 bg-background/60 backdrop-blur-xl px-6 lg:px-10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-foreground/5"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-bold tracking-tight text-foreground/90 uppercase">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {onMonthChange && (
          <Select defaultValue={currentMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="w-36 bg-background/50 border-border/50 backdrop-blur-sm shadow-sm hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-md border-border/50">
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="border-border/50 hover:bg-foreground/5 bg-background/50 shadow-sm transition-all hover:scale-105">
            <Download className="mr-2 h-4 w-4 text-primary" />
            Export CSV
          </Button>
        )}
      </div>
    </header>
  )
}
