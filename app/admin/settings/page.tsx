"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { getUserOrg } from "@/lib/org-actions"
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
}

interface OrgInfo {
  id: string
  name: string
  role: string
}

export default function TeamSettingsPage() {
  const [org, setOrg] = useState<OrgInfo | null>(null)
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [newInviteEmail, setNewInviteEmail] = useState("")
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
    const res = await fetch("/api/invite/cleanup")
    if (res.ok) {
      const data = await res.json()
      toast.success(`Cleaned up ${data.deleted} expired/used invites`)
      if (org?.id) await loadInvites(org.id)
    }
  }

  const statusBadge = (status: Invite["status"]) => {
    if (status === "pending") return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Pending</Badge>
    if (status === "used") return <Badge variant="secondary"><CheckCheck className="h-3 w-3 mr-1" />Used</Badge>
    return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
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

  const pendingInvites = invites.filter((i) => i.status === "pending")
  const pastInvites = invites.filter((i) => i.status !== "pending")

  return (
    <div className="py-12 px-6 lg:px-10 space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Team Settings</h1>
          <p className="text-muted-foreground text-base mt-2 font-medium">
            Project configuration and member access control.
          </p>
        </div>
        <Button variant="outline" size="lg" onClick={handleCleanup} className="rounded-xl px-6">
          <Trash2 className="h-4 w-4 mr-2" />
          Clean Up Expired
        </Button>
      </div>

      {/* Org Info Card */}
      <Card className="border-primary/20 bg-primary/5 shadow-xl shadow-primary/5">
        <CardContent className="p-8 lg:p-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-primary shadow-lg shadow-primary/30 rounded-2xl">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-1">Active Environment</p>
              <p className="text-3xl font-black">{org?.name}</p>
            </div>
            <div className="ml-auto">
              <Badge variant="default" className="text-sm px-4 py-1.5 rounded-full capitalize">
                <Shield className="h-3.5 w-3.5 mr-2" />
                {org?.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Invite */}
      <Card className="shadow-xl">
        <CardHeader className="p-8 lg:p-10 pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Generate Invite Link
          </CardTitle>
          <CardDescription className="text-base">
            Create a secure, single-use invite link that expires in 24 hours. Share it with the person you want to invite.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 lg:p-10 pt-0 space-y-10">
          <div className="space-y-6 pt-2">
            <Label htmlFor="invite-email" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">
              Recipient Email <span className="text-muted-foreground/50 font-medium normal-case tracking-normal">(Optional — restrict to email)</span>
            </Label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                className="pl-14 h-16 bg-background/40 border-2 border-border/40 focus:border-primary/50 transition-all rounded-2xl text-lg"
                value={newInviteEmail}
                onChange={(e) => setNewInviteEmail(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <Button
            onClick={handleGenerateInvite}
            disabled={isPending}
            className="w-full h-16 text-lg font-black uppercase tracking-[0.1em] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] rounded-2xl shadow-xl hover:shadow-primary/30"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <LinkIcon className="mr-3 h-6 w-6" />
                Generate Invite Link
              </>
            )}
          </Button>

          {/* Generated Link Display */}
          {generatedLink && (
            <div className="mt-8 p-6 rounded-2xl border-2 border-primary/30 bg-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-inner">
              <div className="flex items-start gap-6">
                <div className="p-2 bg-primary/10 rounded-full shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black uppercase tracking-widest text-primary mb-2">Invite Link</p>
                  <p className="text-sm text-muted-foreground font-mono break-all bg-background/80 p-4 rounded-xl border-2 border-primary/10 shadow-sm leading-relaxed">
                    {generatedLink}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2 font-medium">
                    <Clock className="h-4 w-4" /> Expires in 24 hours · Single-use
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleCopy(generatedLink)}
                  className="shrink-0 h-12 w-12 rounded-xl border-2 hover:border-primary/50"
                >
                  {copied ? <CheckCheck className="h-6 w-6 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black uppercase tracking-widest flex items-center justify-between">
              <span>Active Invites</span>
              <Badge variant="secondary" className="rounded-full px-3">{pendingInvites.length}</Badge>
            </CardTitle>
            <CardDescription className="text-base font-medium">These invite links are still valid and haven't been used.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restricted To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="text-sm">
                      {invite.email ? (
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {invite.email}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">Anyone</span>
                      )}
                    </TableCell>
                    <TableCell>{statusBadge(invite.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(invite.expires_at), { addSuffix: true })}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Past Invites */}
      {pastInvites.length > 0 && (
        <Card className="opacity-70 shadow-sm transition-opacity hover:opacity-100">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-base font-black uppercase tracking-widest text-muted-foreground">Past Invites</CardTitle>
            <CardDescription className="font-medium">Used and expired invites.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restricted To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastInvites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {invite.email || <span className="italic">Anyone</span>}
                    </TableCell>
                    <TableCell>{statusBadge(invite.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
