"use client"

import { useState } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Check, Receipt, Loader2, Pencil } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { formatDate, getDayName } from "@/lib/date-utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateEntry } from "@/lib/actions"
import { toast } from "sonner"

type UserDetail = {
  userId: string
  userName: string
  isPresent: boolean
  share: number
  paid: number
  balance: number
}

type EntryData = {
  id: string
  date: string
  totalExpense: number
  userDetails: UserDetail[]
}

import { AddEntryDialog } from "./add-entry-dialog"
import { EditEntryDialog } from "./edit-entry-dialog"
import { UserLabel } from "./user-label"

function PaymentAmountEdit({ entryId, userId, initialValue, entryData, currency, isPresent, isAdmin }: {
  entryId: string,
  userId: string,
  initialValue: number,
  entryData: EntryData,
  currency: string,
  isPresent: boolean,
  isAdmin: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue.toString())

  if (isEditing) {
    return (
      <div className="flex items-center justify-center p-1">
        <Input
          className="h-8 w-20 text-right font-black bg-background border-primary text-xs"
          type="number"
          step="0.01"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              const newValue = parseFloat(value)
              if (isNaN(newValue) || newValue < 0) return

              if (newValue === initialValue) {
                setIsEditing(false)
                return
              }

              const loader = toast.loading("Updating payment...")
              try {
                // Update specific payment in the list
                const otherPayments = entryData.userDetails
                  .filter(d => d.userId !== userId && d.paid > 0)
                  .map(d => ({ userId: d.userId, amount: d.paid }));

                const newPayments = [...otherPayments];
                if (newValue > 0) {
                  newPayments.push({ userId, amount: newValue });
                }

                const result = await updateEntry(entryId, {
                  date: entryData.date,
                  totalExpense: entryData.totalExpense,
                  shares: entryData.userDetails.filter(d => d.isPresent).map(d => ({
                    userId: d.userId,
                    amount: d.share
                  })),
                  payments: newPayments
                });

                if (result.success) {
                  toast.success("Payment updated", { id: loader });
                  setIsEditing(false);
                } else {
                  toast.error(result.error || "Failed", { id: loader });
                }
              } catch (err) {
                toast.error("Error", { id: loader });
              }
            } else if (e.key === "Escape") {
              setValue(initialValue.toString());
              setIsEditing(false);
            }
          }}
          onBlur={() => {
            setValue(initialValue.toString());
            setIsEditing(false);
          }}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all text-center",
        !isAdmin || !isPresent ? "cursor-default pointer-events-none" : "cursor-pointer group",
        initialValue > 0 ? "bg-primary/10 text-primary font-black" : "text-muted-foreground/30 hover:bg-primary/5 hover:text-primary/60"
      )}
      onClick={() => isAdmin && isPresent && setIsEditing(true)}
    >
      <span className="tabular-nums">
        {currency}{initialValue.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

function TotalExpenseEdit({ id, initialValue, date, currency, userDetails, currentUserId, isAdmin }: {
  id: string, initialValue: number, date: string, currency: string, userDetails: UserDetail[], currentUserId?: string, isAdmin: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue.toString())

  if (isEditing) {
    return (
      <div className="flex items-center justify-center p-2 gap-2">
        <Input
          className="h-10 w-24 text-right font-black bg-background border-primary focus-visible:ring-1"
          type="number"
          step="0.01"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              const newTotal = parseFloat(value)
              if (isNaN(newTotal) || newTotal <= 0) return

              if (newTotal === initialValue) {
                setIsEditing(false)
                return
              }

              const loader = toast.loading("Updating total...")
              try {
                const presentIds = userDetails.filter(d => d.isPresent).map(d => d.userId)
                const newShare = newTotal / presentIds.length

                const result = await updateEntry(id, {
                  date,
                  totalExpense: newTotal,
                  shares: presentIds.map(uid => ({ userId: uid, amount: newShare })),
                  payments: userDetails.filter(d => d.paid > 0).map(d => ({ userId: d.userId, amount: d.paid }))
                })

                if (result.success) {
                  toast.success("Total updated", { id: loader })
                  setIsEditing(false)
                } else {
                  toast.error(result.error || "Failed", { id: loader })
                }
              } catch (err) {
                toast.error("Error", { id: loader })
              }
            } else if (e.key === "Escape") {
              setValue(initialValue.toString())
              setIsEditing(false)
            }
          }}
          onBlur={() => {
            setValue(initialValue.toString())
            setIsEditing(false)
          }}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "transition-colors px-4 py-6 text-center tabular-nums h-full flex flex-col justify-center",
        !isAdmin ? "cursor-default" : "cursor-pointer hover:bg-primary/5 group"
      )}
      onClick={() => isAdmin && setIsEditing(true)}
      title={isAdmin ? "Click to edit total" : undefined}
    >
      <div>
        <span className="text-xs font-normal text-muted-foreground mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {currency}
        </span>
        {initialValue.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    </div>
  )
}

