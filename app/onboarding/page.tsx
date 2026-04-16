"use client"
import { useState, useTransition } from "react"
import { createOrganization } from "@/lib/org-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Loader2, AlertCircle, ArrowRight } from "lucide-react"

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createOrganization(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden transition-colors duration-500">
      {/* Premium Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute top-[10%] left-[15%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] -z-10" />
      
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 pointer-events-none -z-10 transition-opacity" />

      <Card className="w-full max-w-md border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl p-2 md:p-4">
        <CardHeader className="space-y-4 text-center pt-8 pb-4">
          <div className="flex justify-center mb-4 transition-transform hover:scale-110 duration-500">
            <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20 ring-4 ring-primary/10">
              <Building2 className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Create your Team</CardTitle>
            <CardDescription className="text-base font-medium">
              Give your lunch tracking environment a name
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="py-2">
          <form action={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-sm text-destructive animate-in fade-in zoom-in-95 duration-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="font-medium leading-tight">{error}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Organization/Team Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Acme Corp Lunch Group"
                className="h-14 bg-background/40 border-border/40 hover:border-primary/50 transition-colors rounded-xl text-base px-6 shadow-inner"
                required
              />
              <p className="text-[10px] text-muted-foreground/60 ml-2 font-medium italic">
                This will be the shared space for your team members.
              </p>
            </div>

            <Button type="submit" className="w-full h-14 text-base font-black uppercase tracking-widest transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] rounded-xl shadow-lg hover:shadow-primary/20" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Building...
                </>
              ) : (
                <>
                  Create Environment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <div className="pt-2">
              <Button 
                variant="ghost" 
                className="w-full h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors"
                onClick={() => window.location.href = "/admin"}
                type="button"
              >
                Skip for now — set up later
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider justify-center py-6">
          You can change this name later in settings.
        </CardFooter>
      </Card>
    </div>
  )
}
