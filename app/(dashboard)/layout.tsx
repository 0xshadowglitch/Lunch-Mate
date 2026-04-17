"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
        <div className="hidden lg:block shrink-0 h-full">
          <SidebarNav isAdmin={isAdminView} />
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Persistent Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarNav isAdmin={isAdminView} />
      </div>

      {/* Main Content Area - Only the content inside here changes when navigating */}
      <main className="flex-1 overflow-auto bg-background/30 backdrop-blur-3xl relative">
        {/* Mobile Sidebar Toggle (Visible only on mobile) */}
        {!loading && user && (
          <div className="lg:hidden absolute top-4 left-4 z-30">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 bg-card border border-border rounded-xl shadow-lg"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
