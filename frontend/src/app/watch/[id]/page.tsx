import Link from "next/link"

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // el src apunta directo al backend
  const src = `${process.env.NEXT_PUBLIC_API_BASE!.replace(/\/$/, "")}/api/stream/${id}`

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Reproducción</h1>
          <Link href="/" className="text-sm opacity-70 hover:opacity-100">← Biblioteca</Link>
        </div>
        <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-black">
          <video
            controls
            preload="metadata"
            className="w-full aspect-video"
            src={src}
            // crossOrigin no es necesario en LAN, pero puedes habilitarlo:
            // crossOrigin="anonymous"
          />
        </div>
        <p className="text-xs opacity-60">
          Nota: algunos MKV/HEVC o audio no soportado por el navegador podrían no reproducir.
          Más adelante añadiremos transcodificación opcional.
        </p>
      </div>
    </main>
  )
}
