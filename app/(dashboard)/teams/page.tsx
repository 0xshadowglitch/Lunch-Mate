import { TopNavbar } from "@/components/dashboard/top-navbar"
import { getUserOrgs, setActiveOrg } from "@/lib/org-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Check, ArrowRight, ShieldCheck, User } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function TeamsPage() {
  const allOrgs = await getUserOrgs()
  
  // Client component for switching logic could be here, but let's keep it simple with a form or link
  return (
    <div className="flex flex-col h-full bg-background/50">
      <TopNavbar title="My Teams" />
      <div className="flex-1 p-6 lg:p-10 pb-24 overflow-auto max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-3xl font-black uppercase tracking-tight">Joined Teams</h2>
            <p className="text-muted-foreground text-sm font-medium">Manage and switch between your lunch tracking environments.</p>
          </div>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/onboarding">Create New Team</Link>
          </Button>
        </div>

        <div className="grid gap-6">
          {allOrgs.length === 0 ? (
            <Card className="bg-card/40 backdrop-blur-xl border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold">No Teams Joined</h3>
                <p className="text-muted-foreground text-sm max-w-xs mb-6">You haven't joined any lunch tracking teams yet. Ask an admin for an invite link.</p>
              </CardContent>
            </Card>
          ) : (
            allOrgs.map((org) => (
              <Card key={org.id} className="group hover:border-primary/50 transition-all bg-card/40 backdrop-blur-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between py-6">
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
            ))
          )}
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
