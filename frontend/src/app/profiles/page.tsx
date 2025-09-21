"use client"

import { useEffect, useState } from "react"

type Profile = { id:number; name:string; avatar?:string|null; is_kid:boolean }

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [name, setName] = useState("")
  const [isKid, setIsKid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const MAX = 4

  const BASE = process.env.NEXT_PUBLIC_API_BASE!.replace(/\/$/, "")

  const load = async () => {
    const r = await fetch(`${BASE}/api/profiles`, { cache: "no-store" })
    setProfiles(await r.json())
  }
  useEffect(() => { load() }, [])

  const select = async (id: number) => {
    await fetch("/api/profile/select", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ profile_id: id }) })
    window.location.href = "/"
  }

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null)
    if (!name.trim()) return
    const r = await fetch(`${BASE}/api/profiles`, {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ name, is_kid: isKid })
    })
    if (!r.ok) {
      const d = await r.json().catch(() => ({}))
      setError(d.detail || "No se pudo crear el perfil")
    } else {
      setName(""); setIsKid(false); load()
    }
  }

  const del = async (id:number) => {
    if (!confirm("¿Eliminar perfil? Se perderá su progreso.")) return
    await fetch(`${BASE}/api/profiles/${id}`, { method:"DELETE" })
    load()
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-8">¿Quién está viendo?</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center mb-10">
          {profiles.map(p => (
            <button key={p.id} onClick={() => select(p.id)} className="group text-center">
              <div className="w-28 h-28 rounded-lg bg-neutral-800 group-hover:bg-neutral-700 grid place-items-center text-3xl">
                {/* Avatar simple por ahora */}
                {p.is_kid ? "🧒" : "🙂"}
              </div>
              <div className="mt-2">{p.name}</div>
            </button>
          ))}

          {profiles.length < MAX && (
            <details className="col-span-2 md:col-span-1">
              <summary className="cursor-pointer opacity-80 hover:opacity-100">➕ Añadir perfil</summary>
              <form onSubmit={add} className="mt-3 space-y-2">
                <input className="w-full rounded-lg px-3 py-2 bg-neutral-900 border border-neutral-800" placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} />
                <label className="flex items-center gap-2 text-sm opacity-80">
                  <input type="checkbox" checked={isKid} onChange={e=>setIsKid(e.target.checked)} /> Perfil infantil
                </label>
                {error && <div className="text-sm text-red-400">{error}</div>}
                <button className="rounded-lg px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700">Crear</button>
              </form>
            </details>
          )}
        </div>

        {profiles.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={() => fetch("/api/profile/clear", { method:"POST" }).then(()=>location.reload())}
              className="text-sm opacity-70 hover:opacity-100"
            >
              Gestionar (eliminar perfiles)
            </button>
          </div>
        )}

        {/* Gestión sencilla: listar y permitir borrar */}
        {profiles.length > 0 && (
          <div className="mt-6 grid gap-2">
            {profiles.map(p => (
              <div key={p.id} className="flex items-center gap-3 text-sm opacity-80">
                <span className="w-8 h-8 rounded bg-neutral-800 grid place-items-center">{p.is_kid ? "🧒" : "🙂"}</span>
                <span className="flex-1">{p.name}</span>
                <button onClick={() => del(p.id)} className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800">Eliminar</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
