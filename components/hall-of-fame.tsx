"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GAMES } from "@/lib/games";
import { seededScores } from "@/lib/scores";
import { getBestEntry, type SavedScore } from "@/lib/saved-scores";
import { useSession } from "@/components/session-provider";

function formatDate(ts: number): string {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export function HallOfFame() {
  const { user, ready } = useSession();
  const [tab, setTab] = useState(GAMES[0].id);
  const [mine, setMine] = useState<SavedScore | null>(null);

  const rows = useMemo(() => seededScores(tab.length * 23 + 7, 12), [tab]);
  const game = GAMES.find((g) => g.id === tab) ?? GAMES[0];
  const userName = user?.name;

  // localStorage solo se lee tras montar (evita errores de hidratación).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMine(ready && userName ? getBestEntry(tab, userName) : null);
  }, [tab, userName, ready]);

  const myRank = mine
    ? rows.filter((r) => r.score > mine.score).length + 1
    : null;

  return (
    <div className="av-hall fade-in">
      <div className="hall-head">
        <h1>SALÓN DE LA FAMA</h1>
        <p className="pixel" style={{ fontSize: 10 }}>
          LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
        </p>
      </div>

      <div className="hall-tabs">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={"chip" + (tab === g.id ? " active" : "")}
            onClick={() => setTab(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div className="podium">
        <div className="podium-slot silver">
          <div className="rank-num">02</div>
          <div className="name">{rows[1].name}</div>
          <div className="score">{rows[1].score.toLocaleString("es-ES")}</div>
          <div className="date">{rows[1].date}</div>
        </div>
        <div className="podium-slot gold">
          <div
            className="pixel"
            style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.18em" }}
          >
            CAMPEÓN
          </div>
          <div className="rank-num" style={{ fontSize: 36, marginTop: 4 }}>
            01
          </div>
          <div className="name">{rows[0].name}</div>
          <div className="score" style={{ fontSize: 20 }}>
            {rows[0].score.toLocaleString("es-ES")}
          </div>
          <div className="date">{rows[0].date}</div>
        </div>
        <div className="podium-slot bronze">
          <div className="rank-num">03</div>
          <div className="name">{rows[2].name}</div>
          <div className="score">{rows[2].score.toLocaleString("es-ES")}</div>
          <div className="date">{rows[2].date}</div>
        </div>
      </div>

      <div className="hall-table">
        <div className="th">
          <div>RANGO</div>
          <div>JUGADOR</div>
          <div>PUNTUACIÓN</div>
          <div>FECHA</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={tab + r.name}
            className={
              "tr" +
              (i === 0 ? " top1" : i === 1 ? " top2" : i === 2 ? " top3" : "")
            }
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
            <div className="pl">{r.name}</div>
            <div className="sc">{r.score.toLocaleString("es-ES")}</div>
            <div className="dt">{r.date}</div>
          </div>
        ))}
        {ready && user && (
          <>
            <div className="tr you-label">▸ TU MEJOR MARCA EN {game.title}</div>
            {mine && myRank !== null ? (
              <div
                className="tr you"
                style={{ animationDelay: `${rows.length * 50 + 50}ms` }}
              >
                <div className="rk" style={{ color: "var(--yellow)" }}>
                  #{String(myRank).padStart(2, "0")}
                </div>
                <div className="pl" style={{ color: "var(--yellow)" }}>
                  {user.name}
                </div>
                <div
                  className="sc"
                  style={{
                    color: "var(--yellow)",
                    textShadow: "0 0 6px rgba(245,255,0,0.5)",
                  }}
                >
                  {mine.score.toLocaleString("es-ES")}
                </div>
                <div className="dt">{formatDate(mine.at)}</div>
              </div>
            ) : (
              <div
                className="tr you"
                style={{
                  gridColumn: "1 / -1",
                  display: "block",
                  textAlign: "center",
                  color: "var(--ink-faint)",
                }}
              >
                AÚN NO TIENES PUNTUACIONES EN {game.title}. ¡JUEGA UNA PARTIDA!
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Link href="/" className="btn lg">
          VOLVER A LA BIBLIOTECA
        </Link>
      </div>
    </div>
  );
}
