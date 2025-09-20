import Link from "next/link"
import { apiBase } from "@/lib/api"

type Serie = { id: number; name: string }

export const revalidate = 60 // cache ligera en prod (60s)

async function fetchSeries(): Promise<Serie[]> {
  const res = await fetch(`${apiBase()}/api/catalog/series`, { cache: "no-store" })
  if (!res.ok) throw new Error("No se pudo cargar el catálogo")
  return res.json()
}

export default async function Home() {
  const series = await fetchSeries()

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Anime — Biblioteca</h1>
          <Link
            href="/rescan"
            className="rounded-xl px-4 py-2 bg-neutral-800 hover:bg-neutral-700 transition"
          >
            Re-escanear
          </Link>
        </header>

        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {series.map((s) => (
            <Link
              key={s.id}
              href={`/series/${s.id}`}
              className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 hover:border-neutral-600 transition"
            >
              <div className="aspect-video w-full rounded-xl bg-neutral-800/60 mb-3 group-hover:bg-neutral-700/60 transition" />
              <div className="font-medium truncate">{s.name}</div>
              <div className="text-xs opacity-60">Ver temporadas</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
