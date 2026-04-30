"use client";

import { useForm } from "react-hook-form";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginData = {
  username: string;
  password: string;
};

export default function Login() {
  const { register, handleSubmit } = useForm<LoginData>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: LoginData) {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", data);
      localStorage.setItem("token", response.data.token);
      router.push("/dashboard");
    } catch {
      alert("Login inválido");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0B1F3A] via-[#123456] to-[#0B1F3A]">
      
      {/* ESQUERDA - LOGO COM overlay */}
      <div className="hidden md:flex w-1/2 items-center justify-center relative">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] rounded-r-3xl" />
        <div className="relative z-10 flex flex-col items-center text-center p-8">
          <img
            src="/logo2.png"
            alt="Logo Nayane Pimentel"
            className="w-[75%] h-auto max-h-[70%] object-contain drop-shadow-2xl"
          />
          {/* <div className="mt-8 border-t border-white/30 pt-6">
            <p className="text-white/80 text-lg italic tracking-wide">
              ESTÉTICA AVANÇADA
            </p>
            <p className="text-white/60 text-sm mt-2">
              Coren/PE 488.389
            </p>
          </div> */}
        </div>
      </div>

      {/* DIREITA - LOGIN CARD */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-4">
        <div className="bg-white/95 backdrop-blur-sm p-8 md:p-10 flex flex-col items-center justify-center rounded-3xl shadow-2xl w-full max-w-md border border-white/30 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          
          {/* Ícone decorativo */}
          <div className="w-16 h-16 bg-gradient-to-tr from-[#0B1F3A] to-[#2C5F8A] rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-6">
            <span className="text-white text-3xl font-light">✨</span>
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0B1F3A] to-[#2C5F8A] bg-clip-text text-transparent">
            Bem-vindo(a)
          </h1>

          <p className="text-gray-500 mb-6 text-center">
            Acesse sua conta para gerenciar <br /> seus tratamentos exclusivos
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full">
            <div className="relative">
              <input
                {...register("username")}
                placeholder="Usuário"
                className="w-full bg-white border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent transition-all pl-10"
              />
              <span className="absolute left-3 top-3.5 text-gray-400">👤</span>
            </div>

            <div className="relative">
              <input
                {...register("password")}
                type="password"
                placeholder="Senha"
                className="w-full bg-white border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent transition-all pl-10"
              />
              <span className="absolute left-3 top-3.5 text-gray-400">🔒</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] hover:from-[#1C4468] hover:to-[#0B1F3A] text-white p-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>

            {/* Link extra para recuperação de senha */}
            <div className="text-center mt-2">
              <a href="#" className="text-sm text-[#1C4468] hover:text-[#0B1F3A] transition-colors">
                Esqueceu sua senha?
              </a>
            </div>
          </form>

          {/* Rodapé do card */}
          <div className="mt-8 pt-4 border-t border-gray-100 w-full text-center">
            <p className="text-xs text-gray-400">
              Tratamentos Exclusivos • Estética Avançada
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}