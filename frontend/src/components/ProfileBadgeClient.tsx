"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

type P = { name: string; is_kid: boolean; avatar?: string | null } | null

export default function ProfileBadgeClient() {
  const [p, setP] = useState<P>(null)

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )profile_id=([^;]+)/)
    const pid = m ? decodeURIComponent(m[1]) : null
    if (!pid) return
    const base = process.env.NEXT_PUBLIC_API_BASE!.replace(/\/$/, "")
    fetch(`${base}/api/profiles/${pid}`, { cache: "no-store" })
      .then(r => (r.ok ? r.json() : null))
      .then(setP)
      .catch(() => {})
  }, [])

  const base = process.env.NEXT_PUBLIC_API_BASE!.replace(/\/$/, "")

  if (!p) {
    return (
      <Link href="/profiles" className="rounded-lg px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-sm">
        Elegir perfil
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded overflow-hidden bg-neutral-800 grid place-items-center">
        {p.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${base}/static/avatars/${p.avatar}`}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm">{p.is_kid ? "👦" : "🙂"}</span>
        )}
      </div>
      <span className="text-sm">{p.name}</span>
      <Link href="/profiles" className="text-xs rounded px-2 py-1 bg-neutral-800 hover:bg-neutral-700">
        Cambiar
      </Link>
    </div>
  )
}
