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
  PlusCircle,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { getUserOrg, getUserOrgs, setActiveOrg } from "@/lib/org-actions"
import { signOut } from "@/lib/auth-actions"
import { useEffect, useState, useTransition } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Check, ChevronDown } from "lucide-react"

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
  const [org, setOrg] = useState<{ id: string; name: string; role: string } | null>(null)
  const [allOrgs, setAllOrgs] = useState<any[]>([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    Promise.all([getUserOrg(), getUserOrgs()]).then(([active, all]) => {
      setOrg(active as any)
      setAllOrgs(all)
    })
  }, [])

  const handleSwitchTeam = async (orgId: string) => {
    if (orgId === org?.id) return
    startTransition(async () => {
      await setActiveOrg(orgId)
      window.location.reload()
    })
  }

  const navItems = isAdmin ? adminNavItems : userNavItems

  return (
    <div suppressHydrationWarning className="flex h-full w-64 flex-col border-r border-border/50 bg-sidebar/50 backdrop-blur-2xl">
      <div className="flex h-20 items-center justify-between border-b border-border/50 px-4 bg-foreground/[0.02]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 group hover:bg-foreground/[0.03] p-1.5 rounded-xl transition-all flex-1 min-w-0">
              <div className="flex-shrink-0 bg-primary/20 p-2 rounded-xl border border-primary/30 shadow-[0_0_15px_var(--glow-emerald)] group-hover:scale-105 transition-all">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col text-left truncate flex-1 pr-1">
                <h1 className="text-[11px] font-black text-foreground leading-none tracking-wider uppercase truncate">
                  {org?.name || "Lunch Mate"}
                </h1>
                <span className="text-[9px] text-primary/80 uppercase tracking-widest font-bold mt-1">
                  Active Team
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-card/95 backdrop-blur-xl border-border shadow-2xl !opacity-100 ring-1 ring-white/5" align="start" sideOffset={8}>
            <div className="p-2 pb-0">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-black px-2 py-1.5 flex items-center justify-between">
                My Teams
                <Badge variant="outline" className="text-[9px] border-primary/20 text-primary/80 h-4 px-1.5">{allOrgs.length}</Badge>
              </DropdownMenuLabel>
            </div>
            <DropdownMenuSeparator className="bg-border/50 mx-2" />
            {allOrgs.map((o) => (
              <DropdownMenuItem
                key={o.id}
                onClick={() => handleSwitchTeam(o.id)}
                className="flex items-center justify-between cursor-pointer py-2.5"
              >
                <div className="flex flex-col">
                  <span className={cn("font-bold text-sm", o.id === org?.id && "text-primary")}>{o.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">{o.role}</span>
                </div>
                {o.id === org?.id && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/onboarding" className="flex items-center gap-2 text-primary focus:text-primary cursor-pointer py-2.5">
                <PlusCircle className="h-4 w-4" />
                <span className="font-bold text-xs uppercase tracking-tight">Create New Team</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex-shrink-0">
          <ThemeToggle />
        </div>
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
        {isAdmin && (
          <Link
            href="/onboarding"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-black uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all hover:scale-[1.02] mt-4 shadow-lg shadow-primary/5"
          >
            <PlusCircle className="h-4 w-4" />
            Create New Team
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
