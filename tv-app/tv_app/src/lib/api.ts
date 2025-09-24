import { BASE_URL } from "../config/baseUrl";
import type { Profile, TitleSummary, ContinueWatchingItem } from "./types";

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
  // --- Perfiles ---
  listProfiles: (): Promise<Profile[]> => api("/api/profiles"),
  createProfile: (name: string, avatar: string): Promise<Profile> =>
    api("/api/profiles", { method: "POST", body: JSON.stringify({ name, avatar }) }),

  // --- Catálogo mínimo (ajusta a tu API real) ---
  listHome: (): Promise<{ rows: { label: string; items: TitleSummary[] }[] }> =>
    api("/api/catalog/home"),

  // Si todavía no tienes “seguir viendo” en backend, esta llamada fallará:
  listContinueWatching: (profileId: number): Promise<ContinueWatchingItem[]> =>
    api(`/api/progress/continue?profile_id=${profileId}`),

  // Detalle (ajusta al shape real)
  getDetails: (id: string): Promise<{
    id: string;
    name: string;
    synopsis?: string;
    seasons?: { number: number; episodes: { id: string; name: string }[] }[];
    poster?: string;
  }> => api(`/api/catalog/${id}`),

  // Construcción de URL HLS a partir de un id o path (si ya lo sirves)
  hlsUrl: (sourceId: string): string => `${BASE_URL}/api/stream/hls/${sourceId}.m3u8`,
};
