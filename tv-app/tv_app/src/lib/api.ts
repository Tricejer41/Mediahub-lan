import { BASE_URL } from "../config/baseUrl";
import type { Profile, TitleSummary } from "./types";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const Api = {
  // Perfiles
  getProfiles: (): Promise<Profile[]> => api("/api/profiles"),

  // Catálogo: series (mapeamos a TitleSummary y añadimos la URL del thumb)
  listSeries: async (): Promise<TitleSummary[]> => {
    const series: { id: string | number; name: string }[] = await api(
      "/api/catalog/series"
    );
    return series.map((s) => ({
      id: String(s.id),
      name: s.name,
      poster: `${BASE_URL}/api/catalog/series/${s.id}/thumb`,
    }));
  },

  // Detalle de serie
  getDetails: (id: string) =>
    api(`/api/catalog/series/${id}`) as Promise<{
      id: string;
      name: string;
      synopsis?: string;
      seasons?: { number: number; episodes: { id: string; name: string }[] }[];
      poster?: string;
    }>,

  // URL de reproducción (stream directo con Range)
  hlsUrl: (sourceId: string): string => `${BASE_URL}/api/stream/${sourceId}`,
};
