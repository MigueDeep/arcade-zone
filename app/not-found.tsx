import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="fade-in"
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 20,
        padding: "64px 16px",
      }}
    >
      <h1
        className="pixel neon-magenta flicker"
        style={{ fontSize: "clamp(56px, 16vw, 128px)", margin: 0 }}
      >
        404
      </h1>
      <div className="pixel neon-cyan" style={{ fontSize: 14 }}>
        GAME OVER
      </div>
      <p
        style={{
          color: "var(--ink-dim)",
          fontFamily: "var(--mono)",
          maxWidth: 420,
          margin: 0,
        }}
      >
        Esta ficha no corresponde a ninguna máquina del Vault.
        <span className="blink"> _</span>
      </p>
      <Link href="/" className="btn lg">
        VOLVER AL VAULT
      </Link>
    </div>
  );
}
