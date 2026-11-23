export interface SavedScore {
  game: string;
  score: number;
  name: string;
  /** Date.now() */
  at: number;
}

const KEY = "av_scores";

function readAll(): SavedScore[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is SavedScore =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as SavedScore).game === "string" &&
        typeof (e as SavedScore).score === "number" &&
        typeof (e as SavedScore).name === "string" &&
        typeof (e as SavedScore).at === "number",
    );
  } catch {
    return [];
  }
}

/** Guarda una puntuación en localStorage. Devuelve false si no fue posible. */
export function saveScore(entry: SavedScore): boolean {
  try {
    const all = readAll();
    all.push(entry);
    window.localStorage.setItem(KEY, JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}

/** Mejor puntuación guardada de `name` en `gameId`, o null si no hay ninguna. */
export function getBestScore(gameId: string, name: string): number | null {
  const scores = readAll()
    .filter((e) => e.game === gameId && e.name === name)
    .map((e) => e.score);
  return scores.length ? Math.max(...scores) : null;
}
