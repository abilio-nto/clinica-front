"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      api.get("/auth/me")
        .then(res => setUser(res.data))
        .catch(() => logout());
    }
  }, []);

  function login(token) {
    localStorage.setItem("token", token);

    api.get("/auth/me").then(res => {
      setUser(res.data);
      router.push("/dashboard");
    });
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}