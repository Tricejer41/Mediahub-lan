"use client"
import { useState } from "react"
import Link from "next/link"

export default function RescanPage() {
  const [status, setStatus] = useState<null | { ok: boolean; created?: number; updated?: number; error?: string }>(null)
  const [loading, setLoading] = useState(false)

  const trigger = async () => {
    setLoading(true); setStatus(null)
    try {
      const res = await fetch("/api/scan", { method: "POST" })
      const data = await res.json()
      setStatus(data)
    } catch (e: any) {
      setStatus({ ok: false, error: String(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Re-escanear biblioteca</h1>
          <Link href="/" className="text-sm opacity-70 hover:opacity-100">← Volver</Link>
        </div>

        <button
          onClick={trigger}
          disabled={loading}
          className="w-full rounded-xl px-4 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Escaneando..." : "Lanzar escaneo ahora"}
        </button>

        {status && (
          <div className={`rounded-xl border p-4 ${status.ok ? "border-emerald-700 bg-emerald-900/20" : "border-red-700 bg-red-900/20"}`}>
            {status.ok ? (
              <div>
                <div className="font-medium">¡OK!</div>
                <div className="text-sm opacity-80">created: {status.created ?? 0} · updated: {status.updated ?? 0}</div>
              </div>
            ) : (
              <div>
                <div className="font-medium">Error</div>
                <div className="text-sm opacity-80">{status.error ?? "Fallo al escanear"}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
