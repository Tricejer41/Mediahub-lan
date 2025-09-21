import Link from "next/link"
import { apiBase } from "@/lib/api"
import ProfileBadgeServer from "@/components/ProfileBadgeServer"

// ---- Tipos ----
type Serie = { id: number; name: string }

// ---- Data fetchers ----
async function fetchSeries(q?: string): Promise<Serie[]> {
  const base = apiBase()
  const url =
    q && q.trim().length > 0
      ? `${base}/api/catalog/search?q=${encodeURIComponent(q)}`
      : `${base}/api/catalog/series`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("No se pudo cargar el catálogo")
  return res.json()
}

// ---- Server component para la miniatura de cada serie ----
async function SeriesThumbCard({ id }: { id: number }) {
  const base = apiBase()
  const r = await fetch(`${base}/api/catalog/series/${id}/thumb`, { cache: "no-store" })
  const data = await r.json().catch(() => null as any)
  const src = data?.thumb ? `${base}/static/${data.thumb}` : null

  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden bg-neutral-800/60 mb-3 group-hover:bg-neutral-700/60 transition">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full grid place-items-center text-sm opacity-60">
          Sin imagen
        </div>
      )}
    </div>
  )
}

// ---- Formulario de búsqueda (acción nativa) ----
function SearchForm({ q }: { q?: string }) {
  return (
    <form action="/" className="flex items-center gap-2">
      <input
        type="text"
        name="q"
        defaultValue={q ?? ""}
        placeholder="Buscar serie..."
        className="rounded-xl px-3 py-2 bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-600"
      />
      <button className="rounded-xl px-3 py-2 bg-neutral-800 hover:bg-neutral-700">
        Buscar
      </button>
      {q ? (
        <a href="/" className="text-sm opacity-70 hover:opacity-100">
          Limpiar
        </a>
      ) : null}
    </form>
  )
}

// ---- Página (Server Component) ----
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const series = await fetchSeries(q)

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Anime — Biblioteca</h1>
          <div className="flex items-center gap-4">
            <SearchForm q={q} />
            <Link
              href="/rescan"
              className="rounded-xl px-4 py-2 bg-neutral-800 hover:bg-neutral-700 transition"
            >
              Re-escanear
            </Link>
<ProfileBadgeServer />
          </div>
        </header>

        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {series.map((s) => (
            <Link
              key={s.id}
              href={`/series/${s.id}`}
              className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 p-3 hover:border-neutral-600 transition"
            >
              <SeriesThumbCard id={s.id} />
              <div className="font-medium truncate">{s.name}</div>
              <div className="text-xs opacity-60">Ver temporadas</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
