"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getAuthorizedOrgId } from "./org-actions"

export type LunchUser = {
  id: string
  name: string
  org_id: string
  linked_user_id: string | null  // UUID of the auth.users account
  created_at: string
}

export type LunchEntry = {
  id: string
  date: string
  total_expense: number
  org_id: string
  created_at: string
}

export type LunchShare = {
  id: string
  entry_id: string
  user_id: string
  share_amount: number
  org_id: string
}

export type LunchPayment = {
  id: string
  entry_id: string
  user_id: string
  paid_amount: number
  org_id: string
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

// Fetch all users for the current org
export async function getUsers(): Promise<LunchUser[]> {
  const auth = await getAuthorizedOrgId()
  if (!auth) return []
  const { orgId } = auth
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("lunch_users")
    .select("*")
    .eq("org_id", orgId)
    .order("name")

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }
  return data || []
}

// Add a member of this org to lunch tracking (they must have an account)
// linked_user_id = their auth.users UUID; name = display label
export async function addUser(
  name: string,
  linkedUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthorizedOrgId()
    if (!auth) return { success: false, error: "No organization found" }
    const { orgId, role } = auth
    if (role !== 'admin') return { success: false, error: "Only admins can add users" }

    const supabase = await createClient()

    // Verify this user is actually a member of this org
    const { data: isMember } = await supabase
      .from("organization_members")
      .select("id")
      .eq("org_id", orgId)
      .eq("user_id", linkedUserId)
      .single()

    if (!isMember) {
      return { success: false, error: "This user doesn't belong to your team. Invite them first." }
    }

    // Check if already added to lunch tracking
    const { data: alreadyAdded } = await supabase
      .from("lunch_users")
      .select("id")
      .eq("org_id", orgId)
      .eq("linked_user_id", linkedUserId)
      .single()

    if (alreadyAdded) {
      return { success: false, error: "This member is already being tracked." }
    }

    const { error } = await supabase
      .from("lunch_users")
      .insert({ name, org_id: orgId, linked_user_id: linkedUserId })

    if (error) {
      console.error("Error adding user:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin")
    revalidatePath("/admin/users")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// Delete a user (and cascade delete their shares/payments)
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthorizedOrgId()
    if (!auth) return { success: false, error: "No organization found" }
    const { orgId, role } = auth
    if (role !== 'admin') return { success: false, error: "Only admins can delete users" }

    const supabase = await createClient()
    const { error } = await supabase
      .from("lunch_users")
      .delete()
      .eq("id", userId)
      .eq("org_id", orgId) // Extra safety

    if (error) {
      console.error("Error deleting user:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin")
    revalidatePath("/admin/users")
    revalidatePath("/user")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// Fetch all entries for the current org with optional month filter
export async function getEntries(month?: string): Promise<LunchEntry[]> {
  const auth = await getAuthorizedOrgId()
  if (!auth) return []
  const { orgId } = auth
  const supabase = await createClient()
  
  let query = supabase
    .from("lunch_entries")
    .select("*")
    .eq("org_id", orgId)
    .order("date", { ascending: false })

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

// Fetch user balances for current org
export async function getUserBalances(): Promise<UserBalance[]> {
  const auth = await getAuthorizedOrgId()
  if (!auth) return []
  const { orgId } = auth
  const supabase = await createClient()

  // Get all users in org
  const { data: users, error: usersError } = await supabase
    .from("lunch_users")
    .select("*")
    .eq("org_id", orgId)
    .order("name")

  if (usersError || !users) return []

  // Get all shares in org
  const { data: shares } = await supabase
    .from("lunch_shares")
    .select("user_id, share_amount")
    .eq("org_id", orgId)

  // Get all payments in org
  const { data: payments } = await supabase
    .from("lunch_payments")
    .select("user_id, paid_amount")
    .eq("org_id", orgId)

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

// Get entries with full details for current org
export async function getEntriesWithDetails(month?: string): Promise<EntryWithDetails[]> {
  const auth = await getAuthorizedOrgId()
  if (!auth) return []
  const { orgId } = auth
  const supabase = await createClient()

  let entriesQuery = supabase
    .from("lunch_entries")
    .select("*")
    .eq("org_id", orgId)
    .order("date", { ascending: false })

  if (month) {
    const [year, monthNum] = month.split("-")
    const startDate = `${year}-${monthNum}-01`
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0).toISOString().split("T")[0]
    entriesQuery = entriesQuery.gte("date", startDate).lte("date", endDate)
  }

  const { data: entries } = await entriesQuery
  if (!entries) return []

  const { data: users } = await supabase.from("lunch_users").select("id, name").eq("org_id", orgId)
  const userMap = new Map(users?.map((u) => [u.id, u.name]) || [])

  const entryIds = entries.map((e) => e.id)
  const { data: shares } = await supabase.from("lunch_shares").select("*").in("entry_id", entryIds).eq("org_id", orgId)
  const { data: payments } = await supabase.from("lunch_payments").select("*").in("entry_id", entryIds).eq("org_id", orgId)

  return entries.map((entry) => ({
    id: entry.id,
    date: entry.date,
    total_expense: Number(entry.total_expense),
    shares: shares?.filter((s) => s.entry_id === entry.id).map((s) => ({
      user_id: s.user_id,
      user_name: userMap.get(s.user_id) || "Unknown",
      share_amount: Number(s.share_amount),
    })) || [],
    payments: payments?.filter((p) => p.entry_id === entry.id).map((p) => ({
      user_id: p.user_id,
      user_name: userMap.get(p.user_id) || "Unknown",
      paid_amount: Number(p.paid_amount),
    })) || [],
  }))
}

// Add a new lunch entry to current org
export async function addEntry(data: {
  date: string
  totalExpense: number
  shares: { userId: string; amount: number }[]
  payments: { userId: string; amount: number }[]
}): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthorizedOrgId()
    if (!auth) return { success: false, error: "No organization found" }
    const { orgId, role } = auth
    if (role !== 'admin') return { success: false, error: "Only admins can add entries" }

    const supabase = await createClient()

    const { data: entry, error: entryError } = await supabase
      .from("lunch_entries")
      .insert({ date: data.date, total_expense: data.totalExpense, org_id: orgId })
      .select()
      .single()

    if (entryError || !entry) return { success: false, error: entryError?.message }

    if (data.shares.length > 0) {
      await supabase.from("lunch_shares").insert(
        data.shares.map((s) => ({ entry_id: entry.id, user_id: s.userId, share_amount: s.amount, org_id: orgId }))
      )
    }

    if (data.payments.length > 0) {
      await supabase.from("lunch_payments").insert(
        data.payments.map((p) => ({ entry_id: entry.id, user_id: p.userId, paid_amount: p.amount, org_id: orgId }))
      )
    }

    revalidatePath("/admin")
    revalidatePath("/user")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// Delete an entry
export async function deleteEntry(entryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthorizedOrgId()
    if (!auth) return { success: false, error: "No organization found" }
    const { orgId, role } = auth
    if (role !== 'admin') return { success: false, error: "Only admins can delete entries" }

    const supabase = await createClient()
    const { error } = await supabase
      .from("lunch_entries")
      .delete()
      .eq("id", entryId)
      .eq("org_id", orgId)

    if (error) return { success: false, error: error.message }

    revalidatePath("/admin")
    revalidatePath("/user")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// Get summary statistics for current org
export async function getStats() {
  const auth = await getAuthorizedOrgId()
  if (!auth) {
    return { totalExpense: 0, totalPaid: 0, netBalance: 0, totalEntries: 0 }
  }
  const { orgId } = auth
  const supabase = await createClient()

  const { data: entries } = await supabase.from("lunch_entries").select("total_expense").eq("org_id", orgId)
  const { data: payments } = await supabase.from("lunch_payments").select("paid_amount").eq("org_id", orgId)

  const totalExpense = entries?.reduce((sum, e) => sum + Number(e.total_expense), 0) || 0
  const totalPaid = payments?.reduce((sum, p) => sum + Number(p.paid_amount), 0) || 0

  return {
    totalExpense,
    totalPaid,
    netBalance: totalPaid - totalExpense,
    totalEntries: entries?.length || 0,
  }
}

// Get spending trend data for current org
export async function getSpendingTrend(month?: string) {
  const entries = await getEntries(month)
  return entries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      date: entry.date,
      expense: Number(entry.total_expense),
    }))
}

// Get contribution data for current org
export async function getContributionData() {
  const balances = await getUserBalances()
  return balances.map((b) => ({
    name: b.name,
    paid: b.totalPaid,
    shares: b.totalShares,
  }))
}

// Get weekly summary data for current org
export async function getWeeklySummary() {
  const auth = await getAuthorizedOrgId()
  if (!auth) return { weeks: [], users: [], overallBalances: [] }
  const { orgId } = auth
  const supabase = await createClient()

  const { data: entries } = await supabase.from("lunch_entries").select("*").eq("org_id", orgId).order("date", { ascending: true })
  const { data: users } = await supabase.from("lunch_users").select("id, name").eq("org_id", orgId).order("name")
  const { data: shares } = await supabase.from("lunch_shares").select("*").eq("org_id", orgId)
  const { data: payments } = await supabase.from("lunch_payments").select("*").eq("org_id", orgId)

  if (!entries || !users) return { weeks: [], users: [], overallBalances: [] }

  const getWeekStart = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    const weekStart = new Date(date.setDate(diff))
    return weekStart.toISOString().split("T")[0]
  }

  const weekMap = new Map<string, any>()

  entries.forEach((entry) => {
    const weekStart = getWeekStart(entry.date)
    if (!weekMap.has(weekStart)) {
      weekMap.set(weekStart, { weekStart, totalExpense: 0, entries: [] })
    }
    const week = weekMap.get(weekStart)
    week.totalExpense += Number(entry.total_expense)
    week.entries.push(entry)
  })

  const weeks = Array.from(weekMap.values()).map((week) => {
    const entryIds = week.entries.map((e: any) => e.id)
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

    const weekEntryDetails = week.entries.map((entry: any) => {
      const entryShares = weekShares.filter((s) => s.entry_id === entry.id)
      const entryPayments = weekPayments.filter((p) => p.entry_id === entry.id)

      const userDetails = users.map((user) => {
        const share = entryShares.find((s) => s.user_id === user.id)
        const payment = entryPayments.find((p) => p.user_id === user.id)
        return {
          userId: user.id,
          userName: user.name,
          isPresent: !!share,
          share: share ? Number(share.share_amount) : 0,
          paid: payment ? Number(payment.paid_amount) : 0,
        }
      })

      return {
        id: entry.id,
        date: entry.date,
        totalExpense: Number(entry.total_expense),
        userDetails,
      }
    })

    return {
      weekStart: week.weekStart,
      totalExpense: week.totalExpense,
      userStats,
      entries: weekEntryDetails,
    }
  }).sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime())

  const overallBalances = users.map((user) => {
    const userShares = shares?.filter((s) => s.user_id === user.id) || []
    const userPayments = payments?.filter((p) => p.user_id === user.id) || []
    return {
      userId: user.id,
      userName: user.name,
      balance: userPayments.reduce((sum, p) => sum + Number(p.paid_amount), 0) - userShares.reduce((sum, s) => sum + Number(s.share_amount), 0),
    }
  })

  return { weeks, users: users.map(u => ({ id: u.id, name: u.name })), overallBalances }
}

