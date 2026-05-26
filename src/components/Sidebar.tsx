"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext.tsx";
import {
  LayoutDashboard, Calendar, Users, UserCog, Syringe,
  DollarSign, LogOut, Sparkles, Clock, History,
  BarChart3, Shield, ChevronRight
} from "lucide-react";

const MENUS: Record<string, { label: string; path: string; icon: React.ElementType }[]> = {
  ADMIN: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Agenda", path: "/dashboard/agenda", icon: Calendar },
    { label: "Clientes", path: "/dashboard/clientes", icon: Users },
    { label: "Usuários", path: "/dashboard/usuarios", icon: UserCog },
    { label: "Procedimentos", path: "/dashboard/procedimentos", icon: Syringe },
    { label: "Financeiro", path: "/dashboard/financeiro", icon: DollarSign },
    { label: "Relatórios", path: "/dashboard/relatorios", icon: BarChart3 },
  ],
  RECEPCAO: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Agenda", path: "/dashboard/agenda", icon: Calendar },
    { label: "Clientes", path: "/dashboard/clientes", icon: Users },
    { label: "Procedimentos", path: "/dashboard/procedimentos", icon: Syringe },
  ],
  FINANCEIRO: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Financeiro", path: "/dashboard/financeiro", icon: DollarSign },
    { label: "Relatórios", path: "/dashboard/relatorios", icon: BarChart3 },
  ],
  PROFISSIONAL: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Minha Agenda", path: "/dashboard/agenda", icon: Calendar },
    { label: "Histórico", path: "/dashboard/historico", icon: History },
  ],
  USER: [
    { label: "Meus Agendamentos", path: "/dashboard", icon: Calendar },
    { label: "Histórico", path: "/dashboard/historico", icon: History },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  RECEPCAO: "Recepção",
  FINANCEIRO: "Financeiro",
  PROFISSIONAL: "Profissional",
  USER: "Cliente",
};

export default function Sidebar({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menu = MENUS[user?.role || "USER"] || MENUS.USER;

  const handleLogout = () => {
    logout();
  };

  const navigate = (path: string) => {
    router.push(path);
    if (window.innerWidth < 1024) setOpen(false);
  };

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static z-30 h-full bg-gradient-to-b from-[#0B1F3A] to-[#071428]
        shadow-2xl transition-all duration-300 flex flex-col
        ${open ? "w-64" : "w-0 lg:w-[72px]"}
        overflow-hidden
      `}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 shrink-0 ${!open && "lg:justify-center lg:px-0"}`}>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 backdrop-blur">
            <Sparkles className="w-5 h-5 text-[#4F7FAE]" />
          </div>
          {open && (
            <div className="overflow-hidden">
              <h1 className="text-white font-bold text-sm leading-tight">Nayane Pimentel</h1>
              <p className="text-white/50 text-xs">Estética Avançada</p>
            </div>
          )}
        </div>

        {/* Perfil compacto */}
        {open && user && (
          <div className="px-4 py-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-[#4F7FAE] to-[#1C4468] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.pessoa?.nome?.charAt(0) || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-semibold truncate">{user.pessoa?.nome}</p>
                <p className="text-white/40 text-xs">{ROLE_LABELS[user.role] || user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {menu.map(item => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={!open ? item.label : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative
                  ${isActive
                    ? "bg-white/15 text-white shadow-inner"
                    : "text-white/60 hover:text-white hover:bg-white/8"
                  }
                  ${!open && "lg:justify-center lg:px-0"}
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-[#4F7FAE]" : "group-hover:text-white/80"}`} />
                {open && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    {isActive && <ChevronRight className="w-3 h-3 text-white/40" />}
                  </>
                )}
                {/* Active indicator */}
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#4F7FAE] rounded-r-full" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className={`p-2 border-t border-white/10 shrink-0 ${!open && "lg:flex lg:justify-center"}`}>
          <button
            onClick={handleLogout}
            title={!open ? "Sair" : undefined}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
              text-white/50 hover:text-white hover:bg-red-500/20 group
              ${!open && "lg:justify-center lg:w-auto lg:px-3"}
            `}
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:text-red-400 transition-colors" />
            {open && <span className="text-sm font-medium">Sair da conta</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
