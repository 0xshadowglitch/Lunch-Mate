"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  const redirectTo = formData.get("redirectTo") as string | null
  revalidatePath("/", "layout")
  redirect(redirectTo || "/admin")
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}auth/callback?next=/reset-password`,
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
