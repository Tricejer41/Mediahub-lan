"use client"

import { useEffect, useState } from "react"

type Avatar = { id: string; url: string }

export default function AvatarPicker({ profileId, baseUrl, onClose, onPicked }:
  { profileId: number, baseUrl: string, onClose: () => void, onPicked: () => void }) {

  const [list, setList] = useState<Avatar[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${baseUrl}/api/profiles/avatars`).then(r => r.json()).then(setList).catch(() => setErr("No se pudo cargar"))
      .finally(() => setLoading(false))
  }, [baseUrl])

  const pick = async (a: Avatar) => {
    await fetch(`${baseUrl}/api/profiles/${profileId}/avatar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar: a.id })
    })
    onPicked()
  }

  return (
    <div className="fixed inset-0 bg-black/60 grid place-items-center z-50">
      <div className="w-[min(800px,95vw)] max-h-[85vh] overflow-auto rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Elegir avatar</h2>
          <button onClick={onClose} className="text-sm opacity-70 hover:opacity-100">✕</button>
        </div>
        {loading ? <div className="opacity-70">Cargando…</div> :
         err ? <div className="text-red-400">{err}</div> :
         <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
           {list.map(a => (
             <button key={a.id} onClick={() => pick(a)} className="rounded-lg overflow-hidden bg-neutral-800 hover:bg-neutral-700">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={`${baseUrl}${a.url}`} alt="" className="w-28 h-28 object-cover" />
             </button>
           ))}
         </div>}
      </div>
    </div>
  )
}
