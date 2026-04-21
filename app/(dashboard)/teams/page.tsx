import { TopNavbar } from "@/components/dashboard/top-navbar"
import { getUserOrgs } from "@/lib/org-actions"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, User } from "lucide-react"
import Link from "next/link"
import { TeamCard } from "@/components/dashboard/team-card"

export default async function TeamsPage() {
  // Fetch the organizations for the user
  const allOrgs = await getUserOrgs()
  
  const adminOrgs = allOrgs.filter(org => org.role === 'admin')
  const memberOrgs = allOrgs.filter(org => org.role !== 'admin')
  
  return (
    <div className="flex flex-col h-full bg-background/50">
      <TopNavbar title="Organizations" />
      <div className="flex-1 p-6 lg:p-10 pb-24 overflow-auto max-w-4xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Teams Navigator</h2>
            <p className="text-muted-foreground text-sm font-medium">Manage and switch between your lunch tracking environments.</p>
          </div>
          <Button asChild className="w-full sm:w-auto h-14 rounded-xl font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all active:scale-95">
            <Link href="/onboarding">Create New Team</Link>
          </Button>
        </div>

        <div className="space-y-12">
          {/* Managed Teams Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/70">Organizations I Manage</h3>
            </div>
            <div className="grid gap-4">
              {adminOrgs.length === 0 ? (
                <p className="text-xs font-medium text-muted-foreground/60 px-1 italic">You aren't an admin of any teams yet.</p>
              ) : (
                adminOrgs.map((org) => (
                  <TeamCard key={org.id} org={org} />
                ))
              )}
            </div>
          </section>

          {/* Joined Teams Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <User className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/70">Joined Teams</h3>
            </div>
            <div className="grid gap-4">
              {memberOrgs.length === 0 ? (
                <p className="text-xs font-medium text-muted-foreground/60 px-1 italic">You haven't joined any other teams as a member.</p>
              ) : (
                memberOrgs.map((org) => (
                  <TeamCard key={org.id} org={org} />
                ))
              )}
            </div>
          </section>
        </div>
        
        <div className="mt-12 p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-blue-500/5 border border-primary/10 relative overflow-hidden backdrop-blur-sm">
          <div className="relative z-10 space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Incoming Invites?
            </h3>
            <p className="text-sm font-medium text-muted-foreground max-w-md">
              Invitations in Lunch Mate are processed through shared links. If you received a link via email or message, simply click it while logged in to join the team automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
