"use client";

import { useState, useEffect } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, Calendar,
  BarChart3, ArrowUpCircle, ArrowDownCircle, Download,
  Loader2, CheckCircle, Clock, XCircle
} from "lucide-react";
import { fetchFinanceiroStats } from "@/services/apiWrapper";

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

const STATUS_CFG = {
  PAGO: { label: "Pago", color: "bg-green-100 text-green-700", icon: CheckCircle },
  PENDENTE: { label: "Pendente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  CANCELADO: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function FinanceiroDashboard() {
  const [stats, setStats] = useState<FinanceiroStats | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodo, setPeriodo] = useState<"dia" | "mes" | "ano">("mes");

  useEffect(() => { load(); }, [periodo]);

  async function load() {
    setIsLoading(true);
    try {
      const data = await fetchFinanceiroStats(periodo);
      setStats(data.stats as FinanceiroStats);
      setTransacoes(data.transacoesRecentes as Transacao[]);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  const receitaTotal = transacoes.filter(t => t.status === "PAGO").reduce((s, t) => s + t.valor, 0);
  const pendente = transacoes.filter(t => t.status === "PENDENTE").reduce((s, t) => s + t.valor, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="w-8 h-8 animate-spin text-[#0B1F3A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-xl shadow-md">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Financeiro</h1>
            <p className="text-sm text-gray-500">Acompanhe as movimentações da clínica</p>
          </div>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm self-start sm:self-auto">
          {(["dia", "mes", "ano"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${periodo === p ? "bg-[#0B1F3A] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {p === "dia" ? "Hoje" : p === "mes" ? "Mês" : "Ano"}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { title: "Faturamento Hoje", value: fmt(stats.faturamentoDia), icon: TrendingUp, color: "from-green-500 to-green-600", sub: "Receita do dia" },
            { title: "Faturamento do Mês", value: fmt(stats.faturamentoMes), icon: Calendar, color: "from-blue-500 to-blue-600", sub: `Previsto: ${fmt(stats.receitasPrevistas)}` },
            { title: "Ticket Médio", value: fmt(stats.ticketMedio), icon: BarChart3, color: "from-purple-500 to-purple-600", sub: `${stats.taxaOcupacao}% ocupação` },
            { title: "Lucro Estimado", value: fmt(stats.lucroEstimado), icon: DollarSign, color: "from-amber-500 to-amber-600", sub: `Inadimplência: ${stats.inadimplencia}%` },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden">
              <div className="p-5">
                <div className={`w-10 h-10 bg-gradient-to-br ${c.color} rounded-xl flex items-center justify-center shadow-md mb-3`}>
                  <c.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-500 text-sm">{c.title}</p>
                <p className="text-xl font-bold text-[#0B1F3A] mt-1">{c.value}</p>
                <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
              </div>
              <div className={`h-1 bg-gradient-to-r ${c.color}`} />
            </div>
          ))}
        </div>
      )}

      {/* Resumo rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <ArrowUpCircle className="w-8 h-8 text-green-600 shrink-0" />
          <div>
            <p className="text-xs text-green-600 font-medium">Receitas recebidas</p>
            <p className="text-lg font-bold text-green-700">{fmt(receitaTotal)}</p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
          <Clock className="w-8 h-8 text-yellow-600 shrink-0" />
          <div>
            <p className="text-xs text-yellow-600 font-medium">Pendente de recebimento</p>
            <p className="text-lg font-bold text-yellow-700">{fmt(pendente)}</p>
          </div>
        </div>
        {stats && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <ArrowDownCircle className="w-8 h-8 text-red-500 shrink-0" />
            <div>
              <p className="text-xs text-red-500 font-medium">Despesas previstas</p>
              <p className="text-lg font-bold text-red-600">{fmt(stats.despesasPrevistas)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-[#0B1F3A]">Transações Recentes</h2>
          <button className="flex items-center gap-2 text-sm text-[#1C4468] hover:text-[#0B1F3A] transition">
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
        {/* Mobile */}
        <div className="sm:hidden divide-y divide-gray-50">
          {transacoes.map(t => {
            const cfg = STATUS_CFG[t.status];
            const Icon = cfg.icon;
            return (
              <div key={t.id} className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-800">{t.cliente}</p>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                    <Icon className="w-3 h-3" />{cfg.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{t.procedimento} • {t.formaPagamento}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">{fmtDate(t.data)}</p>
                  <p className={`text-sm font-bold ${t.status === "CANCELADO" ? "text-gray-400 line-through" : "text-[#0B1F3A]"}`}>{fmt(t.valor)}</p>
                </div>
              </div>
            );
          })}
        </div>
        {/* Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Data", "Cliente", "Procedimento", "Forma Pag.", "Valor", "Status"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transacoes.map(t => {
                const cfg = STATUS_CFG[t.status];
                const Icon = cfg.icon;
                return (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5 text-sm text-gray-500">{fmtDate(t.data)}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{t.cliente}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{t.procedimento}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{t.formaPagamento}</td>
                    <td className={`px-5 py-3.5 text-sm font-bold ${t.status === "CANCELADO" ? "text-gray-400 line-through" : "text-[#0B1F3A]"}`}>{fmt(t.valor)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
