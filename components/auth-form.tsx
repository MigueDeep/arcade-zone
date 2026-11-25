"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";

type Tab = "in" | "up";
type Errors = { user?: string; email?: string; pass?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <div
      id={id}
      role="alert"
      style={{
        color: "var(--magenta)",
        fontFamily: "var(--mono)",
        fontSize: 11,
        letterSpacing: "0.06em",
      }}
    >
      {message}
    </div>
  );
}

export function AuthForm() {
  const router = useRouter();
  const { login } = useSession();
  const [tab, setTab] = useState<Tab>("in");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const changeTab = (next: Tab) => {
    setTab(next);
    setErrors({});
  };

  const validate = (): Errors => {
    const e: Errors = {};
    const name = user.trim();
    if (name.length < 3) e.user = "El usuario debe tener al menos 3 caracteres.";
    else if (name.length > 10) e.user = "El usuario admite un máximo de 10 caracteres.";
    if (tab === "up") {
      const mail = email.trim();
      if (!mail) e.email = "Escribe tu correo electrónico.";
      else if (!EMAIL_RE.test(mail)) e.email = "El correo no tiene un formato válido.";
    }
    if (!pass) e.pass = "La contraseña es obligatoria.";
    return e;
  };

  const submit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    login({ name: user.trim().toUpperCase().slice(0, 10) });
    router.push("/juegos");
  };

  const guest = () => {
    login(null);
    router.push("/juegos");
  };

  return (
    <div className="av-auth-wrap fade-in">
      <div className="auth-card">
        <div className="auth-header">
          <div className="mark"></div>
          <h2 className="neon-cyan">ARCADE VAULT</h2>
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--ink-faint)",
              letterSpacing: "0.16em",
              marginTop: 6,
            }}
          >
            ACCESO AL SISTEMA · v2.6
          </div>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={tab === "in" ? "on" : ""}
            onClick={() => changeTab("in")}
          >
            INICIAR SESIÓN
          </button>
          <button
            type="button"
            className={tab === "up" ? "on" : ""}
            onClick={() => changeTab("up")}
          >
            CREAR CUENTA
          </button>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="auth-user">Usuario</label>
            <input
              id="auth-user"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="px_kai"
              autoComplete="username"
              aria-invalid={!!errors.user}
              aria-describedby={errors.user ? "auth-user-err" : undefined}
            />
            <FieldError id="auth-user-err" message={errors.user} />
          </div>
          {tab === "up" && (
            <div className="field slide-in">
              <label htmlFor="auth-email">Correo electrónico</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jugador@vault.gg"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "auth-email-err" : undefined}
              />
              <FieldError id="auth-email-err" message={errors.email} />
            </div>
          )}
          <div className="field">
            <label htmlFor="auth-pass">Contraseña</label>
            <input
              id="auth-pass"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              autoComplete={tab === "in" ? "current-password" : "new-password"}
              aria-invalid={!!errors.pass}
              aria-describedby={errors.pass ? "auth-pass-err" : undefined}
            />
            <FieldError id="auth-pass-err" message={errors.pass} />
          </div>

          <button
            className="btn lg"
            type="submit"
            style={{ width: "100%", marginTop: 8 }}
          >
            {tab === "in" ? "ENTRAR AL VAULT" : "CREAR Y JUGAR"}
          </button>
        </form>

        <button
          type="button"
          className="btn ghost"
          style={{ width: "100%", marginTop: 10 }}
          onClick={guest}
        >
          JUGAR COMO INVITADO
        </button>

        <div className="auth-divider">O CONTINÚA CON</div>
        <div className="social">
          {/* Decorativos: sin acción */}
          <button className="btn ghost" type="button">
            ◆ GOOGLE
          </button>
          <button className="btn ghost" type="button">
            ▣ GITHUB
          </button>
        </div>

        <div
          style={{
            marginTop: 18,
            textAlign: "center",
            fontSize: 11,
            color: "var(--ink-faint)",
            letterSpacing: "0.1em",
          }}
        >
          AL ENTRAR ACEPTAS LOS TÉRMINOS DEL SALÓN ARCADE
        </div>
      </div>
    </div>
  );
}
