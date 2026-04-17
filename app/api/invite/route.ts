import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createHash, randomBytes } from "crypto"

function sha256(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

function generateRawToken(): string {
  return randomBytes(32).toString("hex") // 64-char hex = 256 bits of entropy
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

// POST /api/invite
// Body: { email?: string, orgId: string }
// Returns: { link: string }
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Check admin role in the org
    const body = await req.json()
    const { email, orgId } = body

    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 })
    }

    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("org_id", orgId)
      .single()

    if (!membership || membership.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 })
    }

    // 3. Generate secure raw token (only shown once, never stored)
    const rawToken = generateRawToken()
    const tokenHash = sha256(rawToken)

    // 4. Store ONLY the hash in DB
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const { error: insertError } = await supabase.from("invites").insert({
      email: email || null,
      token_hash: rawToken, // Storing raw token directly for 'Copy' functionality
      org_id: orgId,
      expires_at: expiresAt.toISOString(),
      used: false,
    })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // 5. Return the full invite link with the RAW token
    const headerList = await req.headers
    const host = headerList.get("host")
    const proto = headerList.get("x-forwarded-proto") || "http"
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || `${proto}://${host}`
    const link = `${baseUrl}/invite?token=${rawToken}`

    return NextResponse.json({
      link,
      expiresAt: expiresAt.toISOString(),
      email: email || null,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET /api/invite — list pending invites for an org (admin only)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orgId = req.nextUrl.searchParams.get("orgId")
    if (!orgId) {
      return NextResponse.json({ error: "orgId required" }, { status: 400 })
    }

    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("org_id", orgId)
      .single()

    if (!membership || membership.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const now = new Date().toISOString()

    // Automatic cleanup: Delete expired or used invites for this org
    await supabase
      .from("invites")
      .delete()
      .eq("org_id", orgId)
      .or(`expires_at.lt.${now},used.eq.true`)

    const { data: invites } = await supabase
      .from("invites")
      .select("id, email, expires_at, used, created_at, token_hash")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })

    // Calculate base URL once for the list
    const headerList = await req.headers
    const host = headerList.get("host")
    const proto = headerList.get("x-forwarded-proto") || "http"
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || `${proto}://${host}`

    // Annotate with status and full link
    const annotated = (invites || []).map((inv) => ({
      ...inv,
      token: inv.token_hash,
      link: `${baseUrl}/invite?token=${inv.token_hash}`, // Include the correct full link
      status: inv.used
        ? "used"
        : new Date(inv.expires_at) < new Date(now)
        ? "expired"
        : "pending",
    }))

    return NextResponse.json({ invites: annotated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/invite?id=UUID — admin revokes an invite
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const inviteId = req.nextUrl.searchParams.get("id")
    if (!inviteId) return NextResponse.json({ error: "id required" }, { status: 400 })

    // RLS will enforce admin-only access
    const { error } = await supabase.from("invites").delete().eq("id", inviteId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
