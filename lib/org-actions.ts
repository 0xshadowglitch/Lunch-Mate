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
    .select("org_id, role, organizations(name, currency)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching memberships:", error)
    return []
  }

  if (!memberships) return []

  return memberships.map(m => {
    // Handle both array and object responses for the join
    const orgData = Array.isArray(m.organizations) ? m.organizations[0] : m.organizations;
    return {
      id: m.org_id,
      role: m.role,
      name: (orgData as any)?.name || "Unknown Team",
      currency: (orgData as any)?.currency || "₹"
    }
  })
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
    .select("org_id, role, organizations(name, currency)")
    .eq("user_id", user.id)

  if (activeOrgId) {
    query = query.eq("org_id", activeOrgId)
  } else {
    query = query.order("created_at", { ascending: false })
  }

  const { data: memberships, error } = await query

  if (error) {
    console.error("Error in getUserOrg:", error)
  }

  if (!memberships || memberships.length === 0) {
    // If cookie was set but not found, fallback to most recent
    if (activeOrgId) {
       const { data: fallback, error: fallbackError } = await supabase
         .from("organization_members")
         .select("org_id, role, organizations(name, currency)")
         .eq("user_id", user.id)
         .order("created_at", { ascending: false })
         .limit(1)
         .single()
       
       if (fallback) {
         const orgData = Array.isArray(fallback.organizations) ? fallback.organizations[0] : fallback.organizations;
         return {
           id: fallback.org_id,
           role: fallback.role,
           name: (orgData as any)?.name || "Unknown Team",
           currency: (orgData as any)?.currency || "₹"
         }
       }
    }
    return null
  }

  const membership = memberships[0]
  const orgData = Array.isArray(membership.organizations) ? membership.organizations[0] : membership.organizations;

  return {
    id: membership.org_id,
    role: membership.role,
    name: (orgData as any)?.name || "Unknown Team",
    currency: (orgData as any)?.currency || "₹"
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

export async function deleteOrganization(orgId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // Check if owner
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("owner_id")
    .eq("id", orgId)
    .single()

  if (orgError || !org) throw new Error("Organization not found")
  if (org.owner_id !== user.id) throw new Error("Only the owner can delete the team")

  const { error } = await supabase
    .from("organizations")
    .delete()
    .eq("id", orgId)

  if (error) return { error: error.message }

  // Clear cookie if active
  const cookieStore = await cookies()
  if (cookieStore.get("active_org_id")?.value === orgId) {
    cookieStore.delete("active_org_id")
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function updateOrganizationCurrency(orgId: string, currency: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // Verify admin/owner (policy will handle it, but we can check here too)
  const { error } = await supabase
    .from("organizations")
    .update({ currency })
    .eq("id", orgId)

  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  return { success: true }
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
