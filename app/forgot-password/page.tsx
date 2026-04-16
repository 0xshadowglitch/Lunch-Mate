"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { requestPasswordReset } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Mail, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await requestPasswordReset(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden transition-colors duration-500">
      {/* Premium Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute top-[10%] right-[10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[20%] left-[15%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] -z-10" />
      
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 pointer-events-none -z-10 transition-opacity" />

      <Card className="w-full max-w-md border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl p-2 md:p-4">
        <CardHeader className="space-y-4 pt-8 pb-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <Link 
              href="/login" 
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
            </Link>
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
              <span className="text-sm font-black tracking-tighter bg-primary/20 px-2 py-0.5 rounded text-primary">LUNCH MATE</span>
            </div>
          </div>
          <div className="space-y-2 text-center md:text-left">
            <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Reset Password</CardTitle>
            <CardDescription className="text-base">
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="py-2">
          {success ? (
            <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500 my-4 shadow-inner">
              <div className="flex justify-center">
                <div className="p-4 bg-emerald-500/20 rounded-full ring-8 ring-emerald-500/5">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-bounce" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-emerald-500 uppercase tracking-tight">Check your inbox</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  We've sent a password reset link to your email. Please check your inbox and spam folder to continue.
                </p>
              </div>
            </div>
          ) : (
            <form action={handleSubmit} className="space-y-5">
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

              <div className="pt-2">
                <Button type="submit" className="w-full h-14 text-base font-black uppercase tracking-widest transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] rounded-xl shadow-lg hover:shadow-primary/20" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col pt-6 pb-10">
          <div className="text-center text-sm text-muted-foreground font-medium">
            Remembered your password?{" "}
            <Link href="/login" className="text-primary hover:underline font-black uppercase tracking-tight">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
