import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"

function sha256(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// POST /api/invite/accept
// Body: { token: string }
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Auth: User MUST be logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "You must be logged in to accept an invite." }, { status: 401 })
    }

    const body = await req.json()
    const { token } = body
    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 })
    }

    // 2. Find invite by raw token
    const { data: invite, error: fetchError } = await supabase
      .from("invites")
      .select("*")
      .eq("token_hash", token)
      .single()
    
    if (fetchError || !invite) {
      return NextResponse.json({ error: "Invalid invite link." }, { status: 404 })
    }

    // 4. Check: not already used
    if (invite.used) {
      return NextResponse.json({ error: "This invite has already been used." }, { status: 410 })
    }

    // 5. Check: not expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: "This invite has expired." }, { status: 410 })
    }

    // 6. Email binding: if invite has email, check it matches the logged-in user
    if (invite.email && invite.email.toLowerCase() !== user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: `This invite is restricted to ${invite.email}. Please log in with that account.` },
        { status: 403 }
      )
    }

    // 7. Check if user is already a member of this org
    const { data: existing } = await supabase
      .from("organization_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("org_id", invite.org_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: "You are already a member of this team." }, { status: 409 })
    }

    // 8. Add user to the organization as a 'member' (read-only role)
    const { error: memberError } = await supabase.from("organization_members").insert({
      org_id: invite.org_id,
      user_id: user.id,
      role: "member",
    })

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    // NEW: Automatically add them to lunch_users so they show up in tracker lists
    // We try to get their name from metadata, fallback to email prefix
    const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "New Member";
    
    await supabase.from("lunch_users").insert({
      name: displayName,
      org_id: invite.org_id,
      linked_user_id: user.id
    })

    // 9. Mark invite as USED ONLY IF it was restricted to a specific email
    // Public links (no email) are now MULTI-USE by default
    if (invite.email) {
      await supabase.from("invites").update({ used: true }).eq("id", invite.id)
    }

    // 10. Return the org info so frontend can redirect
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", invite.org_id)
      .single()

    return NextResponse.json({
      success: true,
      orgName: org?.name || "Team",
      orgId: invite.org_id,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
