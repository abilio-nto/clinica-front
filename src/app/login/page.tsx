"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Sparkles } from "lucide-react";

type LoginData = {
  username: string;
  password: string;
};

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();

  async function onSubmit(data: LoginData) {
    setIsLoading(true);
    setError("");
    try {
      await login(data.username, data.password);
    } catch {
      setError("Usuário ou senha inválidos. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0B1F3A] via-[#0d2444] to-[#0B1F3A]">
      {/* Lado esquerdo — logo */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1C4468_0%,_transparent_70%)] opacity-40" />
        <div className="relative z-10 flex flex-col items-center text-center p-12">
          <img
            src="/logo2.png"
            alt="Nayane Pimentel Estética"
            className="w-72 h-auto object-contain drop-shadow-2xl"
          />
          <div className="mt-10 space-y-3">
            <p className="text-white/70 text-lg tracking-widest uppercase font-light">Estética Avançada</p>
            <div className="w-16 h-px bg-white/30 mx-auto" />
            <p className="text-white/50 text-sm">Cuidado com excelência e sofisticação</p>
          </div>
        </div>
        {/* Círculos decorativos */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#1C4468]/20 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#4F7FAE]/10 rounded-full blur-3xl" />
      </div>

      {/* Lado direito — form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/logo2.png" alt="Logo" className="h-20 object-contain" />
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
            {/* Header do card */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0B1F3A] to-[#2C5F8A] rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0B1F3A]">Bem-vindo(a)</h1>
                <p className="text-sm text-gray-500">Acesse sua conta</p>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                {error}
              </div>
            )}

            {/* Dica de acesso (apenas mock) */}
            <div className="mb-5 p-3 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-xl">
              <p className="font-semibold mb-1">Contas de teste disponíveis:</p>
              <p>Admin: <strong>admin</strong> / <strong>admin123</strong></p>
              <p>Recepção: <strong>recepcao</strong> / <strong>123456</strong></p>
              <p>Profissional: <strong>prof1</strong> / <strong>123456</strong></p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Usuário</label>
                <input
                  {...register("username", { required: "Informe o usuário" })}
                  placeholder="Digite seu usuário"
                  autoComplete="username"
                  className="w-full border border-gray-200 bg-gray-50 text-gray-900 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/30 focus:border-[#0B1F3A] transition-all placeholder:text-gray-400"
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    {...register("password", { required: "Informe a senha" })}
                    type={showPass ? "text" : "password"}
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    className="w-full border border-gray-200 bg-gray-50 text-gray-900 p-3 pr-11 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/30 focus:border-[#0B1F3A] transition-all placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex justify-end">
                <a href="#" className="text-sm text-[#1C4468] hover:underline">Esqueceu a senha?</a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] hover:from-[#1C4468] hover:to-[#0B1F3A] text-white p-3.5 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : "Entrar"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">© 2026 Nayane Pimentel Estética Avançada</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
