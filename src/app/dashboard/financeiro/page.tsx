"use client";

import { useState, useEffect } from "react";
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, 
  Download, Filter, BarChart3, PieChart, 
  CreditCard, Wallet, Receipt, FileText,
  ArrowUpCircle, ArrowDownCircle, Eye, ChevronRight,
  Loader2, AlertCircle, CheckCircle, XCircle
} from "lucide-react";
import { api } from "@/services/api";

interface FinanceiroStats {
  faturamentoDia: number;
  faturamentoMes: number;
  faturamentoAno: number;
  receitasPrevistas: number;
  despesasPrevistas: number;
  lucroEstimado: number;
  ticketMedio: number;
  taxaOcupacao: number;
  inadimplencia: number;
}

interface Transacao {
  id: number;
  data: string;
  cliente: string;
  procedimento: string;
  valor: number;
  status: "PAGO" | "PENDENTE" | "CANCELADO";
  tipo: "RECEITA" | "DESPESA";
  formaPagamento: string;
}

export default function FinanceiroDashboard() {
  const [stats, setStats] = useState<FinanceiroStats>({
    faturamentoDia: 0,
    faturamentoMes: 0,
    faturamentoAno: 0,
    receitasPrevistas: 0,
    despesasPrevistas: 0,
    lucroEstimado: 0,
    ticketMedio: 0,
    taxaOcupacao: 0,
    inadimplencia: 0,
  });
  const [transacoesRecentes, setTransacoesRecentes] = useState<Transacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodo, setPeriodo] = useState<"dia" | "mes" | "ano">("mes");

  useEffect(() => {
    fetchFinanceiroData();
  }, [periodo]);

  async function fetchFinanceiroData() {
    setIsLoading(true);
    try {
      const response = await api.get(`/financeiro/dashboard?periodo=${periodo}`);
      setStats(response.data.stats);
      setTransacoesRecentes(response.data.transacoesRecentes);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PAGO': return 'bg-green-100 text-green-700';
      case 'PENDENTE': return 'bg-yellow-100 text-yellow-700';
      case 'CANCELADO': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const faturamentoStats = [
    { 
      title: "Faturamento Hoje", 
      value: formatCurrency(stats.faturamentoDia), 
      icon: TrendingUp, 
      color: "from-green-500 to-green-600",
      period: "dia"
    },
    { 
      title: "Faturamento do Mês", 
      value: formatCurrency(stats.faturamentoMes), 
      icon: Calendar, 
      color: "from-blue-500 to-blue-600",
      period: "mes"
    },
    { 
      title: "Faturamento do Ano", 
      value: formatCurrency(stats.faturamentoAno), 
      icon: BarChart3, 
      color: "from-purple-500 to-purple-600",
      period: "ano"
    },
  ];

  const indicadoresStats = [
    { 
      title: "Ticket Médio", 
      value: formatCurrency(stats.ticketMedio), 
      icon: Receipt, 
      color: "from-indigo-500 to-indigo-600" 
    },
    { 
      title: "Taxa de Ocupação", 
      value: `${stats.taxaOcupacao}%`, 
      icon: PieChart, 
      color: "from-amber-500 to-amber-600" 
    },
    { 
      title: "Inadimplência", 
      value: `${stats.inadimplencia}%`, 
      icon: AlertCircle, 
      color: "from-red-500 to-red-600" 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] bg-clip-text text-transparent">
              Financeiro
            </h1>
            <p className="text-gray-500 mt-1">Gestão financeira da clínica</p>
          </div>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {[
            { value: "dia", label: "Hoje" },
            { value: "mes", label: "Este Mês" },
            { value: "ano", label: "Este Ano" }
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriodo(p.value as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                periodo === p.value 
                  ? "bg-[#0B1F3A] text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Faturamento Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {faturamentoStats.map((stat, index) => (
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

      {/* Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {indicadoresStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-[#0B1F3A] mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} opacity-75`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Receitas vs Despesas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-800">Receitas Previstas</h2>
          </div>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.receitasPrevistas)}</p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full" 
              style={{ width: `${(stats.receitasPrevistas / (stats.receitasPrevistas + stats.despesasPrevistas)) * 100}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-gray-800">Despesas Previstas</h2>
          </div>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(stats.despesasPrevistas)}</p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 rounded-full" 
              style={{ width: `${(stats.despesasPrevistas / (stats.receitasPrevistas + stats.despesasPrevistas)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lucro Estimado */}
      <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-sm">Lucro Estimado do Período</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(stats.lucroEstimado)}</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="text-sm">Margem: {((stats.lucroEstimado / stats.receitasPrevistas) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Transações Recentes */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#0B1F3A]" />
            <h2 className="text-xl font-bold text-[#0B1F3A]">Transações Recentes</h2>
          </div>
          <button className="flex items-center gap-1 text-sm text-[#1C4468] hover:text-[#0B1F3A]">
            Ver todas <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0B1F3A] mx-auto" />
          </div>
        ) : transacoesRecentes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma transação recente</p>
          </div>
        ) : (
          <div className="divide-y">
            {transacoesRecentes.map((transacao) => (
              <div key={transacao.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transacao.tipo === "RECEITA" ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {transacao.tipo === "RECEITA" ? (
                        <ArrowUpCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{transacao.cliente}</p>
                      <p className="text-sm text-gray-500">
                        {transacao.procedimento} • {new Date(transacao.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`font-semibold ${
                      transacao.tipo === "RECEITA" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transacao.tipo === "RECEITA" ? "+" : "-"} {formatCurrency(transacao.valor)}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transacao.status)}`}>
                      {transacao.status}
                    </span>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-center">
          <Download className="w-6 h-6 text-[#0B1F3A] mx-auto mb-2" />
          <span className="text-sm font-medium">Exportar Relatório</span>
        </button>
        <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-center">
          <CreditCard className="w-6 h-6 text-[#0B1F3A] mx-auto mb-2" />
          <span className="text-sm font-medium">Nova Despesa</span>
        </button>
        <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-center">
          <Wallet className="w-6 h-6 text-[#0B1F3A] mx-auto mb-2" />
          <span className="text-sm font-medium">Contas a Pagar</span>
        </button>
        <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-center">
          <FileText className="w-6 h-6 text-[#0B1F3A] mx-auto mb-2" />
          <span className="text-sm font-medium">Extrato Bancário</span>
        </button>
      </div>
    </div>
  );
}