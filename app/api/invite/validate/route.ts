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

// GET /api/invite/validate?token=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(requestUrl(req))
    const token = searchParams.get("token")
    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Look up invite by raw token
    const { data: invite, error: fetchError } = await supabase
      .from("invites")
      .select("*, organizations(name)")
      .eq("token_hash", token)
      .single()

    if (fetchError || !invite) {
      return NextResponse.json({ error: "Invalid invite link." }, { status: 404 })
    }

    const orgName = Array.isArray(invite.organizations) ? invite.organizations[0].name : invite.organizations?.name || "Team"

    // 2. Check if already used
    if (invite.used) {
        return NextResponse.json({ error: "This invite has already been used.", orgName }, { status: 410 })
    }

    // 3. Check if expired
    if (new Date(invite.expires_at) < new Date()) {
        return NextResponse.json({ error: "This invite has expired.", orgName }, { status: 410 })
    }

    // 4. If logged in, check if already a member
    if (user) {
        const { data: existing } = await supabase
          .from("organization_members")
          .select("id")
          .eq("user_id", user.id)
          .eq("org_id", invite.org_id)
          .single()

        if (existing) {
          return NextResponse.json({ 
            error: "You are already a member of this team.", 
            orgName,
            alreadyMember: true 
          }, { status: 400 })
        }
    }

    return NextResponse.json({
      valid: true,
      orgName
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function requestUrl(req: NextRequest) {
    return req.url
}
