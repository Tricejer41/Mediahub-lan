"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import ProfileBadge from "@/components/ProfileBadge"

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("")
  const [mode, setMode] = useState<"direct" | "compat">("direct")
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Next 15: params puede ser Promise
  useEffect(() => {
    (async () => {
      const p = await params
      setId(p.id)
    })()
  }, [params])

  const BASE = process.env.NEXT_PUBLIC_API_BASE!.replace(/\/$/, "")
  const srcDirect = id ? `${BASE}/api/stream/${id}` : ""
  const srcCompat  = id ? `${BASE}/api/transcode/mp4/${id}` : ""

  // Auto-fallback si Direct Play falla
  const onError = () => {
    if (mode === "direct") setMode("compat")
  }

  // Guardar progreso periódico y en pausa/fin
  useEffect(() => {
    const v = videoRef.current
    if (!v || !id) return
    let timer: any

    const getProfileId = () => {
      const m = document.cookie.match(/(?:^|; )profile_id=([^;]+)/)
      return m ? decodeURIComponent(m[1]) : null
    }

    const sendProgress = async (completed = false) => {
      const profile_id = getProfileId()
      if (!profile_id) return
      const body = {
        profile_id: Number(profile_id),
        episode_id: Number(id),
        position_sec: v.currentTime || 0,
        duration_sec: v.duration || null,
        completed
      }
      try {
        await fetch(`${BASE}/api/progress/upsert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      } catch {}
    }

    const onTime = () => {
      if (timer) return
      timer = setTimeout(() => { timer = null; sendProgress(false) }, 5000)
    }
    const onPause = () => sendProgress(false)
    const onEnded = () => sendProgress(true)

    v.addEventListener("timeupdate", onTime)
    v.addEventListener("pause", onPause)
    v.addEventListener("ended", onEnded)

    return () => {
      v.removeEventListener("timeupdate", onTime)
      v.removeEventListener("pause", onPause)
      v.removeEventListener("ended", onEnded)
      if (timer) clearTimeout(timer)
    }
  }, [id, mode, BASE])

  // Recargar <video> al cambiar modo o id
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.load()
    v.play().catch(() => {})
  }, [mode, id])

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-4">
<div className="flex items-center justify-between">
  <h1 className="text-xl font-semibold">Reproducción</h1>
  <div className="flex items-center gap-3">
    <ProfileBadge />
    <Link href="/" className="text-sm opacity-70 hover:opacity-100">← Biblioteca</Link>
  </div>
</div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("direct")}
            className={`rounded-lg px-3 py-1.5 ${mode === "direct" ? "bg-neutral-700" : "bg-neutral-800 hover:bg-neutral-700"}`}
            title="Sirve el archivo original con HTTP Range"
          >
            Direct Play
          </button>
          <button
            onClick={() => setMode("compat")}
            className={`rounded-lg px-3 py-1.5 ${mode === "compat" ? "bg-neutral-700" : "bg-neutral-800 hover:bg-neutral-700"}`}
            title="Transcodifica a MP4 H.264/AAC en tiempo real"
          >
            Forzar compatibilidad
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-black">
          <video
            ref={videoRef}
            controls
            preload="metadata"
            className="w-full aspect-video"
            src={mode === "direct" ? srcDirect : srcCompat}
            onError={onError}
          />
        </div>
      </div>
    </main>
  )
}
