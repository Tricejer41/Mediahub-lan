"use client"

import { useEffect, useState } from "react"
import AvatarPicker from "@/components/AvatarPicker"

type Profile = { id: number; name: string; avatar?: string | null; is_kid: boolean }

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [name, setName] = useState("")
  const [isKid, setIsKid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pickerFor, setPickerFor] = useState<number | null>(null)
  const MAX = 4

  const BASE = process.env.NEXT_PUBLIC_API_BASE!.replace(/\/$/, "")

  const load = async () => {
    const r = await fetch(`${BASE}/api/profiles`, { cache: "no-store" })
    setProfiles(await r.json())
  }
  useEffect(() => { load() }, []) // cargar al entrar

  const select = async (id: number) => {
    await fetch("/api/profile/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id: id }),
    })
    window.location.href = "/"
  }

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null)
    if (!name.trim()) return
    const r = await fetch(`${BASE}/api/profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, is_kid: isKid }),
    })
    if (!r.ok) {
      const d = await r.json().catch(() => ({}))
      setError(d.detail || "No se pudo crear el perfil")
    } else {
      setName(""); setIsKid(false); load()
    }
  }

  const del = async (id: number) => {
    if (!confirm("¿Eliminar perfil? Se perderá su progreso.")) return
    await fetch(`${BASE}/api/profiles/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-8">¿Quién está viendo?</h1>

        {/* Tarjetas de perfiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center mb-10">
          {profiles.map((p) => (
            <div key={p.id} className="group text-center">
              {/* Al hacer click en la tarjeta, selecciona el perfil */}
              <button onClick={() => select(p.id)} className="block">
                <div className="w-28 h-28 rounded-lg overflow-hidden bg-neutral-800 group-hover:bg-neutral-700 grid place-items-center">
                  {p.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${BASE}/static/avatars/${p.avatar}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">{p.is_kid ? "🧒" : "🙂"}</span>
                  )}
                </div>
                <div className="mt-2">{p.name}</div>
              </button>

              {/* Acciones debajo de cada tarjeta */}
              <div className="mt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPickerFor(p.id)}
                  className="text-xs rounded px-2 py-1 bg-neutral-800 hover:bg-neutral-700"
                >
                  Elegir avatar
                </button>
                <button
                  onClick={() => del(p.id)}
                  className="text-xs rounded px-2 py-1 bg-neutral-900 hover:bg-neutral-800"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          {/* Añadir perfil (si no se alcanzó el máximo) */}
          {profiles.length < MAX && (
            <details className="col-span-2 md:col-span-1">
              <summary className="cursor-pointer opacity-80 hover:opacity-100">➕ Añadir perfil</summary>
              <form onSubmit={add} className="mt-3 space-y-2">
                <input
                  className="w-full rounded-lg px-3 py-2 bg-neutral-900 border border-neutral-800"
                  placeholder="Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <label className="flex items-center gap-2 text-sm opacity-80">
                  <input type="checkbox" checked={isKid} onChange={(e) => setIsKid(e.target.checked)} /> Perfil infantil
                </label>
                {error && <div className="text-sm text-red-400">{error}</div>}
                <button className="rounded-lg px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700">Crear</button>
              </form>
            </details>
          )}
        </div>

        {/* Limpiar selección de perfil actual (opcional) */}
        {profiles.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={() => fetch("/api/profile/clear", { method: "POST" }).then(() => location.reload())}
              className="text-sm opacity-70 hover:opacity-100"
            >
              Gestionar (eliminar perfiles)
            </button>
          </div>
        )}

        {/* Picker de avatares (overlay) */}
        {pickerFor !== null && (
          <AvatarPicker
            profileId={pickerFor}
            baseUrl={BASE}
            onClose={() => setPickerFor(null)}
            onPicked={() => { setPickerFor(null); load() }}
          />
        )}
      </div>
    </main>
  )
}
