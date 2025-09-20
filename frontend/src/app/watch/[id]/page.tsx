"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("")
  const [mode, setMode] = useState<"direct" | "compat">("direct")
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Next 15: params puede ser una Promise, hay que await
  useEffect(() => {
    (async () => {
      const p = await params
      setId(p.id)
    })()
  }, [params])

  const BASE = process.env.NEXT_PUBLIC_API_BASE!.replace(/\/$/, "")
  const srcDirect = id ? `${BASE}/api/stream/${id}` : ""
  const srcCompat  = id ? `${BASE}/api/transcode/mp4/${id}` : ""

  // Si falla Direct Play, hacemos fallback a compat automático
  const onError = () => {
    if (mode === "direct") {
      setMode("compat")
    }
  }

  // Cuando cambia el modo, recarga el <video> y trata de reproducir
  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.load()
    videoRef.current.play().catch(() => {})
  }, [mode, id])

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Reproducción</h1>
          <Link href="/" className="text-sm opacity-70 hover:opacity-100">← Biblioteca</Link>
        </div>

        {/* Controles de modo */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("direct")}
            className={`rounded-lg px-3 py-1.5 ${mode === "direct" ? "bg-neutral-700" : "bg-neutral-800 hover:bg-neutral-700"}`}
            disabled={!id}
            title="Sirve el archivo con HTTP Range (sin transcodificar)"
          >
            Direct Play
          </button>
          <button
            onClick={() => setMode("compat")}
            className={`rounded-lg px-3 py-1.5 ${mode === "compat" ? "bg-neutral-700" : "bg-neutral-800 hover:bg-neutral-700"}`}
            disabled={!id}
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

        <p className="text-xs opacity-60">
          Si el navegador no soporta el contenedor/códecs, se activará automáticamente
          el modo “Forzar compatibilidad” (transcodificación a H.264/AAC).
        </p>
      </div>
    </main>
  )
}
