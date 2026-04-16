"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { login } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Lock, Mail, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/admin"
  const message = searchParams.get("message")

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <Card className="w-full max-w-md border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20 group">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all duration-500" />
              <div className="relative bg-background/50 backdrop-blur-sm border border-border/50 p-2 rounded-2xl shadow-xl overflow-hidden aspect-square flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Lunch Mate Logo"
                  width={64}
                  height={64}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Lunch Mate</CardTitle>
          <CardDescription>
            Log in to manage your team's lunch expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {/* Pass redirect URL as hidden input */}
            <input type="hidden" name="redirectTo" value={redirectTo} />
            {message && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-sm text-emerald-500 animate-in fade-in zoom-in-95 duration-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <p>{message}</p>
              </div>
            )}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-sm text-destructive animate-in fade-in zoom-in-95 duration-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href={`/signup?redirect=${encodeURIComponent(redirectTo)}`} className="text-primary hover:underline font-medium">
              Create one for your team
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
