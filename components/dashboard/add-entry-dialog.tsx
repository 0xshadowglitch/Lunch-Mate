"use client"

import { useState } from "react"
import { Plus, Users, Calculator, Receipt } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { addEntry } from "@/lib/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface AddEntryDialogProps {
  users: { id: string; name: string }[]
}

export function AddEntryDialog({ users }: AddEntryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [totalExpense, setTotalExpense] = useState("")
  const [paidBy, setPaidBy] = useState(users[0]?.id || "")
  const [presentUserIds, setPresentUserIds] = useState<Set<string>>(
    new Set(users.map((u) => u.id))
  )

  const total = parseFloat(totalExpense) || 0
  const presentCount = presentUserIds.size
  const sharePerPerson = presentCount > 0 ? total / presentCount : 0

  const toggleUser = (userId: string) => {
    const next = new Set(presentUserIds)
    if (next.has(userId)) {
      next.delete(userId)
    } else {
      next.add(userId)
    }
    setPresentUserIds(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!totalExpense || total <= 0) {
      toast.error("Please enter a valid total expense")
      return
    }
    if (presentCount === 0) {
      toast.error("At least one person must be present")
      return
    }

    setIsSubmitting(true)
    try {
      const shares = Array.from(presentUserIds).map((userId) => ({
        userId,
        amount: sharePerPerson,
      }))

      const result = await addEntry({
        date,
        totalExpense: total,
        shares,
        payments: [{ userId: paidBy, amount: total }],
      })

      if (result.success) {
        toast.success("Entry added successfully")
        setOpen(false)
        setTotalExpense("")
      } else {
        toast.error(result.error || "Failed to add entry")
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" />
          Add Daily Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Receipt className="h-5 w-5 text-primary" />
            Add New Lunch Entry
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="total">Total Expense (₹)</Label>
              <Input
                id="total"
                type="number"
                placeholder="0.00"
                value={totalExpense}
                onChange={(e) => setTotalExpense(e.target.value)}
                required
                step="0.01"
                className="bg-background/50 text-lg font-semibold"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paidBy">Who Paid?</Label>
              <Select value={paidBy} onValueChange={setPaidBy}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Who was present? ({presentCount})
              </Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs px-2"
                onClick={() => setPresentUserIds(new Set(users.map(u => u.id)))}
              >
                Select All
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-background/30 border border-border/30 max-h-[160px] overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-primary/5 transition-colors">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={presentUserIds.has(user.id)}
                    onCheckedChange={() => toggleUser(user.id)}
                  />
                  <label
                    htmlFor={`user-${user.id}`}
                    className="text-sm font-medium leading-none cursor-pointer select-none"
                  >
                    {user.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 italic">
                <Calculator className="h-3.5 w-3.5" />
                Calculation Hint
              </span>
              <span>₹{total.toLocaleString()} / {presentCount} people</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium">Share per Person</span>
              <span className="text-2xl font-black text-primary">
                ₹{sharePerPerson.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full h-11 text-base font-bold shadow-xl shadow-primary/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Create Lunch Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
