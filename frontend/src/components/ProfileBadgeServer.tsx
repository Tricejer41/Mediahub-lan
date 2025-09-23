import { cookies } from "next/headers"
import Link from "next/link"
import { apiBase } from "@/lib/api"

export default async function ProfileBadge() {
  const jar = await cookies()
  const pid = jar.get("profile_id")?.value
  if (!pid) {
    return (
      <Link href="/profiles" className="rounded-lg px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-sm">
        Elegir perfil
      </Link>
    )
  }

  const base = apiBase()
  const r = await fetch(`${base}/api/profiles/${pid}`, { cache: "no-store" })
  if (!r.ok) {
    return (
      <Link href="/profiles" className="rounded-lg px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-sm">
        Elegir perfil
      </Link>
    )
  }
  const p: { name: string; is_kid: boolean; avatar?: string | null } = await r.json()

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