// Get monthly summary data for current org
export async function getMonthlySummary() {
  const auth = await getAuthorizedOrgId()
  if (!auth) return { months: [], users: [] }
  const { orgId } = auth
  const supabase = await createClient()

  const { data: entries } = await supabase.from("lunch_entries").select("*").eq("org_id", orgId).order("date", { ascending: true })
  const { data: users } = await supabase.from("lunch_users").select("id, name").eq("org_id", orgId).order("name")
  const { data: shares } = await supabase.from("lunch_shares").select("*").eq("org_id", orgId)
  const { data: payments } = await supabase.from("lunch_payments").select("*").eq("org_id", orgId)

  if (!entries || !users) return { months: [], users: [] }

  const getMonthKey = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
  }

  const monthMap = new Map<string, any>()
  entries.forEach((entry) => {
    const key = getMonthKey(entry.date)
    if (!monthMap.has(key)) monthMap.set(key, { monthKey: key, totalExpense: 0, entries: [] })
    const month = monthMap.get(key)
    month.totalExpense += Number(entry.total_expense)
    month.entries.push(entry)
  })

  const months = Array.from(monthMap.values()).map((month) => {
    const entryIds = month.entries.map((e: any) => e.id)
    const userStats = users.map((user) => {
      const userShares = shares?.filter((s) => entryIds.includes(s.entry_id) && s.user_id === user.id) || []
      const userPayments = payments?.filter((p) => entryIds.includes(p.entry_id) && p.user_id === user.id) || []
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
    const monthEntryDetails = month.entries.map((entry: any) => {
      const entryShares = shares?.filter((s) => s.entry_id === entry.id) || []
      const entryPayments = payments?.filter((p) => p.entry_id === entry.id) || []

      const userDetails = users.map((user) => {
        const share = entryShares.find((s) => s.user_id === user.id)
        const payment = entryPayments.find((p) => p.user_id === user.id)
        return {
          userId: user.id,
          userName: user.name,
          isPresent: !!share,
          share: share ? Number(share.share_amount) : 0,
          paid: payment ? Number(payment.paid_amount) : 0,
        }
      })

      return {
        id: entry.id,
        date: entry.date,
        totalExpense: Number(entry.total_expense),
        userDetails,
      }
    })

    return { monthKey: month.monthKey, totalExpense: month.totalExpense, userStats, entries: monthEntryDetails }
  }).sort((a, b) => b.monthKey.localeCompare(a.monthKey))

  return { months, users: users.map(u => ({ id: u.id, name: u.name })) }
}

export async function getDailyLunchData() {
  const auth = await getAuthorizedOrgId()
  if (!auth) return { entries: [], users: [] }
  const { orgId } = auth
  const supabase = await createClient()

  const { data: entries } = await supabase.from("lunch_entries").select("*").eq("org_id", orgId).order("date", { ascending: false })
  const { data: users } = await supabase.from("lunch_users").select("id, name").eq("org_id", orgId).order("name")
  const { data: shares } = await supabase.from("lunch_shares").select("*").eq("org_id", orgId)
  const { data: payments } = await supabase.from("lunch_payments").select("*").eq("org_id", orgId)

  if (!entries || !users) return { entries: [], users: [] }

  const runningBalances = new Map<string, number>()
  users.forEach((u) => runningBalances.set(u.id, 0))

  const sortedEntries = [...entries].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const entriesWithDetails = sortedEntries.map((entry) => {
    const entryShares = shares?.filter((s) => s.entry_id === entry.id) || []
    const entryPayments = payments?.filter((p) => p.entry_id === entry.id) || []

    const userDetails = users.map((user) => {
      const share = entryShares.find((s) => s.user_id === user.id)
      const payment = entryPayments.find((p) => p.user_id === user.id)
      const shareAmount = share ? Number(share.share_amount) : 0
      const paidAmount = payment ? Number(payment.paid_amount) : 0
      const prev = runningBalances.get(user.id) || 0
      const next = prev + paidAmount - shareAmount
      runningBalances.set(user.id, next)

      return {
        userId: user.id,
        userName: user.name,
        isPresent: shareAmount > 0,
        share: shareAmount,
        paid: paidAmount,
        balance: next,
      }
    })

    return { id: entry.id, date: entry.date, totalExpense: Number(entry.total_expense), userDetails }
  })

  return { entries: entriesWithDetails.reverse(), users: users.map(u => ({ id: u.id, name: u.name })) }
}
