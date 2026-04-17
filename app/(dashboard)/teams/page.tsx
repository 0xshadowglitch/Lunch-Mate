import { TopNavbar } from "@/components/dashboard/top-navbar"
import { getUserOrgs } from "@/lib/org-actions"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, ArrowRight, ShieldCheck, User } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

function TeamCard({ org }: { org: any }) {
  return (
    <Card className="group hover:border-primary/50 transition-all bg-card/40 backdrop-blur-xl overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between py-5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              {org.name}
              {org.role === 'admin' && (
                <ShieldCheck className="h-4 w-4 text-primary" />
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest mt-1">
              Role: {org.role}
              <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              Currency: {org.currency || "₹"}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-bold h-11" asChild>
            <Link href={org.role === 'admin' ? "/admin" : "/user"}>
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}

export default async function TeamsPage() {
  const allOrgs = await getUserOrgs()
  const adminOrgs = allOrgs.filter(org => org.role === 'admin')
  const memberOrgs = allOrgs.filter(org => org.role !== 'admin')
  
  return (
    <div className="flex flex-col h-full bg-background/50">
      <TopNavbar title="Organizations" />
      <div className="flex-1 p-6 lg:p-10 pb-24 overflow-auto max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-3xl font-black uppercase tracking-tight">Teams Navigator</h2>
            <p className="text-muted-foreground text-sm font-medium">Manage and switch between your lunch tracking environments.</p>
          </div>
          <Button asChild className="rounded-xl font-bold">
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
        
        <div className="mt-12 p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-blue-500/5 border border-primary/10 relative overflow-hidden">
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
