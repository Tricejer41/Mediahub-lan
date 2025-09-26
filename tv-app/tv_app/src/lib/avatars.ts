// src/lib/avatars.ts
// Mapa de ids -> require(...) locales
const AVATARS: Record<string, any> = {
  // aliases numéricos (legacy /static/avatars/1.png..4.png)
  "1": require("../assets/avatars/adventurer-fox.png"),
  "2": require("../assets/avatars/fun-emoji-leopard.png"),
  "3": require("../assets/avatars/bottts-koala.png"),
  "4": require("../assets/avatars/avataaars-aqua.png"),

  // catálogo completo (los nombres son el "id" recomendado)
  "adventurer-fox": require("../assets/avatars/adventurer-fox.png"),
  "adventurer-mango": require("../assets/avatars/adventurer-mango.png"),
  "adventurer-neo": require("../assets/avatars/adventurer-neo.png"),
  "adventurer-neutral-coral": require("../assets/avatars/adventurer-neutral-coral.png"),
  "adventurer-neutral-kiwi": require("../assets/avatars/adventurer-neutral-kiwi.png"),
  "adventurer-neutral-pixel": require("../assets/avatars/adventurer-neutral-pixel.png"),
  "adventurer-neutral-tiger": require("../assets/avatars/adventurer-neutral-tiger.png"),
  "adventurer-nox": require("../assets/avatars/adventurer-nox.png"),
  "adventurer-onyx": require("../assets/avatars/adventurer-onyx.png"),

  "avataaars-aqua": require("../assets/avatars/avataaars-aqua.png"),
  "avataaars-banana": require("../assets/avatars/avataaars-banana.png"),
  "avataaars-nova": require("../assets/avatars/avataaars-nova.png"),
  "avataaars-panda": require("../assets/avatars/avataaars-panda.png"),

  "bottts-apple": require("../assets/avatars/bottts-apple.png"),
  "bottts-indigo": require("../assets/avatars/bottts-indigo.png"),
  "bottts-koala": require("../assets/avatars/bottts-koala.png"),
  "bottts-orion": require("../assets/avatars/bottts-orion.png"),

  "croodles-amber": require("../assets/avatars/croodles-amber.png"),
  "croodles-cherry": require("../assets/avatars/croodles-cherry.png"),
  "croodles-penguin": require("../assets/avatars/croodles-penguin.png"),
  "croodles-vega": require("../assets/avatars/croodles-vega.png"),

  "fun-emoji-jade": require("../assets/avatars/fun-emoji-jade.png"),
  "fun-emoji-leopard": require("../assets/avatars/fun-emoji-leopard.png"),
  "fun-emoji-lyra": require("../assets/avatars/fun-emoji-lyra.png"),
  "fun-emoji-peach": require("../assets/avatars/fun-emoji-peach.png"),

  "micah-atlas": require("../assets/avatars/micah-atlas.png"),
  "micah-grape": require("../assets/avatars/micah-grape.png"),
  "micah-ruby": require("../assets/avatars/micah-ruby.png"),
  "micah-turtle": require("../assets/avatars/micah-turtle.png"),

  "pixel-art-juno": require("../assets/avatars/pixel-art-juno.png"),
  "pixel-art-lemon": require("../assets/avatars/pixel-art-lemon.png"),
  "pixel-art-pearl": require("../assets/avatars/pixel-art-pearl.png"),
  "pixel-art-rhino": require("../assets/avatars/pixel-art-rhino.png"),
};

// Normaliza valores que vienen como "/static/avatars/3.png" o "adventurer-fox"
export function resolveAvatar(input?: string) {
  if (!input) return AVATARS["adventurer-fox"];
  // quita prefijo y extensión si viene como ruta legacy
  const cleaned = input
    .replace(/^\/static\/avatars\//, "")
    .replace(/\.png$/i, "");
  return AVATARS[cleaned] ?? AVATARS["adventurer-fox"];
}

// (opcional) lista de ids disponibles, por si quieres pintarlos
export const AVATAR_IDS = Object.keys(AVATARS).filter((k) => !/^\d+$/.test(k));
