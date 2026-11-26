"use server";

import { Resend } from "resend";
import { validateContact, type ContactResult } from "@/lib/contact";

/**
 * Server Action del formulario de contacto. Firma compatible con
 * `useActionState`: recibe el estado previo y el `FormData`.
 */
export async function sendContact(
  _prev: ContactResult | null,
  formData: FormData,
): Promise<ContactResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    msg: formData.get("msg"),
  };

  // Honeypot: un bot rellena `website`. Respondemos éxito sin enviar nada.
  const trap = formData.get("website");
  if (typeof trap === "string" && trap.length > 0) {
    console.warn("[contacto] Honeypot activado: no se envía correo.");
    return { ok: true, name: typeof raw.name === "string" ? raw.name.trim() : "" };
  }

  const parsed = validateContact(raw);
  if (!parsed.ok) {
    return { ok: false, error: "validation", fields: parsed.fields };
  }
  const { name, email, msg } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    console.error(
      "[contacto] Faltan variables de entorno: RESEND_API_KEY, CONTACT_TO_EMAIL o CONTACT_FROM_EMAIL.",
    );
    return { ok: false, error: "send" };
  }

  // Sin saltos de línea en el asunto para evitar inyección de cabeceras.
  const safeName = name.replace(/[\r\n]+/g, " ").trim();

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[Arcade Vault] Mensaje de ${safeName}`,
      text: `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${msg}`,
    });
    if (error) {
      console.error("[contacto] Resend rechazó el envío:", error);
      return { ok: false, error: "send" };
    }
  } catch (err) {
    console.error("[contacto] Error al enviar con Resend:", err);
    return { ok: false, error: "send" };
  }

  return { ok: true, name };
}
