"use client";

import { Calendar, Users, DollarSign, TrendingUp, Clock, Star } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { 
      title: "Atendimentos Hoje", 
      value: "12", 
      icon: Calendar, 
      change: "+2 ontem",
      color: "from-blue-500 to-blue-600"
    },
    { 
      title: "Clientes Ativos", 
      value: "85", 
      icon: Users, 
      change: "+12 este mês",
      color: "from-emerald-500 to-emerald-600"
    },
    { 
      title: "Faturamento Mensal", 
      value: "R$ 12.000", 
      icon: DollarSign, 
      change: "+18%",
      color: "from-purple-500 to-purple-600"
    },
    { 
      title: "Taxa Ocupação", 
      value: "78%", 
      icon: TrendingUp, 
      change: "+5%",
      color: "from-amber-500 to-amber-600"
    },
  ];

  const appointments = [
    { time: "09:00", client: "Ana Silva", procedure: "Limpeza de Pele", status: "confirmado" },
    { time: "10:30", client: "Maria Santos", procedure: "Botox", status: "em andamento" },
    { time: "14:00", client: "Carla Oliveira", procedure: "Preenchimento", status: "agendado" },
    { time: "16:00", client: "Juliana Costa", procedure: "Drenagem", status: "confirmado" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Bem-vinda de volta! Aqui está o resumo do dia.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-[#0B1F3A] mt-1">{stat.value}</p>
            </div>
            <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
          </div>
        ))}
      </div>

      {/* Recent Activity & Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Próximos Atendimentos */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#0B1F3A]">Próximos Atendimentos</h2>
            <button className="text-sm text-[#1C4468] hover:text-[#0B1F3A] font-medium">
              Ver todos →
            </button>
          </div>
          <div className="space-y-4">
            {appointments.map((apt, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-16 text-sm font-semibold text-[#1C4468]">{apt.time}</div>
                  <div>
                    <p className="font-medium text-gray-800">{apt.client}</p>
                    <p className="text-sm text-gray-500">{apt.procedure}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  apt.status === 'confirmado' ? 'bg-green-100 text-green-700' :
                  apt.status === 'em andamento' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Indicadores Rápidos */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#0B1F3A] mb-6">Indicadores Rápidos</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Satisfação dos Clientes</span>
                <span className="text-sm font-semibold text-[#1C4468]">98%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] h-2 rounded-full w-[98%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Retenção de Clientes</span>
                <span className="text-sm font-semibold text-[#1C4468]">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] h-2 rounded-full w-[85%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Meta Mensal</span>
                <span className="text-sm font-semibold text-[#1C4468]">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] h-2 rounded-full w-[67%]" />
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] rounded-xl text-white">
            <div className="flex items-center gap-3">
              <Star className="w-10 h-10 text-yellow-300" />
              <div>
                <p className="text-sm opacity-90">Próximo marco</p>
                <p className="font-bold">Faltam 15 atendimentos para bater a meta do mês!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}