"use client"

import { useState } from "react"
import Link from "next/link"
import { updatePassword } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Lock, Loader2, AlertCircle, ArrowLeft } from "lucide-react"

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await updatePassword(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden transition-colors duration-500">
      {/* Premium Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute top-[20%] right-[15%] w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[10%] left-[10%] w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[140px] -z-10" />
      
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 pointer-events-none -z-10 transition-opacity" />

      <Card className="w-full max-w-md border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between mb-2">
            <Link 
              href="/login" 
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
              <span className="text-sm font-bold bg-primary/20 px-2 py-0.5 rounded text-primary">Lunch Mate</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Set New Password</CardTitle>
          <CardDescription>
            Choose a strong password to secure your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-sm text-destructive animate-in fade-in zoom-in-95 duration-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}
            
            <div className="space-y-2.5">
              <Label htmlFor="password" name="Password" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</Label>
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
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="confirmPassword" name="ConfirmPassword" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</Label>
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
              <Button type="submit" className="w-full h-14 text-base font-black uppercase tracking-widest transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] rounded-xl shadow-lg hover:shadow-primary/20" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Updating security...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