interface DailyLunchTrackerProps {
  entries: EntryData[]
  users: { id: string; name: string; linked_user_id?: string | null }[]
  currency?: string
  currentUserId?: string
  isAdmin?: boolean
}

export function DailyLunchTracker({ entries, users, currency, currentUserId, isAdmin = false }: DailyLunchTrackerProps) {
  return (
    <Card>
      <CardHeader className="pb-3 px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            Daily Lunch Tracker
            <Badge variant="secondary" className="font-normal">
              {entries.length} entries
            </Badge>
          </CardTitle>
          {isAdmin && <AddEntryDialog users={users} currency={currency} currentUserId={currentUserId} />}
        </div>
      </CardHeader>
      <CardContent className="mb-8">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5 hover:bg-primary/5 border-b-0 h-10">
                <TableHead colSpan={4} className="text-xs font-black uppercase tracking-widest text-muted-foreground/50 h-10">Entry Basics</TableHead>
                <TableHead colSpan={users.length} className="text-xs font-black uppercase tracking-widest text-emerald-500/50 text-center border-l border-primary/5 h-10">1. Attendance</TableHead>
                <TableHead className="w-0 p-0 border-r border-primary/5 h-10" />
                <TableHead colSpan={users.length} className="text-xs font-black uppercase tracking-widest text-primary/50 text-center border-l border-primary/5 h-10">2. Share Breakdown</TableHead>
                <TableHead className="w-0 p-0 border-r border-primary/5 h-10" />
                <TableHead colSpan={users.length} className="text-xs font-black uppercase tracking-widest text-amber-500/50 text-center border-l border-primary/5 h-10">3. Amount Paid</TableHead>
                <TableHead className="w-0 p-0 border-r border-primary/5 h-10" />
                <TableHead colSpan={users.length} className="text-xs font-black uppercase tracking-widest text-blue-500/50 text-center border-l border-primary/5 h-10">4. Running Balance</TableHead>
                <TableHead className="sticky right-0 z-30 h-10 bg-background/95 backdrop-blur-sm border-l border-primary/10 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)]" />
              </TableRow>
              <TableRow className="bg-primary/10 hover:bg-primary/10 h-14">
                <TableHead className="font-bold text-primary px-4 whitespace-nowrap">Date</TableHead>
                <TableHead className="font-bold text-primary whitespace-nowrap">Day</TableHead>
                <TableHead className="text-center font-bold text-primary px-4 whitespace-nowrap">Total Expense</TableHead>
                <TableHead className="font-bold text-primary border-r border-primary/5 px-4 min-w-[140px] whitespace-nowrap">Paid By</TableHead>
                {users.map((user) => (
                  <TableHead
                    key={`${user.id}-present`}
                    className="text-center font-semibold text-primary min-w-[100px] max-w-[120px]"
                  >
                    <UserLabel
                      name={user.name}
                      isMe={user.linked_user_id === currentUserId}
                      suffix="Atten"
                      className="text-[10px]"
                    />
                  </TableHead>
                ))}
                <TableHead className="w-0 p-0 border-r border-primary/20" />
                {users.map((user) => (
                  <TableHead
                    key={`${user.id}-share`}
                    className="text-center font-semibold text-primary min-w-[100px] max-w-[120px]"
                  >
                    <UserLabel
                      name={user.name}
                      isMe={user.linked_user_id === currentUserId}
                      suffix="Share"
                      className="text-[10px] text-center"
                    />
                  </TableHead>
                ))}
                <TableHead className="w-0 p-0 border-r border-primary/20" />
                {users.map((user) => (
                  <TableHead
                    key={`${user.id}-paid`}
                    className="text-center font-semibold text-primary min-w-[100px] max-w-[120px]"
                  >
                    <UserLabel
                      name={user.name}
                      isMe={user.linked_user_id === currentUserId}
                      suffix="Paid"
                      className="text-[10px] text-center"
                    />
                  </TableHead>
                ))}
                <TableHead className="w-0 p-0 border-r border-primary/20" />
                {users.map((user) => (
                  <TableHead
                    key={`${user.id}-bal`}
                    className="text-center font-semibold text-primary min-w-[100px] max-w-[120px]"
                  >
                    <UserLabel
                      name={user.name}
                      isMe={user.linked_user_id === currentUserId}
                      suffix="Bal"
                      className="text-[10px] text-center"
                    />
                  </TableHead>
                ))}
                <TableHead className="sticky right-0 z-20 text-center font-semibold text-primary bg-background/95 backdrop-blur-sm border-l border-primary/10 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8 + users.length * 4}
                    className="py-12 text-center text-muted-foreground bg-muted/5 rounded-2xl border-2 border-dashed border-border/50"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-primary/5">
                        <Receipt className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-base">No entries found</p>
                        <p className="text-xs">Add your first lunch record using the button above.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-primary/5 transition-colors group">
                    <TableCell className="font-bold whitespace-nowrap group-hover:text-primary transition-colors">
                      {formatDate(entry.date)}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground font-medium uppercase text-[10px]">
                      {getDayName(entry.date)}
                    </TableCell>
                    <TableCell className="text-center tabular-nums font-black text-lg px-4 py-6 border-l border-primary/5 p-0">
                      <TotalExpenseEdit
                        id={entry.id}
                        initialValue={entry.totalExpense}
                        date={entry.date}
                        currency={currency || "₹"}
                        userDetails={entry.userDetails}
                        currentUserId={currentUserId}
                        isAdmin={isAdmin}
                      />
                    </TableCell>
                    <TableCell className="text-center border-r border-primary/5 px-4 h-full">
                      <Select
                        disabled={!isAdmin}
                        defaultValue={entry.userDetails.find(d => d.paid > 0)?.userId || ""}
                        onValueChange={async (newPayerId) => {
                          const originalPayer = entry.userDetails.find(d => d.paid > 0);
                          if (originalPayer?.userId === newPayerId) return;

                          const loader = toast.loading("Updating payer...");
                          try {
                            const result = await updateEntry(entry.id, {
                              date: entry.date,
                              totalExpense: entry.totalExpense,
                              shares: entry.userDetails.filter(d => d.isPresent).map(d => ({
                                userId: d.userId,
                                amount: d.share
                              })),
                              payments: [{ userId: newPayerId, amount: entry.totalExpense }]
                            });

                            if (result.success) {
                              toast.success("Payer updated", { id: loader });
                            } else {
                              toast.error(result.error || "Update failed", { id: loader });
                            }
                          } catch (err) {
                            toast.error("An error occurred", { id: loader });
                          }
                        }}
                      >
                        <SelectTrigger className={cn(
                          "h-9 border-none rounded-lg px-2 focus:ring-0",
                          !isAdmin ? "bg-transparent cursor-default px-0" : "bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                        )}>
                          <SelectValue>
                            {(() => {
                              const originalPayer = entry.userDetails.find(d => d.paid > 0);
                              return originalPayer ? (
                                <UserLabel
                                  name={originalPayer.userName}
                                  isMe={originalPayer.userId === currentUserId}
                                  className="text-xs font-black truncate max-w-[80px]"
                                  marquee={false}
                                />
                              ) : (
                                <span className="text-muted-foreground/40 italic text-xs">Select Payer</span>
                              );
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/50 backdrop-blur-xl">
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id} className="rounded-lg">
                              <UserLabel
                                name={user.name}
                                isMe={user.linked_user_id === currentUserId}
                                marquee={false}
                                className="text-xs"
                              />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    {users.map((user) => {
                      const detail = entry.userDetails.find((d) => d.userId === user.id)
                      return (
                        <TableCell
                          key={`${entry.id}-${user.id}-present`}
                          className="text-center p-0"
                        >
                          <div className="flex justify-center py-2 h-full cursor-pointer hover:bg-primary/5 hover:rounded transition-colors group">
                            <Checkbox
                              disabled={!isAdmin}
                              checked={detail?.isPresent}
                              onCheckedChange={async (checked) => {
                                const isPresent = checked === true;
                                if (detail?.isPresent === isPresent) return;

                                const loader = toast.loading("Updating attendance...");
                                try {
                                  // Determine new list of present users
                                  const otherPresentIds = entry.userDetails
                                    .filter(d => d.userId !== user.id && d.isPresent)
                                    .map(d => d.userId);

                                  const newPresentIds = isPresent
                                    ? [...otherPresentIds, user.id]
                                    : otherPresentIds;

                                  if (newPresentIds.length === 0) {
                                    toast.error("At least one person must be present", { id: loader });
                                    return;
                                  }

                                  const newTotal = entry.totalExpense;
                                  const newShare = newTotal / newPresentIds.length;

                                  const result = await updateEntry(entry.id, {
                                    date: entry.date,
                                    totalExpense: newTotal,
                                    shares: newPresentIds.map(id => ({ userId: id, amount: newShare })),
                                    payments: entry.userDetails
                                      .filter(d => d.paid > 0)
                                      .map(d => ({ userId: d.userId, amount: d.paid }))
                                  });

                                  if (result.success) {
                                    toast.success("Attendance updated", { id: loader });
                                  } else {
                                    toast.error(result.error || "Update failed", { id: loader });
                                  }
                                } catch (err) {
                                  toast.error("An error occurred", { id: loader });
                                }
                              }}
                              className={cn(
                                "h-5 w-5 rounded-md border-primary/30",
                                !isAdmin && "opacity-50 cursor-default"
                              )}
                            />
                          </div>
                        </TableCell>
                      )
                    })}
                    <TableCell className="w-0 p-0 border-r border-primary/10" />
                    {users.map((user) => {
                      const detail = entry.userDetails.find((d) => d.userId === user.id)
                      return (
                        <TableCell
                          key={`${entry.id}-${user.id}-share`}
                          className="text-center tabular-nums"
                        >
                          {currency}{(detail?.share || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      )
                    })}
                    <TableCell className="w-0 p-0 border-r border-primary/10" />
                    {users.map((user) => {
                      const detail = entry.userDetails.find((d) => d.userId === user.id)
                      return (
                        <TableCell
                          key={`${entry.id}-${user.id}-paid`}
                          className="text-center tabular-nums p-2"
                        >
                          <PaymentAmountEdit
                            entryId={entry.id}
                            userId={user.id}
                            initialValue={detail?.paid || 0}
                            entryData={entry}
                            currency={currency || "₹"}
                            isPresent={!!detail?.isPresent}
                            isAdmin={isAdmin}
                          />
                        </TableCell>
                      )
                    })}
                    <TableCell className="w-0 p-0 border-r border-primary/10" />
                    {users.map((user) => {
                      const detail = entry.userDetails.find((d) => d.userId === user.id)
                      const balance = detail?.balance || 0
                      return (
                        <TableCell
                          key={`${entry.id}-${user.id}-bal`}
                          className={cn(
                            "text-center tabular-nums font-black text-sm transition-colors",
                            balance > 0
                              ? "text-emerald-500 bg-emerald-500/5"
                              : balance < 0
                                ? "text-red-500 bg-red-500/5"
                                : "text-muted-foreground/40"
                          )}
                        >
                          <span className="text-[10px] font-normal mr-0.5 opacity-50">{currency}</span>
                          {Math.abs(balance).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      )
                    })}
                    <TableCell className="sticky right-0 z-10 text-center bg-background/95 backdrop-blur-sm border-l border-primary/5 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                      {isAdmin && <EditEntryDialog entry={entry} users={users} currency={currency} currentUserId={currentUserId} />}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
