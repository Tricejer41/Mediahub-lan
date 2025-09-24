export type Profile = {
  id: number;
  name: string;
  avatar: string; // ruta pública /static/avatars/...
};

export type TitleSummary = {
  id: string;
  name: string;
  poster?: string;  // /static/posters/...
};

export type ContinueWatchingItem = {
  id: string;
  name: string;
  progress: number;     // 0..1
  lastPositionMs: number;
  poster?: string;
};
