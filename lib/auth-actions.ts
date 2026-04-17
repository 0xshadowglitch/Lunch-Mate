"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  const redirectTo = formData.get("redirectTo") as string | null
  revalidatePath("/", "layout")
  redirect(redirectTo || "/admin")
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const redirectTo = formData.get("redirectTo") as string | null
  const headerList = await headers()
  const host = headerList.get("host")
  const proto = headerList.get("x-forwarded-proto") || "http"
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || `${proto}://${host}`
  const emailRedirectTo = redirectTo 
    ? `${baseUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`
    : `${baseUrl}/auth/callback`
  
  const { error, data: signupData } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If email confirmation is enabled, we should not redirect to a protected page immediately
  // as the user is not yet logged in. The frontend will handle showing the success state.
  if (signupData.user && signupData.user.identities && signupData.user.identities.length === 0) {
    // Identity already exists, user might be trying to sign up again
    return { error: "An account with this email already exists." }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Error signing out:", error)
  }

  revalidatePath("/", "layout")
  redirect("/login")
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string
  const headerList = await headers()
  const host = headerList.get("host")
  const proto = headerList.get("x-forwarded-proto") || "http"
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || `${proto}://${host}`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get("password") as string

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/login?message=Password updated successfully")
}
