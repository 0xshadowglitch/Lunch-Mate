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
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {onMonthChange && (
          <Select defaultValue={currentMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>
    </header>
  )
}
