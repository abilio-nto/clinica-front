"use client";

import { Menu, Bell, User, Search } from "lucide-react";
import { useState } from "react";

export default function Header({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-20">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-[#0B1F3A]"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              className="bg-transparent text-sm outline-none w-64"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-[#0B1F3A]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-800">Notificações</h3>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm text-gray-600">Nova cliente agendou horário</p>
                  <p className="text-sm text-gray-600">Meta mensal está próxima</p>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-[#0B1F3A]">Nayane Pimentel</p>
              <p className="text-xs text-gray-500">Administradora</p>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-full flex items-center justify-center text-white font-semibold">
              NP
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}