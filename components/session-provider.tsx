"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface SessionUser {
  /** Máx. 10 caracteres, mayúsculas */
  name: string;
}

interface SessionContextValue {
  user: SessionUser | null;
  /** true cuando ya se leyó localStorage tras montar */
  ready: boolean;
  /** Con un usuario lo persiste; con null (invitado) no guarda nada. */
  login: (user: SessionUser | null) => void;
  logout: () => void;
}

const KEY = "av_user";

const SessionContext = createContext<SessionContextValue | null>(null);

function readUser(): SessionUser | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as SessionUser).name === "string" &&
      (parsed as SessionUser).name.length > 0
    ) {
      return { name: (parsed as SessionUser).name };
    }
    return null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  // Se lee tras montar para evitar diferencias de hidratación.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(readUser());
    setReady(true);
  }, []);

  const login = useCallback((next: SessionUser | null) => {
    setUser(next);
    try {
      if (next) window.localStorage.setItem(KEY, JSON.stringify(next));
      else window.localStorage.removeItem(KEY);
    } catch {
      /* sin persistencia */
    }
  }, []);

  const logout = useCallback(() => login(null), [login]);

  const value = useMemo(
    () => ({ user, ready, login, logout }),
    [user, ready, login, logout],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}
