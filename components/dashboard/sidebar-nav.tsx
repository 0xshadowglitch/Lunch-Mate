"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  PieChart,
  FileText,
  User,
  Calendar,
  CalendarDays,
  Utensils,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const adminNavItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Lunch Tracker",
    href: "/admin/lunch",
    icon: Utensils,
  },
  {
    title: "Weekly Summary",
    href: "/admin/weekly",
    icon: Calendar,
  },
  {
    title: "Monthly Summary",
    href: "/admin/monthly",
    icon: CalendarDays,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Trends",
    href: "/admin/trends",
    icon: TrendingUp,
  },
  {
    title: "Analysis",
    href: "/admin/analysis",
    icon: PieChart,
  },
  {
    title: "Audit",
    href: "/admin/audit",
    icon: FileText,
  },
]

const userNavItems = [
  {
    title: "My Dashboard",
    href: "/user",
    icon: User,
  },
]

interface SidebarNavProps {
  isAdmin?: boolean
}

export function SidebarNav({ isAdmin = true }: SidebarNavProps) {
  const pathname = usePathname()
  const navItems = isAdmin ? adminNavItems : userNavItems

  return (
    <div suppressHydrationWarning className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <h1 className="text-lg font-bold text-primary">
          Lunch Tracker
        </h1>
        <ThemeToggle />
      </div>
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <Link
          href={isAdmin ? "/user" : "/admin"}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          {isAdmin ? <User className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
          {isAdmin ? "Switch to User View" : "Switch to Admin View"}
        </Link>
      </div>
    </div>
  )
}
