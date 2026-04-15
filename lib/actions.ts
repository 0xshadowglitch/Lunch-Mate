"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type LunchUser = {
  id: string
  name: string
  created_at: string
}

export type LunchEntry = {
  id: string
  date: string
  total_expense: number
  created_at: string
}

export type LunchShare = {
  id: string
  entry_id: string
  user_id: string
  share_amount: number
}

export type LunchPayment = {
  id: string
  entry_id: string
  user_id: string
  paid_amount: number
}

export type UserBalance = {
  id: string
  name: string
  totalPaid: number
  totalShares: number
  balance: number
  daysPresent: number
}

export type EntryWithDetails = {
  id: string
  date: string
  total_expense: number
  shares: { user_id: string; user_name: string; share_amount: number }[]
  payments: { user_id: string; user_name: string; paid_amount: number }[]
}

// Fetch all users
export async function getUsers(): Promise<LunchUser[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("lunch_users")
    .select("*")
    .order("name")

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }
  return data || []
}

// Add a new user
export async function addUser(name: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("lunch_users").insert({ name })

  if (error) {
    console.error("Error adding user:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/users")
  return { success: true }
}

// Delete a user (and cascade delete their shares/payments)
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("lunch_users").delete().eq("id", userId)

  if (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/users")
  revalidatePath("/user")
  return { success: true }
}

// Fetch all entries with optional month filter
export async function getEntries(month?: string): Promise<LunchEntry[]> {
  const supabase = await createClient()
  let query = supabase.from("lunch_entries").select("*").order("date", { ascending: false })

  if (month) {
    const [year, monthNum] = month.split("-")
    const startDate = `${year}-${monthNum}-01`
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0).toISOString().split("T")[0]
    query = query.gte("date", startDate).lte("date", endDate)
  }

  const { data, error } = await query
  if (error) {
    console.error("Error fetching entries:", error)
    return []
  }
  return data || []
}

// Fetch user balances
export async function getUserBalances(): Promise<UserBalance[]> {
  const supabase = await createClient()

  // Get all users
  const { data: users, error: usersError } = await supabase
    .from("lunch_users")
    .select("*")
    .order("name")

  if (usersError || !users) {
    console.error("Error fetching users:", usersError)
    return []
  }

  // Get all shares
  const { data: shares, error: sharesError } = await supabase
    .from("lunch_shares")
    .select("user_id, share_amount")

  if (sharesError) {
    console.error("Error fetching shares:", sharesError)
    return []
  }

  // Get all payments
  const { data: payments, error: paymentsError } = await supabase
    .from("lunch_payments")
    .select("user_id, paid_amount")

  if (paymentsError) {
    console.error("Error fetching payments:", paymentsError)
    return []
  }

  // Calculate balances
  return users.map((user) => {
    const userShares = shares?.filter((s) => s.user_id === user.id) || []
    const userPayments = payments?.filter((p) => p.user_id === user.id) || []

    const totalShares = userShares.reduce((sum, s) => sum + Number(s.share_amount), 0)
    const totalPaid = userPayments.reduce((sum, p) => sum + Number(p.paid_amount), 0)

    return {
      id: user.id,
      name: user.name,
      totalPaid,
      totalShares,
      balance: totalPaid - totalShares,
      daysPresent: userShares.length,
    }
  })
}

// Get entries with full details (shares and payments)
export async function getEntriesWithDetails(month?: string): Promise<EntryWithDetails[]> {
  const supabase = await createClient()

  // Get entries
  let entriesQuery = supabase.from("lunch_entries").select("*").order("date", { ascending: false })

  if (month) {
    const [year, monthNum] = month.split("-")
    const startDate = `${year}-${monthNum}-01`
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0).toISOString().split("T")[0]
    entriesQuery = entriesQuery.gte("date", startDate).lte("date", endDate)
  }

  const { data: entries, error: entriesError } = await entriesQuery
  if (entriesError || !entries) {
    console.error("Error fetching entries:", entriesError)
    return []
  }

  // Get users
  const { data: users } = await supabase.from("lunch_users").select("id, name")
  const userMap = new Map(users?.map((u) => [u.id, u.name]) || [])

  // Get shares for these entries
  const entryIds = entries.map((e) => e.id)
  const { data: shares } = await supabase
    .from("lunch_shares")
    .select("*")
    .in("entry_id", entryIds)

  const { data: payments } = await supabase
    .from("lunch_payments")
    .select("*")
    .in("entry_id", entryIds)

  return entries.map((entry) => ({
    id: entry.id,
    date: entry.date,
    total_expense: Number(entry.total_expense),
    shares:
      shares
        ?.filter((s) => s.entry_id === entry.id)
        .map((s) => ({
          user_id: s.user_id,
          user_name: userMap.get(s.user_id) || "Unknown",
          share_amount: Number(s.share_amount),
        })) || [],
    payments:
      payments
        ?.filter((p) => p.entry_id === entry.id)
        .map((p) => ({
          user_id: p.user_id,
          user_name: userMap.get(p.user_id) || "Unknown",
          paid_amount: Number(p.paid_amount),
        })) || [],
  }))
}

