"use client";

import { Menu, Bell, Search, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext.tsx";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  RECEPCAO: "Recepção",
  FINANCEIRO: "Financeiro",
  PROFISSIONAL: "Profissional",
  USER: "Cliente",
};

export default function Header({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [showNotif, setShowNotif] = useState(false);
  const { user } = useAuth();

  const iniciais = user?.pessoa?.nome
    ?.trim()
    .split(" ")
    .filter(Boolean)
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  const notificacoes = [
    { msg: "Nova cliente agendou para amanhã", time: "5 min" },
    { msg: "Lembrete: agenda de hoje tem 7 atendimentos", time: "1h" },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        {/* Esquerda */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-[#0B1F3A]"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl focus-within:border-[#0B1F3A]/30 focus-within:ring-2 focus-within:ring-[#0B1F3A]/10 transition">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="bg-transparent text-sm outline-none w-56 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Direita */}
        <div className="flex items-center gap-2">
          {/* Notificações */}
          <div className="relative">
            <button
              onClick={() => setShowNotif(v => !v)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5 text-[#0B1F3A]" />
              {notificacoes.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            {showNotif && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotif(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-40 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800 text-sm">Notificações</h3>
                    <button onClick={() => setShowNotif(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {notificacoes.map((n, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition cursor-pointer">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                        <div>
                          <p className="text-sm text-gray-700">{n.msg}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{n.time} atrás</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 text-center border-t border-gray-50">
                    <button className="text-xs text-[#1C4468] hover:text-[#0B1F3A] font-medium transition">
                      Ver todas
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Perfil */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-[#0B1F3A] leading-tight">{user?.pessoa?.nome?.split(" ")[0]}</p>
              <p className="text-xs text-gray-400">{ROLE_LABELS[user?.role || ""] || "—"}</p>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-[#0B1F3A] to-[#4F7FAE] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
              {iniciais}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
