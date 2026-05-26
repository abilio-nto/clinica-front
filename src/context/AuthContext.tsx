"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authLogin, authMe } from "@/services/apiWrapper";
import { useRouter } from "next/navigation";

interface Pessoa {
  nome: string;
  email: string;
  telefone?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  role: "ADMIN" | "RECEPCAO" | "FINANCEIRO" | "PROFISSIONAL" | "USER";
  id_profissional?: number;
  pessoa: Pessoa;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      authMe()
        .then(data => setUser(data as AuthUser))
        .catch(() => logout())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(username: string, password: string) {
    const data = await authLogin(username, password);
    localStorage.setItem("token", data.token);
    const me = await authMe();
    setUser(me as AuthUser);
    router.push("/dashboard");
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