// Add a new lunch entry
export async function addEntry(data: {
  date: string
  totalExpense: number
  shares: { userId: string; amount: number }[]
  payments: { userId: string; amount: number }[]
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Insert entry
  const { data: entry, error: entryError } = await supabase
    .from("lunch_entries")
    .insert({ date: data.date, total_expense: data.totalExpense })
    .select()
    .single()

  if (entryError || !entry) {
    console.error("Error adding entry:", entryError)
    return { success: false, error: entryError?.message }
  }

  // Insert shares
  if (data.shares.length > 0) {
    const { error: sharesError } = await supabase.from("lunch_shares").insert(
      data.shares.map((s) => ({
        entry_id: entry.id,
        user_id: s.userId,
        share_amount: s.amount,
      }))
    )
    if (sharesError) {
      console.error("Error adding shares:", sharesError)
      return { success: false, error: sharesError.message }
    }
  }

  // Insert payments
  if (data.payments.length > 0) {
    const { error: paymentsError } = await supabase.from("lunch_payments").insert(
      data.payments.map((p) => ({
        entry_id: entry.id,
        user_id: p.userId,
        paid_amount: p.amount,
      }))
    )
    if (paymentsError) {
      console.error("Error adding payments:", paymentsError)
      return { success: false, error: paymentsError.message }
    }
  }

  revalidatePath("/admin")
  revalidatePath("/user")
  return { success: true }
}

// Delete an entry
export async function deleteEntry(entryId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("lunch_entries").delete().eq("id", entryId)

  if (error) {
    console.error("Error deleting entry:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin")
  revalidatePath("/user")
  return { success: true }
}

// Get summary statistics
export async function getStats() {
  const supabase = await createClient()

  const { data: entries } = await supabase.from("lunch_entries").select("total_expense")
  const { data: payments } = await supabase.from("lunch_payments").select("paid_amount")

  const totalExpense = entries?.reduce((sum, e) => sum + Number(e.total_expense), 0) || 0
  const totalPaid = payments?.reduce((sum, p) => sum + Number(p.paid_amount), 0) || 0
  const totalEntries = entries?.length || 0

  return {
    totalExpense,
    totalPaid,
    netBalance: totalPaid - totalExpense,
    totalEntries,
  }
}

// Get spending trend data
export async function getSpendingTrend(month?: string) {
  const entries = await getEntries(month)
  return entries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      date: entry.date,
      expense: Number(entry.total_expense),
    }))
}

// Get contribution data (paid vs shares per user)
export async function getContributionData() {
  const balances = await getUserBalances()
  return balances.map((b) => ({
    name: b.name,
    paid: b.totalPaid,
    shares: b.totalShares,
  }))
}

// Get weekly summary data
export async function getWeeklySummary() {
  const supabase = await createClient()

  // Get all entries
  const { data: entries } = await supabase
    .from("lunch_entries")
    .select("*")
    .order("date", { ascending: true })

  // Get all users
  const { data: users } = await supabase
    .from("lunch_users")
    .select("id, name")
    .order("name")

  // Get all shares and payments
  const { data: shares } = await supabase.from("lunch_shares").select("*")
  const { data: payments } = await supabase.from("lunch_payments").select("*")

  if (!entries || !users) return { weeks: [], users: [], overallBalances: [] }

  // Helper to get week start (Monday)
  const getWeekStart = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    const weekStart = new Date(date.setDate(diff))
    return weekStart.toISOString().split("T")[0]
  }

  // Group entries by week
  const weekMap = new Map<string, {
    weekStart: string
    totalExpense: number
    entries: typeof entries
  }>()

  entries.forEach((entry) => {
    const weekStart = getWeekStart(entry.date)
    if (!weekMap.has(weekStart)) {
      weekMap.set(weekStart, { weekStart, totalExpense: 0, entries: [] })
    }
    const week = weekMap.get(weekStart)!
    week.totalExpense += Number(entry.total_expense)
    week.entries.push(entry)
  })

  // Calculate per-user data for each week
  const weeks = Array.from(weekMap.values()).map((week) => {
    const entryIds = week.entries.map((e) => e.id)
    const weekShares = shares?.filter((s) => entryIds.includes(s.entry_id)) || []
    const weekPayments = payments?.filter((p) => entryIds.includes(p.entry_id)) || []

    const userStats = users.map((user) => {
      const userShares = weekShares.filter((s) => s.user_id === user.id)
      const userPayments = weekPayments.filter((p) => p.user_id === user.id)
      const totalShares = userShares.reduce((sum, s) => sum + Number(s.share_amount), 0)
      const totalPaid = userPayments.reduce((sum, p) => sum + Number(p.paid_amount), 0)

      return {
        userId: user.id,
        userName: user.name,
        paid: totalPaid,
        shares: totalShares,
        balance: totalPaid - totalShares,
      }
    })

    return {
      weekStart: week.weekStart,
      totalExpense: week.totalExpense,
      userStats,
    }
  }).sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime())

  // Calculate overall balances
  const overallBalances = users.map((user) => {
    const userShares = shares?.filter((s) => s.user_id === user.id) || []
    const userPayments = payments?.filter((p) => p.user_id === user.id) || []
    const totalShares = userShares.reduce((sum, s) => sum + Number(s.share_amount), 0)
    const totalPaid = userPayments.reduce((sum, p) => sum + Number(p.paid_amount), 0)

    return {
      userId: user.id,
      userName: user.name,
      balance: totalPaid - totalShares,
    }
  })

  return {
    weeks,
    users: users.map((u) => ({ id: u.id, name: u.name })),
    overallBalances,
  }
}

