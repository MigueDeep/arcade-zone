"use client";

import { useActionState, useRef, useState } from "react";
import { sendContact } from "@/app/acerca/actions";
import type { ContactResult } from "@/lib/contact";

const EMPTY_FORM = { name: "", email: "", msg: "" };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
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

export function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [state, formAction, pending] = useActionState<
    ContactResult | null,
    FormData
  >(sendContact, null);
  // `useActionState` no permite reiniciar su estado: guardamos el resultado
  // que el visitante ya cerró con "ENVIAR OTRO MENSAJE".
  const [dismissed, setDismissed] = useState<ContactResult | null>(null);
  const [shake, setShake] = useState(false);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!form.name.trim() || !form.email.trim() || !form.msg.trim()) {
      // Cancela el envío (y con él la Server Action) solo si faltan campos.
      e.preventDefault();
      setShake(true);
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      shakeTimer.current = setTimeout(() => setShake(false), 400);
      return;
    }
    // Con los tres campos completos se deja pasar: corre la Server Action.
  };

  const reset = () => {
    setDismissed(state);
    setForm(EMPTY_FORM);
  };

  const sent = state?.ok && state !== dismissed ? state.name : null;
  const fieldErrors =
    state && !state.ok && state.error === "validation" ? state.fields : {};
  const sendFailed = state && !state.ok && state.error === "send";

  return (
    <form
      className={"contact-form" + (shake ? " shake" : "")}
      action={formAction}
      onSubmit={onSubmit}
    >
      {!sent ? (
        <>
          <div className="hp-field" aria-hidden="true">
            <label htmlFor="contact-website">WEBSITE</label>
            <input
              id="contact-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>
          <div className="field">
            <label htmlFor="contact-name">NOMBRE</label>
            <input
              id="contact-name"
              name="name"
              aria-invalid={!!fieldErrors.name}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="px_kai"
            />
            <FieldError message={fieldErrors.name} />
          </div>
          <div className="field">
            <label htmlFor="contact-email">CORREO ELECTRÓNICO</label>
            <input
              id="contact-email"
              name="email"
              aria-invalid={!!fieldErrors.email}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jugador@vault.gg"
            />
            <FieldError message={fieldErrors.email} />
          </div>
          <div className="field">
            <label htmlFor="contact-msg">MENSAJE</label>
            <textarea
              id="contact-msg"
              name="msg"
              aria-invalid={!!fieldErrors.msg}
              rows={5}
              value={form.msg}
              onChange={(e) => setForm({ ...form, msg: e.target.value })}
              placeholder="Cuéntanos qué tienes en mente…"
            ></textarea>
            <FieldError message={fieldErrors.msg} />
          </div>
          {sendFailed && (
            <div
              role="alert"
              style={{
                color: "var(--magenta)",
                fontFamily: "var(--mono)",
                fontSize: 12,
                letterSpacing: "0.06em",
                marginBottom: 12,
              }}
            >
              &gt; ERROR: NO PUDIMOS ENVIAR TU MENSAJE. INTÉNTALO DE NUEVO EN
              UNOS MINUTOS.
            </div>
          )}
          <button
            className="btn xl press"
            type="submit"
            disabled={pending}
            style={{ width: "100%" }}
          >
            {pending ? "ENVIANDO…" : "▶  ENVIAR MENSAJE"}
          </button>
        </>
      ) : (
        <div className="terminal-success">
          <div className="term-bar">
            <span className="dot r"></span>
            <span className="dot y"></span>
            <span className="dot g"></span>
            <span className="term-title">VAULT-OS // TERMINAL</span>
          </div>
          <div className="term-body">
            <div className="line">
              <span className="prompt">vault@arcade:~$</span> ./send_message
              --to=team
            </div>
            <div className="line dim">[OK] Conectando con servidor…</div>
            <div className="line dim">[OK] Validando contenido…</div>
            <div className="line dim">[OK] Transmitiendo paquete…</div>
            <div className="line success">
              &gt; MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS,{" "}
              {sent.toUpperCase()}.<span className="caret">_</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <button className="btn ghost" type="button" onClick={reset}>
                ENVIAR OTRO MENSAJE
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
