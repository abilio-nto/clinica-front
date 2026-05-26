"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Users, DollarSign, TrendingUp, UserPlus,
  Settings, BarChart3, Shield, Building2, Activity,
  ArrowUpRight, RefreshCw, Clock, CheckCircle, XCircle,
  AlertCircle, FileText
} from "lucide-react";
import { fetchDashboardStats, fetchAgendamentosHoje } from "@/services/apiWrapper";

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

interface Agendamento {
  id: number;
  hrAgendamento: string;
  procedimento: string | null;
  status: string;
  nomeCliente: string | null;
  valorProcedimento: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  AGENDADO: { label: "Agendado", color: "bg-blue-100 text-blue-700", icon: Clock },
  EM_ANDAMENTO: { label: "Em andamento", color: "bg-amber-100 text-amber-700", icon: Activity },
  FINALIZADO: { label: "Finalizado", color: "bg-green-100 text-green-700", icon: CheckCircle },
  CANCELADO: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: XCircle },
  DISPONIVEL: { label: "Disponível", color: "bg-gray-100 text-gray-500", icon: AlertCircle },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => { load(); }, []);

  async function load() {
    setIsLoading(true);
    try {
      const [s, a] = await Promise.all([fetchDashboardStats(), fetchAgendamentosHoje()]);
      setStats(s as DashboardStats);
      setAgendamentos(a as Agendamento[]);
      setLastUpdate(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const cards = stats ? [
    { title: "Clientes Cadastrados", value: stats.totalClientes, icon: Users, color: "from-blue-500 to-blue-600", sub: "+3 este mês" },
    { title: "Agendamentos Hoje", value: stats.agendamentosDia, icon: Calendar, color: "from-emerald-500 to-emerald-600", sub: `${stats.totalAgendamentosSemana} na semana` },
    { title: "Faturamento do Mês", value: fmt(stats.faturamentoMes), icon: DollarSign, color: "from-purple-500 to-purple-600", sub: `Hoje: ${fmt(stats.faturamentoDia)}` },
    { title: "Taxa de Ocupação", value: `${stats.ocupacao}%`, icon: TrendingUp, color: "from-amber-500 to-amber-600", sub: "Meta: 85%" },
  ] : [];

  const quickActions = [
    { label: "Novo Funcionário", icon: UserPlus, path: "/dashboard/usuarios" },
    { label: "Clientes", icon: Users, path: "/dashboard/clientes" },
    { label: "Procedimentos", icon: Settings, path: "/dashboard/procedimentos" },
    { label: "Financeiro", icon: BarChart3, path: "/dashboard/financeiro" },
  ];

  const agendados = agendamentos.filter(a => a.status !== "DISPONIVEL");
  const concluidos = agendamentos.filter(a => a.status === "FINALIZADO").length;
  const emAndamento = agendamentos.filter(a => a.status === "EM_ANDAMENTO").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0B1F3A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-xl shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Painel Administrativo</h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${c.color} shadow-md`}>
                  <c.icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
              </div>
              <p className="text-gray-500 text-sm">{c.title}</p>
              <p className="text-2xl font-bold text-[#0B1F3A] mt-1">{c.value}</p>
              <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
            </div>
            <div className={`h-1 bg-gradient-to-r ${c.color}`} />
          </div>
        ))}
      </div>

      {/* Equipe + Hoje */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipe */}
        {stats && (
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-[#0B1F3A] flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Equipe
            </h2>
            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg"><Shield className="w-4 h-4 text-indigo-600" /></div>
                <span className="text-sm font-medium text-gray-700">Profissionais</span>
              </div>
              <span className="text-2xl font-bold text-indigo-600">{stats.qtdProofissionais}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg"><Users className="w-4 h-4 text-cyan-600" /></div>
                <span className="text-sm font-medium text-gray-700">Recepcionistas</span>
              </div>
              <span className="text-2xl font-bold text-cyan-600">{stats.qtdRecepcionistas}</span>
            </div>
            {/* Barra de ocupação */}
            <div className="pt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Taxa de Ocupação</span>
                <span className="font-semibold text-[#0B1F3A]">{stats.ocupacao}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0B1F3A] to-[#4F7FAE] rounded-full transition-all duration-700"
                  style={{ width: `${stats.ocupacao}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Resumo do dia */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#0B1F3A] flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Agenda de Hoje
            </h2>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg">{concluidos} concluídos</span>
              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg">{emAndamento} em andamento</span>
            </div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {agendados.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Nenhum agendamento encontrado</p>
            ) : (
              agendados.map(a => {
                const cfg = statusConfig[a.status] || statusConfig["DISPONIVEL"];
                const Icon = cfg.icon;
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                    <span className="text-sm font-semibold text-[#1C4468] w-12 shrink-0">{a.hrAgendamento}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{a.nomeCliente || "—"}</p>
                      <p className="text-xs text-gray-400 truncate">{a.procedimento || "Sem procedimento"}</p>
                    </div>
                    <span className={`hidden sm:flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium shrink-0 ${cfg.color}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div>
        <h2 className="font-bold text-[#0B1F3A] mb-3">Ações Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map((a, i) => (
            <button
              key={i}
              onClick={() => router.push(a.path)}
              className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-[#0B1F3A]/20 border border-transparent transition-all text-center group"
            >
              <div className="w-11 h-11 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-[#0B1F3A]/5 group-hover:to-[#1C4468]/10 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all">
                <a.icon className="w-5 h-5 text-[#0B1F3A]" />
              </div>
              <span className="text-sm font-medium text-gray-700">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Última atualização */}
      <p className="text-xs text-gray-400 text-right">
        Última atualização: {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}
