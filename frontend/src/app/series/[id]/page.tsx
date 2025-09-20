import Link from "next/link"
import { apiBase } from "@/lib/api"

type Episode = {
  id: number
  number: number | null
  title: string | null
  path: string
  duration: number | null
  w: number | null
  h: number | null
}
type Season = { number: number; episodes: Episode[] }
type SerieDetail = { id: number; name: string; seasons: Season[] }

async function fetchSerie(id: string): Promise<SerieDetail> {
  const res = await fetch(`${apiBase()}/api/catalog/series/${id}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Serie no encontrada")
  return res.json()
}

export default async function SeriePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await fetchSerie(id)

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">{data.name}</h1>
          <Link href="/" className="text-sm opacity-70 hover:opacity-100">← Volver</Link>
        </div>

        {data.seasons.length === 0 ? (
          <p className="opacity-70">No hay temporadas/episodios detectados.</p>
        ) : (
          <div className="space-y-6">
            {data.seasons.map((sea) => (
              <section key={sea.number} className="rounded-2xl border border-neutral-800">
                <header className="px-4 py-3 border-b border-neutral-800 bg-neutral-900/40">
                  <h2 className="font-semibold">Temporada {sea.number}</h2>
                </header>
                <ul className="divide-y divide-neutral-900">
                  {sea.episodes.map((e) => (
                    <li key={e.id} className="px-4 py-3 flex items-center gap-3">
                      <span className="w-12 text-right tabular-nums opacity-70">
                        {e.number ?? "–"}
                      </span>
                      <div className="flex-1">
                        <div className="truncate">{e.title ?? e.path.split("/").pop()}</div>
                        <div className="text-xs opacity-60">
                          {e.w && e.h ? `${e.w}×${e.h}` : "Resolución desconocida"}
                          {e.duration ? ` · ${(e.duration / 60).toFixed(1)} min` : ""}
                        </div>
                      </div>

                      {/* Botón Reproducir */}
                      <Link
                        href={`/watch/${e.id}`}
                        className="ml-auto text-sm rounded-lg px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 transition"
                      >
                        ▶ Reproducir
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
