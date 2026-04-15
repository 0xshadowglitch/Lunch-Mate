"use client"

import { useEffect, useState } from "react"
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
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="p-3 bg-emerald-500/10 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">You're in!</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Welcome to <span className="font-semibold text-foreground">{state.orgName}</span>.
              </p>
              <p className="text-muted-foreground text-xs mt-2">Redirecting to your dashboard...</p>
            </div>
          </div>
        )

      case "error":
        const isExpired = state.errorMessage?.includes("expired")
        const isUsed = state.errorMessage?.includes("already been used")
        const Icon = isExpired ? Clock : isUsed ? XCircle : XCircle

        return (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="p-3 bg-destructive/10 rounded-full">
              <Icon className="h-12 w-12 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-destructive">
                {isExpired ? "Invite Expired" : isUsed ? "Already Used" : "Invalid Invite"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs">{state.errorMessage}</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        )

      case "ready":
      case "joining":
        return (
          <div className="flex flex-col items-center gap-6 py-4 text-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="h-10 w-10 text-primary" />
            </div>

            <div>
              <h2 className="text-xl font-bold">You've been invited!</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Accept this invite to join a Lunch Tracker team.
              </p>
            </div>

            {!user ? (
              <div className="w-full space-y-3">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-600">
                  You must be logged in to accept this invite.
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/login?redirect=/invite?token=${token}`}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Log In
                    </Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link href={`/signup?redirect=/invite?token=${token}`}>
                      Sign Up
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-3">
                <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
                  Logged in as: <span className="font-semibold text-foreground">{user.email}</span>
                </div>
                <Button
                  className="w-full font-semibold"
                  onClick={handleAccept}
                  disabled={state.status === "joining"}
                >
                  {state.status === "joining" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining Team...
                    </>
                  ) : (
                    <>
                      Accept Invite
                      <ArrowRight className="ml-2 h-4 w-4" />
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[15%] left-[15%] w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[15%] right-[15%] w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <Card className="w-full max-w-md border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center border-b border-border/50 pb-4">
          <div className="flex justify-center mb-3">
            <div className="p-2 bg-primary rounded-xl shadow-lg">
              <Utensils className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-lg">Lunch Tracker</CardTitle>
          <CardDescription>Team Invitation</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {renderContent()}
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground border-t border-border/50 pt-4">
          Invite links expire after 24 hours and are single-use.
        </CardFooter>
      </Card>
    </div>
  )
}
