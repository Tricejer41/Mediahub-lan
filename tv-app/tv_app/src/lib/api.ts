// tv-app/tv_app/src/lib/api.ts
import { BASE_URL } from "../config/baseUrl"; // OJO: confyg, no config
import type { TitleSummary } from "./types";

export type Profile = {
  id: number;
  name: string;
  avatar: string;
  is_kid: boolean;
};

async function jsonFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    // Deja que el caller maneje el catch()
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const Api = {
  // <- La función que te falta
  getProfiles(): Promise<Profile[]> {
    return jsonFetch<Profile[]>(`${BASE_URL}/api/profiles`);
  },

  // Mantengo los nombres que ya usa tu Home.tsx
  listHome(): Promise<{ rows: { label: string; items: TitleSummary[] }[] }> {
    return jsonFetch(`${BASE_URL}/api/home`);
  },

  listContinueWatching(profileId: number | string): Promise<TitleSummary[]> {
    return jsonFetch(
      `${BASE_URL}/api/continue-watching?profileId=${profileId}`
    );
  },
};