// Get monthly summary data
export async function getMonthlySummary() {
  const supabase = await createClient()

  // Get all entries
  const { data: entries } = await supabase
    .from("lunch_entries")
    .select("*")
    .order("date", { ascending: true })

  // Get all users
  const { data: users } = await supabase
    .from("lunch_users")
    .select("id, name")
    .order("name")

  // Get all shares and payments
  const { data: shares } = await supabase.from("lunch_shares").select("*")
  const { data: payments } = await supabase.from("lunch_payments").select("*")

  if (!entries || !users) return { months: [], users: [] }

  // Helper to get month key
  const getMonthKey = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  }

  // Group entries by month
  const monthMap = new Map<string, {
    monthKey: string
    totalExpense: number
    entries: typeof entries
  }>()

  entries.forEach((entry) => {
    const monthKey = getMonthKey(entry.date)
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { monthKey, totalExpense: 0, entries: [] })
    }
    const month = monthMap.get(monthKey)!
    month.totalExpense += Number(entry.total_expense)
    month.entries.push(entry)
  })

  // Calculate per-user data for each month
  const months = Array.from(monthMap.values()).map((month) => {
    const entryIds = month.entries.map((e) => e.id)
    const monthShares = shares?.filter((s) => entryIds.includes(s.entry_id)) || []
    const monthPayments = payments?.filter((p) => entryIds.includes(p.entry_id)) || []

    const userStats = users.map((user) => {
      const userShares = monthShares.filter((s) => s.user_id === user.id)
      const userPayments = monthPayments.filter((p) => p.user_id === user.id)
      const totalShares = userShares.reduce((sum, s) => sum + Number(s.share_amount), 0)
      const totalPaid = userPayments.reduce((sum, p) => sum + Number(p.paid_amount), 0)

      return {
        userId: user.id,
        userName: user.name,
        paid: totalPaid,
        shares: totalShares,
        balance: totalPaid - totalShares,
      }
    })

    return {
      monthKey: month.monthKey,
      totalExpense: month.totalExpense,
      userStats,
    }
  }).sort((a, b) => b.monthKey.localeCompare(a.monthKey))

  return {
    months,
    users: users.map((u) => ({ id: u.id, name: u.name })),
  }
}

// Get daily entries with full details for the lunch tracker view
export async function getDailyLunchData() {
  const supabase = await createClient()

  // Get all entries
  const { data: entries } = await supabase
    .from("lunch_entries")
    .select("*")
    .order("date", { ascending: false })

  // Get all users
  const { data: users } = await supabase
    .from("lunch_users")
    .select("id, name")
    .order("name")

  // Get all shares and payments
  const { data: shares } = await supabase.from("lunch_shares").select("*")
  const { data: payments } = await supabase.from("lunch_payments").select("*")

  if (!entries || !users) return { entries: [], users: [] }

  // Calculate running balances
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const runningBalances = new Map<string, number>()
  users.forEach((u) => runningBalances.set(u.id, 0))

  const entriesWithDetails = sortedEntries.map((entry) => {
    const entryShares = shares?.filter((s) => s.entry_id === entry.id) || []
    const entryPayments = payments?.filter((p) => p.entry_id === entry.id) || []

    const userDetails = users.map((user) => {
      const share = entryShares.find((s) => s.user_id === user.id)
      const payment = entryPayments.find((p) => p.user_id === user.id)
      const shareAmount = share ? Number(share.share_amount) : 0
      const paidAmount = payment ? Number(payment.paid_amount) : 0
      const isPresent = shareAmount > 0

      // Update running balance
      const prevBalance = runningBalances.get(user.id) || 0
      const newBalance = prevBalance + paidAmount - shareAmount
      runningBalances.set(user.id, newBalance)

      return {
        userId: user.id,
        userName: user.name,
        isPresent,
        share: shareAmount,
        paid: paidAmount,
        balance: newBalance,
      }
    })

    return {
      id: entry.id,
      date: entry.date,
      totalExpense: Number(entry.total_expense),
      userDetails,
    }
  })

  // Reverse to show newest first
  return {
    entries: entriesWithDetails.reverse(),
    users: users.map((u) => ({ id: u.id, name: u.name })),
  }
}
