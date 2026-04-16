"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export async function getUserOrgs() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: memberships, error } = await supabase
      .from("organization_members")
      .select("org_id, role, organizations(name, currency)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("DEBUG ERROR getUserOrgs:", JSON.stringify(error))
      return []
    }

    if (!memberships) return []

    return memberships.map(m => {
      const org = Array.isArray(m.organizations) ? m.organizations[0] : m.organizations;
      return {
        id: m.org_id,
        role: m.role,
        name: (org as any)?.name || "Lunch Mate",
        currency: (org as any)?.currency || "₹"
      }
    })
  } catch (e: any) {
    console.error("DEBUG CRASH getUserOrgs:", e.message)
    return []
  }
}

export async function getUserOrg() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Simple fetch: get all memberships and take the one matching active_org_id OR the first one
    const { data: memberships, error } = await supabase
      .from("organization_members")
      .select("org_id, role, organizations(name, currency)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
       console.error("DEBUG ERROR getUserOrg:", JSON.stringify(error))
       return null
    }

    if (!memberships || memberships.length === 0) return null

    const cookieStore = await cookies()
    const activeOrgId = cookieStore.get("active_org_id")?.value
    
    // Find the one matching the cookie, or just take the first
    const membership = (activeOrgId ? memberships.find(m => m.org_id === activeOrgId) : null) || memberships[0]
    const org = Array.isArray(membership.organizations) ? membership.organizations[0] : membership.organizations;

    return {
      id: membership.org_id,
      role: membership.role,
      name: (org as any)?.name || "Lunch Mate",
      currency: (org as any)?.currency || "₹"
    }
  } catch (e: any) {
    console.error("DEBUG CRASH getUserOrg:", e.message)
    return null
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
    .select("id")
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

  const { error } = await supabase
    .from("organizations")
    .delete()
    .eq("id", orgId)
    .eq("owner_id", user.id)

  if (error) return { error: error.message }

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

  const { error } = await supabase
    .from("organizations")
    .update({ currency })
    .eq("id", orgId)

  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function getAuthorizedOrgId() {
  const org = await getUserOrg()
  if (!org) return null
  return { 
    orgId: org.id, 
    role: org.role,
    userId: (await (await createClient()).auth.getUser()).data.user?.id
  }
}

export async function getOrgMembersNotInLunchTracking() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const auth = await getAuthorizedOrgId()
  if (!auth) return []

  const { data: members } = await supabase
    .from("organization_members")
    .select("user_id, role")
    .eq("org_id", auth.orgId)

  if (!members || members.length === 0) return []

  const { data: lunchUsers } = await supabase
    .from("lunch_users")
    .select("linked_user_id")
    .eq("org_id", auth.orgId)
    .not("linked_user_id", "is", null)

  const alreadyTrackedIds = new Set((lunchUsers || []).map((u) => u.linked_user_id))
  const untracked = members.filter((m) => !alreadyTrackedIds.has(m.user_id))

  return untracked.map((m) => ({
    userId: m.user_id,
    role: m.role,
  }))
}
