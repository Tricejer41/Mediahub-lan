import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { profile_id } = await req.json()
  const res = NextResponse.json({ ok: true })
  if (profile_id) {
    res.cookies.set("profile_id", String(profile_id), { path: "/", maxAge: 60*60*24*365 })
  }
  return res
}
