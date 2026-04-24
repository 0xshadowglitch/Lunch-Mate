"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { cn } from "@/lib/utils"
import { getUserOrg, updateOrganizationCurrency } from "@/lib/org-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Shield,
  LinkIcon,
  Copy,
  CheckCheck,
  Loader2,
  Trash2,
  Clock,
  XCircle,
  CheckCircle2,
  Mail,
  Building2,
  Sparkles,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface Invite {
  id: string
  email: string | null
  expires_at: string
  used: boolean
  created_at: string
  status: "pending" | "used" | "expired"
  token: string
  link: string
}

interface OrgInfo {
  id: string
  name: string
  role: string
  currency: string
}

export default function TeamSettingsPage() {
  const [org, setOrg] = useState<OrgInfo | null>(null)
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [isCurrencyPending, setIsCurrencyPending] = useState(false)
  const [newInviteEmail, setNewInviteEmail] = useState("")
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [initialCurrency, setInitialCurrency] = useState("")

  const loadInvites = useCallback(async (orgId: string) => {
    const res = await fetch(`/api/invite?orgId=${orgId}`)
    if (res.ok) {
      const data = await res.json()
      setInvites(data.invites || [])
    }
  }, [])

  useEffect(() => {
    async function init() {
      const orgData = await getUserOrg()
      setOrg(orgData as OrgInfo | null)
      if (orgData?.currency) {
        setInitialCurrency(orgData.currency)
      }
      if (orgData?.id) {
        await loadInvites(orgData.id)
      }
      setLoading(false)
    }
    init()
  }, [loadInvites])

  const handleGenerateInvite = async () => {
    if (!org) return
    setGeneratedLink(null)

    startTransition(async () => {
      try {
        const res = await fetch("/api/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orgId: org.id, email: newInviteEmail || undefined }),
        })

        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error || "Failed to generate invite")
        } else {
          setGeneratedLink(data.link)
          setNewInviteEmail("")
          await loadInvites(org.id)
          toast.success("Invite link generated!")
        }
      } catch (err) {
        toast.error("An unexpected error occurred")
      }
    })
  }

  const handleCopy = async (link: string) => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success("Link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRevoke = async (inviteId: string) => {
    const res = await fetch(`/api/invite?id=${inviteId}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Invite revoked")
      if (org?.id) await loadInvites(org.id)
    } else {
      toast.error("Failed to revoke invite")
    }
  }

  const handleCleanup = async () => {
    if (isPending) return
    startTransition(async () => {
      const res = await fetch("/api/invite/cleanup")
      if (res.ok) {
        const data = await res.json()
        toast.success(`Cleaned up ${data.deleted} expired/used invites`)
        if (org?.id) await loadInvites(org.id)
      } else {
        toast.error("Cleanup failed")
      }
    })
  }

  const handleUpdateCurrency = async (currency: string) => {
    if (!org) return
    setIsCurrencyPending(true)
    try {
      const result = await updateOrganizationCurrency(org.id, currency)
      if (result.success) {
        setOrg({ ...org, currency })
        setInitialCurrency(currency) // Update initial after success
        toast.success("Currency updated!")
      } else {
        toast.error("Failed to update currency")
      }
    } catch (err) {
      toast.error("Something went wrong")
    } finally {
      setIsCurrencyPending(false)
    }
  }

  const statusBadge = (status: Invite["status"]) => {
    if (status === "pending") return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] px-2 py-0 h-5 font-bold"><CheckCircle2 className="h-3 w-3 mr-1" />Pending</Badge>
    if (status === "used") return <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 font-bold"><CheckCheck className="h-3 w-3 mr-1" />Used</Badge>
    return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] px-2 py-0 h-5 font-bold"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
      </div>
    )
  }

  if (org?.role !== "admin") {
    return (
      <div className="p-8 flex flex-col items-center gap-4 text-center text-muted-foreground">
        <Shield className="h-12 w-12 text-muted-foreground/50" />
        <p>Only admins can access Team Settings.</p>
      </div>
    )
  }

  const pendingInvites = invites.filter((i) => i.status === "pending" || i.status === "expired")
  const pastInvites = invites.filter((i) => i.status === "used")

  return (
    <div className="py-6 px-4 md:px-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Team Settings</h1>
          <p className="text-muted-foreground text-[11px] mt-1 font-medium">
            Management console for member access and team configuration.
          </p>
        </div>
        {pastInvites.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCleanup} 
            disabled={isPending}
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-destructive transition-all"
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Trash2 className="h-3 w-3 mr-2" />}
            Cleanup
          </Button>
        )}
      </div>

      {/* Org Info Card */}
      <Card className="border-2 border-primary/20 bg-primary/3 shadow-none">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary border border-primary/30 rounded-xl">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-black">Team Context</p>
                <p className="text-lg font-black leading-none mt-1">{org?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currency" className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-black">Currency</Label>
                <div className="flex gap-2">
                  <Input
                    id="currency"
                    value={org?.currency || ""}
                    onChange={(e) => setOrg(org ? { ...org, currency: e.target.value } : null)}
                    className="h-8 w-24 text-xs font-bold"
                    placeholder="PKR"
                  />
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="h-8 text-[10px] font-black uppercase cursor-pointer"
                    onClick={() => handleUpdateCurrency(org?.currency || "PKR")}
                    disabled={isCurrencyPending || org?.currency === initialCurrency}
                  >
                    {isCurrencyPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-6 rounded-lg uppercase tracking-wider font-black border-primary/20 bg-primary/5 text-primary self-end mb-1">
                {org?.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Invite */}
      <Card className="shadow-none border-2 border-border/50 overflow-hidden">
        <CardHeader className="p-4 md:p-6 pb-2 border-b border-border/40 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-black uppercase tracking-widest">Generate Invite Link</CardTitle>
            </div>
            <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-600 bg-emerald-500/5">Multi-use for public links</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
          <Button
            onClick={handleGenerateInvite}
            disabled={isPending}
            className="w-full h-11 text-xs font-black uppercase tracking-widest transition-all duration-300 hover:scale-[1.005] active:scale-[0.995] rounded-xl border-2 border-primary/20 hover:border-primary/50 shadow-none"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <LinkIcon className="mr-2 h-4 w-4" />
                Generate New Link
              </>
            )}
          </Button>

          {generatedLink && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">URL</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-background/80 px-3 py-2 rounded-lg border-2 border-primary/20 text-[11px] font-mono truncate shadow-none">
                      {generatedLink}
                    </div>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => handleCopy(generatedLink)}
                      className="h-9 w-9 shrink-0 rounded-lg border-2 border-border shadow-none"
                    >
                      {copied ? <CheckCheck className="h-4 w-4 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[9px] text-muted-foreground font-bold uppercase tracking-tight">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Expires in 24h</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Multi-use enabled</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <Card className="shadow-none border-2 border-border/50">
          <CardHeader className="p-4 md:p-6 pb-2 border-b border-border/40 bg-muted/30 flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-black uppercase tracking-widest">Active Invites</CardTitle>
            </div>
            <Badge variant="secondary" className="h-5 text-[10px] font-bold px-2 rounded-full">{pendingInvites.length}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-10 text-[10px] uppercase font-black tracking-widest text-center px-6">Restricted To</TableHead>
                  <TableHead className="h-10 text-[10px] uppercase font-black tracking-widest text-center">Status</TableHead>
                  <TableHead className="h-10 text-[10px] uppercase font-black tracking-widest text-center">Expires</TableHead>
                  <TableHead className="h-10 text-[10px] uppercase font-black tracking-widest text-center px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((invite) => (
                  <TableRow key={invite.id} className="group">
                    <TableCell className="py-3 px-6 text-xs font-medium text-center">
                      <div className="flex items-center justify-center gap-2">
                        {invite.email ? (
                          <>
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {invite.email}
                          </>
                        ) : (
                          <span className="text-muted-foreground italic text-[10px] uppercase tracking-tighter">Public Link</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">{statusBadge(invite.status)}</TableCell>
                    <TableCell className="py-3 text-[10px] text-muted-foreground font-bold text-center">
                      {formatDistanceToNow(new Date(invite.expires_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="py-3 text-center px-6">
                      <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(invite.link)}
                        className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke Invite?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will immediately invalidate the invite link. Anyone who has the link will not be able to use it.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-white"
                              onClick={() => handleRevoke(invite.id)}
                            >
                              Revoke
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Past Invites Summary */}
      {pastInvites.length > 0 && (
        <div className="flex justify-center pt-2 pb-8">
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] italic">
            — {pastInvites.length} past invitation records in history —
          </p>
        </div>
      )}
    </div>
  )
}
