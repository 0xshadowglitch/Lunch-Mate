"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar"

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { isOpen, setIsOpen } = useSidebar()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Use the URL to decide if we show Admin or User links in the persistent sidebar
  const isAdminView = pathname.startsWith("/admin")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  // Public/Onboarding views for invitations don't get the sidebar if logged out
  const isPublicInvite = pathname === "/invite" && !user && !loading
  
  if (isPublicInvite) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Decorative Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        <main className="relative z-10">{children}</main>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen bg-background text-foreground overflow-hidden">
      {/* Shared Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] -z-10 animate-pulse delay-1000" />
      
      {/* Persistent Desktop Sidebar */}
      {!loading && user && (
        <div className="hidden lg:block shrink-0 h-full border-r border-border/50">
          <SidebarNav isAdmin={isAdminView} />
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Persistent Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarNav isAdmin={isAdminView} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-background/30 backdrop-blur-3xl relative">
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  )
}
