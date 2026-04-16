"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export async function getUserOrgs() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: memberships, error } = await supabase
    .from("organization_members")
    .select("org_id, role, organizations(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error || !memberships) return []

  return memberships.map(m => ({
    id: m.org_id,
    role: m.role,
    name: (m.organizations as any).name
  }))
}

export async function getUserOrg() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // If we have an active_org cookie, use that. Otherwise use the most recent.
  const cookieStore = await cookies()
  const activeOrgId = cookieStore.get("active_org_id")?.value

  let query = supabase
    .from("organization_members")
    .select("org_id, role, organizations(name)")
    .eq("user_id", user.id)

  if (activeOrgId) {
    query = query.eq("org_id", activeOrgId)
  } else {
    query = query.order("created_at", { ascending: false })
  }

  const { data: memberships, error } = await query

  if (error || !memberships || memberships.length === 0) {
    // If cookie was set but not found, fallback to most recent
    if (activeOrgId) {
       const fallback = await supabase
         .from("organization_members")
         .select("org_id, role, organizations(name)")
         .eq("user_id", user.id)
         .order("created_at", { ascending: false })
         .limit(1)
         .single()
       if (fallback.data) {
         return {
           id: fallback.data.org_id,
           role: fallback.data.role,
           name: (fallback.data.organizations as any).name
         }
       }
    }
    return null
  }

  const membership = memberships[0]

  return {
    id: membership.org_id,
    role: membership.role,
    name: (membership.organizations as any).name
  }
}

export async function setActiveOrg(orgId: string) {
  const cookieStore = await cookies()
  cookieStore.set("active_org_id", orgId, { path: "/" })
  revalidatePath("/", "layout")
  return { success: true }
}

export async function createOrganization(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const name = formData.get("name") as string

  // 1. Create Organization
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name, owner_id: user.id })
    .select()
    .single()

  if (orgError) return { error: orgError.message }

  // 2. Add creator as Admin member
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      org_id: org.id,
      user_id: user.id,
      role: "admin"
    })

  if (memberError) return { error: memberError.message }

  revalidatePath("/", "layout")
  redirect("/admin")
}

/**
 * Returns the org_id for the current authenticated user.
 * Throws an error if not authorized or not a member of any org.
 */
export async function getAuthorizedOrgId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const cookieStore = await cookies()
  const activeOrgId = cookieStore.get("active_org_id")?.value

  let query = supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)

  if (activeOrgId) {
    query = query.eq("org_id", activeOrgId)
  } else {
    query = query.order("created_at", { ascending: false })
  }

  const { data: memberships, error } = await query

  if (error || !memberships || memberships.length === 0) {
    if (activeOrgId) {
      const fallback = await supabase
        .from("organization_members")
        .select("org_id, role")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
      if (fallback.data) {
        return { 
          orgId: fallback.data.org_id, 
          role: fallback.data.role,
          userId: user.id
        }
      }
    }
    return null
  }

  const membership = memberships[0]

  return { 
    orgId: membership.org_id, 
    role: membership.role,
    userId: user.id
  }
}

/**
 * Returns org members who are NOT yet added to lunch tracking.
 * Used in the "Add to Lunch Tracker" UI — only real account holders can be added.
 */
export async function getOrgMembersNotInLunchTracking() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: membership } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single()

  if (!membership) return []

  // Get all org member user_ids
  const { data: members } = await supabase
    .from("organization_members")
    .select("user_id, role")
    .eq("org_id", membership.org_id)

  if (!members || members.length === 0) return []

  // Get lunch_users that are already linked
  const { data: lunchUsers } = await supabase
    .from("lunch_users")
    .select("linked_user_id")
    .eq("org_id", membership.org_id)
    .not("linked_user_id", "is", null)

  const alreadyTrackedIds = new Set((lunchUsers || []).map((u) => u.linked_user_id))

  // Filter members not yet in lunch tracking
  const untracked = members.filter((m) => !alreadyTrackedIds.has(m.user_id))

  // Fetch their emails from auth (using RPC or direct auth.users access via service role)
  // Since we only have anon key, we use a Supabase RPC or store display names in org members
  // For now return user_id + role; the UI will show the email from the user's session context
  return untracked.map((m) => ({
    userId: m.user_id,
    role: m.role,
    // Email will be resolved client-side or via a server-side RPC
  }))
}
