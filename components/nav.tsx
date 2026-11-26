"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/components/session-provider";

type NavItem = "inicio" | "biblioteca" | "salon" | "acerca" | "acceso";

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, ready, logout } = useSession();

  const isActive = (name: NavItem) => {
    if (name === "inicio") return pathname === "/";
    if (name === "biblioteca") return pathname.startsWith("/juegos");
    if (name === "salon") return pathname.startsWith("/salon");
    if (name === "acerca") return pathname.startsWith("/acerca");
    return pathname.startsWith("/acceso");
  };
  const cls = (name: NavItem) =>
    isActive(name) ? "active" : undefined;
  const close = () => setOpen(false);

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo" style={{ textDecoration: "none" }}>
          <div className="logo-mark"></div>
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/" className={cls("inicio")}>
            Inicio
          </Link>
          <Link href="/juegos" className={cls("biblioteca")}>
            Biblioteca
          </Link>
          <Link href="/salon" className={cls("salon")}>
            Salón de la Fama
          </Link>
          <Link href="/acerca" className={cls("acerca")}>
            Acerca de
          </Link>
        </div>
        <div className="spacer"></div>
        <div className="coin-counter">
          <span className="coin"></span>
          <span>CRÉDITOS · 03</span>
        </div>
        {/* Estado neutro (invisible) hasta leer la sesión, sin saltos de layout */}
        {user ? (
          <button
            type="button"
            className="btn ghost auth-btn"
            onClick={logout}
            style={{ visibility: ready ? "visible" : "hidden" }}
          >
            {user.name} ▾
          </button>
        ) : (
          <Link
            href="/acceso"
            className="btn auth-btn"
            style={{ visibility: ready ? "visible" : "hidden" }}
          >
            Iniciar Sesión
          </Link>
        )}
        <button
          type="button"
          className="btn ghost hamburger"
          onClick={() => setOpen(true)}
          aria-label="Menú"
        >
          ≡
        </button>
      </nav>

      <div
        className={"av-mobile-backdrop" + (open ? " open" : "")}
        onClick={close}
      ></div>
      <aside className={"av-mobile-panel" + (open ? " open" : "")}>
        <div className="pixel neon-cyan" style={{ fontSize: 11, marginBottom: 16 }}>
          MENÚ
        </div>
        <Link href="/" className={cls("inicio")} onClick={close}>
          Inicio
        </Link>
        <Link href="/juegos" className={cls("biblioteca")} onClick={close}>
          Biblioteca
        </Link>
        <Link href="/salon" className={cls("salon")} onClick={close}>
          Salón de la Fama
        </Link>
        <Link href="/acerca" className={cls("acerca")} onClick={close}>
          Acerca de
        </Link>
        <Link href="/acceso" className={cls("acceso")} onClick={close}>
          {user ? "Cuenta" : "Iniciar Sesión"}
        </Link>
        <div style={{ flex: 1 }}></div>
        <div
          className="pixel"
          style={{
            fontSize: 9,
            color: "var(--ink-faint)",
            letterSpacing: "0.16em",
          }}
        >
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
