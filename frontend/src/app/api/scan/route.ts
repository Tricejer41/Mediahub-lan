import { NextResponse } from "next/server"

export async function POST() {
  const base = process.env.NEXT_PUBLIC_API_BASE
  if (!base) return NextResponse.json({ ok: false, error: "API base no configurada" }, { status: 500 })

  const res = await fetch(`${base.replace(/\/$/, "")}/api/scan`, { method: "POST" })
  const data = await res.json().catch(() => ({}))

  return NextResponse.json(data, { status: res.status })
}
