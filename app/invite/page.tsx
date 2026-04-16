"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Utensils,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  ArrowRight,
  LogIn,
} from "lucide-react"
import Link from "next/link"

type Status = "loading" | "ready" | "joining" | "success" | "error"

interface InviteState {
  status: Status
  errorMessage?: string
  orgName?: string
  needsLogin?: boolean
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <InviteContent />
    </Suspense>
  )
}

function InviteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [state, setState] = useState<InviteState>({ status: "loading" })
  const [user, setUser] = useState<any>(null)

  // Check auth status
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (!token) {
        setState({ status: "error", errorMessage: "No invite token found in URL." })
      } else {
        setState({ status: "ready" })
      }
    })
  }, [token])

  const handleAccept = async () => {
    if (!token) return
    setState((s) => ({ ...s, status: "joining" }))

    const res = await fetch("/api/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })

    const data = await res.json()

    if (!res.ok) {
      setState({ status: "error", errorMessage: data.error })
    } else {
      setState({ status: "success", orgName: data.orgName })
      // Redirect to the dashboard after 2 seconds
      setTimeout(() => router.push("/user"), 2000)
    }
  }

  const renderContent = () => {
    switch (state.status) {
      case "loading":
        return (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Validating your invite...</p>
          </div>
        )

      case "success":
        return (
          <div className="flex flex-col items-center gap-6 py-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="p-4 bg-emerald-500/10 rounded-2xl ring-8 ring-emerald-500/5">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">You're in!</h2>
              <p className="text-muted-foreground text-sm font-medium">
                Welcome to <span className="font-bold text-primary">{state.orgName}</span>.
              </p>
              <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest mt-4 opacity-50">Redirecting to dashboard...</p>
            </div>
          </div>
        )

      case "error":
        const isExpired = state.errorMessage?.includes("expired")
        const isUsed = state.errorMessage?.includes("already been used")
        const Icon = isExpired ? Clock : isUsed ? XCircle : XCircle
        
        return (
          <div className="flex flex-col items-center gap-6 py-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="p-4 bg-destructive/10 rounded-2xl ring-8 ring-destructive/5">
              <Icon className="h-12 w-12 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight text-destructive">
                {isExpired ? "Invite Expired" : isUsed ? "Already Used" : "Invalid Invite"}
              </h2>
              <p className="text-muted-foreground text-sm font-medium max-w-xs">{state.errorMessage}</p>
            </div>
            <Button variant="outline" className="h-12 px-8 rounded-xl font-bold mt-4" asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        )

      case "ready":
      case "joining":
        return (
          <div className="flex flex-col items-center gap-6 py-6 text-center animate-in fade-in duration-500">
            <div className="p-4 bg-primary/10 rounded-2xl ring-8 ring-primary/5">
              <Users className="h-12 w-12 text-primary" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black uppercase tracking-tight">You've been invited!</h2>
              <p className="text-muted-foreground text-sm font-medium">
                Accept this invite to join your team.
              </p>
            </div>

            {!user ? (
              <div className="w-full space-y-4 pt-4">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 font-bold uppercase tracking-tight">
                  You must be logged in to join
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-12 rounded-xl font-bold" asChild>
                    <Link href={`/login?redirect=/invite?token=${token}`}>
                      Log In
                    </Link>
                  </Button>
                  <Button className="h-12 rounded-xl font-bold shadow-lg shadow-primary/20" asChild>
                    <Link href={`/signup?redirect=/invite?token=${token}`}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-4 pt-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Logged in as <span className="text-foreground">{user.email}</span>
                </div>
                <Button
                  className="w-full h-14 text-base font-black uppercase tracking-widest transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] rounded-xl shadow-lg hover:shadow-primary/20"
                  onClick={handleAccept}
                  disabled={state.status === "joining"}
                >
                  {state.status === "joining" ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Joining Team...
                    </>
                  ) : (
                    <>
                      Accept Invite
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden transition-colors duration-500">
      {/* Premium Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute top-[10%] left-[15%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] -z-10" />
      
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 pointer-events-none -z-10 transition-opacity" />

      <Card className="w-full max-w-md border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl p-2 md:p-4">
        <CardHeader className="text-center pt-8 pb-4 space-y-4">
          <div className="flex justify-center mb-2 transition-transform hover:scale-110 duration-500">
            <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20 ring-4 ring-primary/10">
              <Utensils className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent uppercase">Lunch Mate</CardTitle>
            <CardDescription className="text-sm font-black tracking-widest uppercase opacity-70">Team Invitation</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="py-2">
          {renderContent()}
        </CardContent>
        <CardFooter className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider justify-center py-6">
          Invite links expire after 24 hours and are single-use.
        </CardFooter>
      </Card>
    </div>
  )
}
