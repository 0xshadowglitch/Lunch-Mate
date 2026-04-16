"use client"

import { useState } from "react"
import { Plus, Users, Calculator, Receipt, Loader2 } from "lucide-react"
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
  currency?: string
}

export function AddEntryDialog({ users, currency = "₹" }: AddEntryDialogProps) {
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
          <div className="grid gap-5">
            <div className="grid gap-2.5">
              <Label htmlFor="date" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Lunch Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="h-12 bg-background/50 border-border/40 rounded-xl px-4"
              />
            </div>
            
            <div className="grid gap-2.5">
              <Label htmlFor="total" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 text-primary">Total Expense ({currency})</Label>
              <Input
                id="total"
                type="number"
                placeholder="0.00"
                value={totalExpense}
                onChange={(e) => setTotalExpense(e.target.value)}
                required
                step="0.01"
                className="h-14 bg-background/50 border-primary/20 hover:border-primary/50 text-xl font-black rounded-xl px-4 shadow-inner"
              />
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="paidBy" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Who Paid?</Label>
              <Select value={paidBy} onValueChange={setPaidBy}>
                <SelectTrigger className="h-12 bg-background/50 border-border/40 rounded-xl px-4">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50 backdrop-blur-xl">
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="rounded-lg">
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Attendance ({presentCount})
              </Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-6 text-[10px] font-black uppercase tracking-tighter px-2 hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => setPresentUserIds(new Set(users.map(u => u.id)))}
              >
                SELECT ALL
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-background/20 border border-border/30 max-h-[160px] overflow-y-auto shadow-inner custom-scrollbar">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/10">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={presentUserIds.has(user.id)}
                    onCheckedChange={() => toggleUser(user.id)}
                    className="h-5 w-5 rounded-md border-primary/30"
                  />
                  <label
                    htmlFor={`user-${user.id}`}
                    className="text-sm font-bold leading-none cursor-pointer select-none opacity-80"
                  >
                    {user.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Calculator className="h-12 w-12 text-primary" />
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              <span className="flex items-center gap-1.5">
                Calculation Breakdown
              </span>
              <span>{currency}{total.toLocaleString()} ÷ {presentCount}</span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <span className="text-xs font-black uppercase tracking-widest opacity-80">Share / Person</span>
              <span className="text-3xl font-black text-primary tracking-tighter">
                {currency}{sharePerPerson.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              className="w-full h-14 text-base font-black uppercase tracking-widest transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] rounded-xl shadow-xl shadow-primary/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Record Entry"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
