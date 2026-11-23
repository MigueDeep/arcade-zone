"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/components/session-provider";
import { getBestScore } from "@/lib/saved-scores";

/** "Tu mejor" del detalle: solo aparece con sesión y una puntuación guardada. */
export function PersonalBest({ gameId }: { gameId: string }) {
  const { user, ready } = useSession();
  const [best, setBest] = useState<number | null>(null);
  const name = user?.name;

  // localStorage solo se lee tras montar (evita errores de hidratación).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBest(ready && name ? getBestScore(gameId, name) : null);
  }, [gameId, name, ready]);

  if (best === null) return null;

  return (
    <div className="stat-strip" style={{ marginTop: 12 }}>
      <div>
        <div className="l">Tu mejor</div>
        <div
          className="v"
          style={{
            color: "var(--cyan)",
            textShadow: "0 0 6px rgba(0,245,255,0.5)",
          }}
        >
          {best.toLocaleString("es-ES")}
        </div>
      </div>
    </div>
  );
}
