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
  Trash2,
  Loader2,
  AlertTriangle,
  Mail,
  Building2,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { getUserOrg, getUserOrgs, setActiveOrg, deleteOrganization } from "@/lib/org-actions"
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
import { Badge } from "@/components/ui/badge"
import { Check, ChevronDown } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

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

  const handleDeleteTeam = async (e: React.MouseEvent, orgId: string) => {
    e.stopPropagation()
    setDeleteConfirmId(orgId)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmId) return
    startTransition(async () => {
      const result = await deleteOrganization(deleteConfirmId)
      if (result.success) {
        window.location.reload()
      } else {
        alert(result.error || "Failed to delete team")
      }
      setDeleteConfirmId(null)
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
                Switch Organization
                <Badge variant="outline" className="text-[9px] border-primary/20 text-primary/80 h-4 px-1.5">{allOrgs.length}</Badge>
              </DropdownMenuLabel>
            </div>
            <DropdownMenuSeparator className="bg-border/50 mx-2" />
            <div className="max-h-[300px] overflow-y-auto">
              {allOrgs.map((o) => (
                <DropdownMenuItem
                  key={o.id}
                  onClick={() => handleSwitchTeam(o.id)}
                  className="flex items-center gap-3 cursor-pointer py-3 px-3 group/item overflow-hidden"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                    {o.id === org?.id ? (
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/20 shrink-0" />
                    )}
                    <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
                      <div className="overflow-hidden whitespace-nowrap">
                        <span className={cn(
                          "inline-block font-black text-xs uppercase tracking-wider transition-all",
                          o.id === org?.id ? "text-primary" : "text-foreground/90",
                          o.name.length > 20 && "animate-marquee-slow hover:pause"
                        )}>
                          {o.name}
                          {o.name.length > 20 && <span className="ml-8">{o.name}</span>}
                        </span>
                      </div>
                      <span className="text-[8px] text-muted-foreground/60 uppercase font-black tracking-[0.1em]">{o.role === 'admin' ? "👑 Manager" : "👤 Member"}</span>
                    </div>
                  </div>
                  
                  <div className="shrink-0 ml-auto flex items-center gap-2">
                    {o.id === org?.id && <Check className="h-4 w-4 text-primary" />}
                    {o.role === 'admin' && (
                      <button
                        onClick={(e) => handleDeleteTeam(e, o.id)}
                        className="shrink-0 p-1.5 hover:bg-destructive/20 hover:text-destructive rounded-lg transition-all text-muted-foreground/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/onboarding" className="flex items-center gap-2 text-primary focus:text-primary cursor-pointer py-2.5">
                <PlusCircle className="h-4 w-4" />
                <span className="font-bold text-xs uppercase tracking-tight">Create New Organization</span>
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
      </nav>

      {/* Persistent Management Section */}
      <div className="border-t border-border/50 p-4 space-y-1">
        <h3 className="px-3 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Navigator</h3>
        <Link
          href="/teams"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-black uppercase tracking-wider transition-all",
            pathname === "/teams"
              ? "bg-primary text-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Building2 className="h-4 w-4" />
          My Organizations
        </Link>
        <Link
          href="/invite"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-black uppercase tracking-wider transition-all",
            pathname === "/invite"
              ? "bg-primary text-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Mail className="h-4 w-4" />
          Join / Invites
        </Link>
        <Link
          href="/onboarding"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/onboarding"
              ? "bg-primary text-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <PlusCircle className="h-4 w-4" />
          Create New Team
        </Link>
        
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
      </div>

      <div className="border-t border-sidebar-border p-4 space-y-2">
        <Link
          href={isAdmin ? "/user" : "/admin"}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] group"
        >
          {isAdmin ? <User className="h-4 w-4 group-hover:scale-110 transition-transform" /> : <ShieldCheck className="h-4 w-4 group-hover:scale-110 transition-transform" />}
          {isAdmin ? "👤 Personal Dashboard" : "👑 Admin Panel"}
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="max-w-[340px] rounded-3xl border-border/40 backdrop-blur-2xl">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-black uppercase tracking-tight">Delete Team?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium leading-relaxed">
              This will permanently delete the team and all its lunch tracking data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <AlertDialogAction
              onClick={confirmDelete}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 h-12 rounded-xl font-black uppercase tracking-widest text-xs"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Delete"}
            </AlertDialogAction>
            <AlertDialogCancel className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs border-2">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
