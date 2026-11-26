export interface ContactInput {
  name: string; // 1–60 caracteres tras trim
  email: string; // formato de correo, máx. 120 caracteres
  msg: string; // 1–2000 caracteres tras trim
}

export type ContactFieldErrors = Partial<Record<keyof ContactInput, string>>;

export type ContactResult =
  | { ok: true; name: string }
  | { ok: false; error: "validation"; fields: ContactFieldErrors }
  | { ok: false; error: "send" };

export const NAME_MAX = 60;
export const EMAIL_MAX = 120;
export const MSG_MAX = 2000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function validateContact(
  raw: Record<string, unknown>,
):
  | { ok: true; data: ContactInput }
  | { ok: false; fields: ContactFieldErrors } {
  const name = asString(raw.name).trim();
  const email = asString(raw.email).trim();
  const msg = asString(raw.msg).trim();

  const fields: ContactFieldErrors = {};

  if (!name) fields.name = "El nombre es obligatorio.";
  else if (name.length > NAME_MAX)
    fields.name = `El nombre no puede superar ${NAME_MAX} caracteres.`;

  if (!email) fields.email = "El correo es obligatorio.";
  else if (email.length > EMAIL_MAX)
    fields.email = `El correo no puede superar ${EMAIL_MAX} caracteres.`;
  else if (!EMAIL_RE.test(email)) fields.email = "El correo no es válido.";

  if (!msg) fields.msg = "El mensaje es obligatorio.";
  else if (msg.length > MSG_MAX)
    fields.msg = `El mensaje no puede superar ${MSG_MAX} caracteres.`;

  if (Object.keys(fields).length > 0) return { ok: false, fields };
  return { ok: true, data: { name, email, msg } };
}
