"use client"

import { useState, useTransition, useEffect, useCallback } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2, UserPlus, Loader2, Mail, ShieldCheck, User, Edit2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { addUser, deleteUser, updateUser, type LunchUser, type UserBalance } from "@/lib/actions"
import { UserLabel } from "./user-label"
import { createClient } from "@/lib/supabase/client"
import { getUserOrg } from "@/lib/org-actions"

interface MemberProfile {
  user_id: string
  email: string
  display_name: string | null
  role: string
}

interface UserManagementProps {
  users: LunchUser[]
  balances: UserBalance[]
  currentUserId?: string
  currency?: string
}

export function UserManagement({ users, balances, currentUserId, currency = "PKR" }: UserManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [availableMembers, setAvailableMembers] = useState<MemberProfile[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null)
  const [editingUser, setEditingUser] = useState<LunchUser | null>(null)
  const [editName, setEditName] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const loadAvailableMembers = useCallback(async () => {
    setLoadingMembers(true)
    const supabase = createClient()
    const org = await getUserOrg()
    if (!org) { setLoadingMembers(false); return }

    // Use the view we created
    const { data, error } = await supabase
      .from("org_member_profiles")
      .select("user_id, email, display_name, role")
      .eq("org_id", org.id)

    if (error || !data) { setLoadingMembers(false); return }

    // Filter out those already in lunch tracking
    const trackedUserIds = new Set(users.map((u: any) => u.linked_user_id).filter(Boolean))
    const available = data.filter((m) => !trackedUserIds.has(m.user_id))
    setAvailableMembers(available)
    setLoadingMembers(false)
  }, [users])

  const handleOpenDialog = () => {
    setIsDialogOpen(true)
    setSelectedMember(null)
    setAddError(null)
    loadAvailableMembers()
  }

  const handleAddMember = () => {
    if (!selectedMember) return
    setAddError(null)
    startTransition(async () => {
      const displayName = selectedMember.display_name || selectedMember.email.split("@")[0]
      const result = await addUser(displayName, selectedMember.user_id)
      if (result.success) {
        setIsDialogOpen(false)
        setSelectedMember(null)
      } else {
        setAddError(result.error || "Failed to add user")
      }
    })
  }

  const handleEditUser = (user: LunchUser) => {
    setEditingUser(user)
    setEditName(user.name)
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = () => {
    if (!editingUser) return
    startTransition(async () => {
      const result = await updateUser(editingUser.id, editName)
      if (result.success) {
        setIsEditDialogOpen(false)
        setEditingUser(null)
      }
    })
  }

  const handleDeleteUser = (userId: string) => {
    startTransition(async () => {
      await deleteUser(userId)
    })
  }

  const getBalanceForUser = (userId: string) => {
    return balances.find((b) => b.id === userId)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Member Tracking
          <Badge variant="secondary">{users.length} tracked</Badge>
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleOpenDialog}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Member to Lunch Tracking</DialogTitle>
              <DialogDescription>
                Select a team member who has already accepted their invite. Only account holders can be tracked.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              {loadingMembers ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : availableMembers.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center text-muted-foreground animate-in fade-in duration-500">
                  <div className="p-4 bg-muted/50 rounded-full">
                    <UserPlus className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-black uppercase tracking-tight">No members available</p>
                    <p className="text-sm max-w-[240px] leading-relaxed">
                      All team members are already being tracked, or you need to invite more people first.
                    </p>
                  </div>
                  <Button variant="outline" className="mt-4 rounded-xl border-2 hover:border-primary/50 font-bold h-12 px-6" asChild>
                    <a href="/admin/settings">
                      Generate Invite Link
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableMembers.map((member) => (
                    <button
                      key={member.user_id}
                      onClick={() => setSelectedMember(member)}
                        "w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                        selectedMember?.user_id === member.user_id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {(member.display_name || member.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {member.display_name && (
                          <p className="text-sm font-medium truncate">{member.display_name}</p>
                        )}
                        <p className={cn("text-xs truncate", member.display_name ? "text-muted-foreground" : "text-sm font-medium")}>
                          <Mail className="h-3 w-3 inline mr-1" />
                          {member.email}
                        </p>
                      </div>
                      <Badge variant={member.role === "admin" ? "default" : "secondary"} className="shrink-0 text-[10px]">
                        {member.role === "admin" ? <ShieldCheck className="h-3 w-3 mr-1" /> : null}
                        {member.role}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {addError && (
                <p className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                  {addError}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={!selectedMember || isPending || loadingMembers}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add to Tracking"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="text-center">Days Present</TableHead>
              <TableHead className="text-center">Balance</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const balance = getBalanceForUser(user.id)
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <UserLabel 
                        name={user.name} 
                        isMe={user.linked_user_id === currentUserId} 
                        className="text-sm"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{balance?.daysPresent || 0}</TableCell>
                  <TableCell
                    className={cn(
                      "text-center font-semibold",
                      (balance?.balance || 0) > 0
                        ? "text-emerald-500"
                        : (balance?.balance || 0) < 0
                        ? "text-red-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {(balance?.balance || 0) >= 0 ? "+" : ""}{currency} {(balance?.balance || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleEditUser(user)}
                          disabled={isPending}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={isPending}
                            >
                              {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove from Tracking</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove{" "}
                            <span className="font-semibold">{user.name}</span> from lunch tracking?
                            This will remove all their lunch records. Their account will still exist in the team.
                            {balance && balance.balance !== 0 && (
                              <span className="mt-2 block text-amber-600">
                                Warning: This user has an outstanding balance of {currency} {" "}
                                {balance.balance.toLocaleString()}
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )
            })}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                  <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm">No members tracked yet.</p>
                  <p className="text-xs mt-1">
                    Invite people to your team first, then add them here.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Member Name</DialogTitle>
            <DialogDescription>
              Change how this member appears across the dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest opacity-60">Display Name</label>
              <input 
                autoFocus
                className="w-full h-12 bg-background border border-border rounded-xl px-4 font-bold text-sm focus:border-primary outline-none transition-all"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter name"
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateUser()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={isPending || !editName.trim()}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
