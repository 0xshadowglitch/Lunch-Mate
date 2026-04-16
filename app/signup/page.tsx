"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { signup } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Lock, Mail, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  )
}

function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/admin"

  async function handleSubmit(formData: FormData) {
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError(null)
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden transition-colors duration-500">
        {/* Premium Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute top-[20%] right-[15%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] -z-10" />
        
        <Card className="w-full max-w-md border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl text-center p-4">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-emerald-500/10 rounded-full ring-8 ring-emerald-500/5">
                <Mail className="h-10 w-10 text-emerald-500 animate-bounce" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight uppercase">Verify your email</CardTitle>
            <CardDescription className="text-base pt-2">
              We've sent a verification link to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 text-sm text-muted-foreground text-left shadow-inner">
              <p className="font-black text-foreground mb-2 uppercase tracking-tight">Next Steps:</p>
              <ul className="list-disc list-inside space-y-2 font-medium">
                <li>Check your inbox and spam folder</li>
                <li>Click the verification link</li>
                <li>Log in to start tracking lunches</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="pb-6">
            <Button variant="outline" className="w-full h-12 font-bold rounded-xl border-border/50" asChild>
              <Link href="/login">Back to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden transition-colors duration-500">
      {/* Premium Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute top-[10%] left-[15%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] -z-10" />
      
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 pointer-events-none -z-10 transition-opacity" />

      <Card className="w-full max-w-md border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl p-2 md:p-4">
        <CardHeader className="space-y-3 text-center pt-8 pb-4">
          <div className="flex justify-center mb-6 transition-transform hover:scale-110 duration-500">
            <div className="relative w-24 h-24 group">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all duration-500" />
              <div className="relative bg-background/50 backdrop-blur-sm border border-border/50 p-3 rounded-2xl shadow-xl overflow-hidden aspect-square flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Lunch Mate Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
          <CardTitle className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Lunch Mate</CardTitle>
          <CardDescription className="text-sm font-medium tracking-wide">
            Start tracking and managing your team's lunch today
          </CardDescription>
        </CardHeader>
        <CardContent className="py-2">
          <form action={handleSubmit} className="space-y-5">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-sm text-destructive animate-in fade-in zoom-in-95 duration-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}
            
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  className="pl-12 h-14 bg-background/40 border-border/40 hover:border-primary/50 transition-colors rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-12 h-14 bg-background/40 border-border/40 hover:border-primary/50 transition-colors rounded-xl"
                  required
                />
              </div>
              <p className="text-[10px] text-muted-foreground/60 ml-1 font-medium italic">
                Must be at least 6 characters long
              </p>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="confirmPassword" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-12 h-14 bg-background/40 border-border/40 hover:border-primary/50 transition-colors rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full h-14 text-base font-black uppercase tracking-widest transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] rounded-xl shadow-lg hover:shadow-primary/20" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Get Started"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col pt-6 pb-10">
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-primary hover:underline font-bold">
              Log in instead
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
