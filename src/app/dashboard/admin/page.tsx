"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, Users, DollarSign, TrendingUp, Clock, Star, 
  UserPlus, Settings, FileText, Activity, BarChart3, 
  Shield, Building2, Home, AlertCircle, CheckCircle, XCircle 
} from "lucide-react";
import { api } from "@/services/api";

interface DashboardStats {
  totalClientes: number;
  agendamentosDia: number;
  totalAgendamentosSemana: number;
  faturamentoMes: number;
  faturamentoDia: number;
  ocupacao: number;
  qtdProofissionais: number;
  qtdRecepcionistas: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    agendamentosDia: 0,
    totalAgendamentosSemana: 0,
    faturamentoMes: 0,
    faturamentoDia: 0,
    ocupacao: 0,
    qtdProofissionais: 0,
    qtdRecepcionistas: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  async function fetchAdminStats() {
    try {
      const response = await api.get("/dashboard/stats");
      setStats(response.data);
      console.log(response)
      setRecentActivities([]);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const mainStats = [
    { title: "Clientes Totais", value: stats.totalClientes, icon: Users, color: "from-blue-500 to-blue-600" },
    { title: "Agendamentos Hoje", value: stats.agendamentosDia, icon: Calendar, color: "from-emerald-500 to-emerald-600" },
    { title: "Faturamento Mês", value: `R$ ${stats.faturamentoMes}`, icon: DollarSign, color: "from-purple-500 to-purple-600" },
    { title: "Taxa Ocupação", value: `${stats.ocupacao}%`, icon: TrendingUp, color: "from-amber-500 to-amber-600" },
  ];

  const teamStats = [
    { title: "Profissionais", value: stats.qtdProofissionais, icon: Shield, color: "from-indigo-500 to-indigo-600" },
    { title: "Recepcionistas", value: stats.qtdRecepcionistas, icon: Building2, color: "from-cyan-500 to-cyan-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] bg-clip-text text-transparent">
              Painel Administrativo
            </h1>
            <p className="text-gray-500 mt-1">Visão completa da clínica</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-[#0B1F3A] mt-1">{stat.value}</p>
            </div>
            <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
          </div>
        ))}
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-[#0B1F3A]">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-[#0B1F3A]" />
          <h2 className="text-xl font-bold text-[#0B1F3A]">Atividades Recentes</h2>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-gray-600">{activity.description}</p>
              <span className="text-sm text-gray-400 ml-auto">{activity.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-center">
          <UserPlus className="w-6 h-6 text-[#0B1F3A] mx-auto mb-2" />
          <span className="text-sm font-medium">Novo Funcionário</span>
        </button>
        <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-center">
          <Settings className="w-6 h-6 text-[#0B1F3A] mx-auto mb-2" />
          <span className="text-sm font-medium">Configurações</span>
        </button>
        <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-center">
          <BarChart3 className="w-6 h-6 text-[#0B1F3A] mx-auto mb-2" />
          <span className="text-sm font-medium">Relatórios</span>
        </button>
        <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-center">
          <FileText className="w-6 h-6 text-[#0B1F3A] mx-auto mb-2" />
          <span className="text-sm font-medium">Auditoria</span>
        </button>
      </div>
    </div>
  );
}