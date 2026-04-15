"use client"

import { useState, useTransition } from "react"
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
import { Input } from "@/components/ui/input"
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
import { Trash2, UserPlus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { addUser, deleteUser, type LunchUser, type UserBalance } from "@/lib/actions"

interface UserManagementProps {
  users: LunchUser[]
  balances: UserBalance[]
}

export function UserManagement({ users, balances }: UserManagementProps) {
  const [newUserName, setNewUserName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleAddUser = () => {
    if (newUserName.trim()) {
      startTransition(async () => {
        await addUser(newUserName.trim())
        setNewUserName("")
        setIsDialogOpen(false)
      })
    }
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
          User Management
          <Badge variant="secondary">{users.length} users</Badge>
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Enter the name of the new user to add to the lunch tracker.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Enter user name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
                disabled={isPending}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button onClick={handleAddUser} disabled={!newUserName.trim() || isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add User"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Days Present</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const balance = getBalanceForUser(user.id)
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-right">
                    {balance?.daysPresent || 0}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      (balance?.balance || 0) > 0
                        ? "text-emerald-500"
                        : (balance?.balance || 0) < 0
                        ? "text-red-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {(balance?.balance || 0) >= 0 ? "+" : ""}₹
                    {(balance?.balance || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-semibold">{user.name}</span>?
                            This will remove them from the lunch tracker and all
                            their associated records.
                            {balance && balance.balance !== 0 && (
                              <span className="mt-2 block text-amber-600">
                                Warning: This user has a balance of ₹
                                {balance.balance.toLocaleString()}
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
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
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-8"
                >
                  No users found. Add a user to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
