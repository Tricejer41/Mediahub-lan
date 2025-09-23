import Link from "next/link"
import { cookies } from "next/headers"
import { apiBase } from "@/lib/api"
import ProfileBadgeServer from "@/components/ProfileBadgeServer"

type Episode = {
  id: number
  number: number | null
  title: string | null
  path: string
  duration: number | null
  w: number | null
  h: number | null
  thumb_rel?: string | null
}
type Season = { number: number; episodes: Episode[] }
type SerieDetail = { id: number; name: string; seasons: Season[] }

async function fetchSerie(id: string): Promise<SerieDetail> {
  const res = await fetch(`${apiBase()}/api/catalog/series/${id}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Serie no encontrada")
  return res.json()
}

type SeriesProgressItem = { episode_id: number; position_sec: number; completed: boolean }
async function fetchProgress(seriesId: string, profileId: string | null): Promise<SeriesProgressItem[]> {
  if (!profileId) return []
  const res = await fetch(`${apiBase()}/api/progress/series/${seriesId}?profile_id=${profileId}`, { cache: "no-store" })
  if (!res.ok) return []
  return res.json()
}

export default async function SeriePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await fetchSerie(id)

  // perfil activo (cookie legible por el cliente)
const jar = await cookies();
const pid = jar.get("profile_id")?.value ?? null
  const progress = await fetchProgress(id, pid)
  const progMap = new Map<number, { position_sec: number; completed: boolean }>()
  for (const p of progress) progMap.set(p.episode_id, { position_sec: p.position_sec, completed: p.completed })

  const BASE = apiBase()

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-8">
      <div className="mx-auto max-w-5xl">
<div className="mb-6 flex items-center justify-between">
  <h1 className="text-xl md:text-2xl font-bold">{data.name}</h1>
  <div className="flex items-center gap-3">
<ProfileBadgeServer />
    <Link href="/" className="text-sm opacity-70 hover:opacity-100">← Volver</Link>
  </div>
</div>
        {data.seasons.length === 0 ? (
          <p className="opacity-70">No hay temporadas/episodios detectados.</p>
        ) : (
          <div className="space-y-6">
            {data.seasons.map((sea) => (
              <section key={sea.number} className="rounded-2xl border border-neutral-800 overflow-hidden">
                <header className="px-4 py-3 border-b border-neutral-800 bg-neutral-900/40">
                  <h2 className="font-semibold">Temporada {sea.number}</h2>
                </header>
                <ul className="divide-y divide-neutral-900">
                  {sea.episodes.map((e) => {
                    const p = progMap.get(e.id)
                    const dur = e.duration ?? 0
                    const pct = p && dur ? Math.min(100, Math.round((p.position_sec / dur) * 100)) : 0

                    return (
                      <li key={e.id} className="px-4 py-3 flex items-center gap-3">
                        {/* Miniatura */}
                        <div className="w-28 shrink-0 aspect-video rounded-lg overflow-hidden bg-neutral-800">
                          {e.thumb_rel ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`${BASE}/static/${e.thumb_rel}`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-xs opacity-60">Sin imagen</div>
                          )}
                        </div>

                        {/* Número */}
                        <span className="w-12 text-right tabular-nums opacity-70">
                          {e.number ?? "–"}
                        </span>

                        {/* Título + meta */}
                        <div className="flex-1 min-w-0">
                          <div className="truncate">
                            {e.title ?? e.path.split("/").pop()}
                          </div>
                          <div className="text-xs opacity-60">
                            {e.w && e.h ? `${e.w}×${e.h}` : "Resolución desconocida"}
                            {e.duration ? ` · ${(e.duration / 60).toFixed(1)} min` : ""}
                          </div>

                          {/* Barra de progreso (si hay perfil y progreso) */}
                          {p && dur ? (
                            <div className="mt-2 w-40 h-2 rounded bg-neutral-800 overflow-hidden">
                              <div className="h-full bg-neutral-300" style={{ width: `${pct}%` }} />
                            </div>
                          ) : null}
                        </div>

                        {/* Reproducir */}
                        <Link
                          href={`/watch/${e.id}`}
                          className="ml-auto text-sm rounded-lg px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 transition"
                        >
                          ▶ Reproducir
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
