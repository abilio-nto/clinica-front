"use client";

import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserCog, 
  Syringe, 
  DollarSign,
  LogOut,
  Sparkles
} from "lucide-react";

export default function Sidebar({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const menu = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Agenda", path: "/dashboard/agenda", icon: Calendar },
    { label: "Clientes", path: "/dashboard/clientes", icon: Users },
    { label: "Usuários", path: "/dashboard/usuarios", icon: UserCog },
    { label: "Procedimentos", path: "/dashboard/procedimentos", icon: Syringe },
    { label: "Financeiro", path: "/dashboard/financeiro", icon: DollarSign },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:relative z-30 bg-gradient-to-b from-[#0B1F3A] to-[#0a1a30] shadow-2xl h-full transition-all duration-300
        ${open ? "w-72" : "w-0 lg:w-20"}
      `}>
        <div className={`overflow-hidden ${open ? "p-6" : "p-4"}`}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur">
              <Sparkles className="w-6 h-6 text-[#4F7FAE]" />
            </div>
            {open && (
              <div>
                <h1 className="text-white font-bold text-lg">Nayane Pimentel</h1>
                <p className="text-white/60 text-xs">Estética Avançada</p>
              </div>
            )}
          </div>

          {/* Menu */}
          <nav className="space-y-2">
            {menu.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? "bg-gradient-to-r from-[#1C4468] to-[#0B1F3A] text-white shadow-lg" 
                      : "text-white/70 hover:text-white hover:bg-white/10"
                    }
                    ${!open && "justify-center px-2"}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-[#4F7FAE]" : ""}`} />
                  {open && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-6 left-0 right-0 px-6">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                text-white/70 hover:text-white hover:bg-red-500/20
                ${!open && "justify-center"}
              `}
            >
              <LogOut className="w-5 h-5" />
              {open && <span className="text-sm font-medium">Sair</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}