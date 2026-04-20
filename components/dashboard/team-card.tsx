"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, ShieldCheck, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteOrganization } from "@/lib/org-actions"
import { useTransition } from "react"
import { toast } from "sonner"

interface TeamCardProps {
  org: {
    id: string
    name: string
    role: string
    currency: string
  }
}

export function TeamCard({ org }: TeamCardProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${org.name}? This will remove all associated data.`)) {
      startTransition(async () => {
        try {
          const result = await deleteOrganization(org.id)
          if (result.success) {
            toast.success(`Deleted ${org.name} successfully`)
            window.location.reload()
          } else {
            toast.error(result.error || "Failed to delete team")
          }
        } catch (error: any) {
          toast.error(error.message || "An unexpected error occurred")
        }
      })
    }
  }

  return (
    <Card className="group hover:border-primary/50 transition-all bg-card/40 backdrop-blur-xl overflow-hidden shadow-lg border-border/50">
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
              Currency: {org.currency || ""}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-bold h-11 border-primary/20 hover:bg-primary/10" asChild>
            <Link href={org.role === 'admin' ? "/admin" : "/user"}>
              Go to Dashboard
            </Link>
          </Button>
          {org.role === 'admin' && (
            <Button 
              variant="outline" 
              size="icon" 
              disabled={isPending}
              className="rounded-xl h-11 w-11 border-red-500/20 hover:bg-red-500/10 hover:text-red-500 text-red-500/70 transition-all"
              onClick={handleDelete}
            >
              <Trash2 className={isPending ? "h-5 w-5 animate-spin" : "h-5 w-5"} />
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}
