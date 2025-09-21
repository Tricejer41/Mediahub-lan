import { cookies } from "next/headers"
import Link from "next/link"
import { apiBase } from "@/lib/api"

export default async function ProfileBadgeServer() {
  const jar = await cookies();                      // <- await obligatorio
  const pid = jar.get("profile_id")?.value

  if (!pid) {
    return (
      <Link href="/profiles" className="rounded-lg px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-sm">
        Elegir perfil
      </Link>
    )
  }

  const r = await fetch(`${apiBase()}/api/profiles/${pid}`, { cache: "no-store" })
  if (!r.ok) {
    return (
      <Link href="/profiles" className="rounded-lg px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-sm">
        Elegir perfil
      </Link>
    )
  }
  const p = await r.json()
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded bg-neutral-800 grid place-items-center text-sm">{p.is_kid ? "👦" : "🙂"}</div>
      <span className="text-sm">{p.name}</span>
      <Link href="/profiles" className="text-xs rounded px-2 py-1 bg-neutral-800 hover:bg-neutral-700">Cambiar</Link>
    </div>
  )
}
