"use client"

import Link from "next/link"
import Image from "next/image"
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
  LogOut,
  Settings,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { getUserOrg } from "@/lib/org-actions"
import { signOut } from "@/lib/auth-actions"
import { useEffect, useState } from "react"

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
  const [org, setOrg] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    getUserOrg().then(setOrg)
  }, [])

  const navItems = isAdmin ? adminNavItems : userNavItems

  return (
    <div suppressHydrationWarning className="flex h-full w-64 flex-col border-r border-border/50 bg-sidebar/50 backdrop-blur-2xl">
      <div className="flex h-20 items-center justify-between border-b border-border/50 px-6 bg-foreground/[0.02]">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 bg-primary/20 p-2.5 rounded-2xl border border-primary/30 shadow-[0_0_20px_var(--glow-emerald)] transition-all hover:scale-105">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="object-contain hover:rotate-6 transition-transform duration-300"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-foreground leading-tight tracking-wider uppercase">
              Lunch Mate
            </h1>
            {org && (
              <span className="text-[10px] text-primary/80 uppercase tracking-widest font-bold">
                {org.name}
              </span>
            )}
          </div>
        </div>
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
        {isAdmin && org?.role === 'admin' && (
          <Link
            href="/admin/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/admin/settings"
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            Team Settings
          </Link>
        )}
      </nav>
      <div className="border-t border-sidebar-border p-4 space-y-2">
        <Link
          href={isAdmin ? "/user" : "/admin"}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          {isAdmin ? <User className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
          {isAdmin ? "Switch to User View" : "Switch to Admin View"}
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
