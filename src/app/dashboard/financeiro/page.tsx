"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DollarSign, TrendingUp, Calendar,
  BarChart3, ArrowUpCircle, ArrowDownCircle, Download,
  Loader2, CheckCircle, Clock, XCircle, Search, Plus, X, Receipt
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

const FORMAS_PAGAMENTO = ["Pix", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "Boleto"];

const EMPTY_DESPESA = { descricao: "", valor: "", formaPagamento: "Pix", status: "PENDENTE" as Transacao["status"] };

export default function FinanceiroDashboard() {
  const [stats, setStats] = useState<FinanceiroStats | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodo, setPeriodo] = useState<"dia" | "mes" | "ano">("mes");

  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "RECEITA" | "DESPESA">("todos");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | Transacao["status"]>("todos");

  const [showNovaDespesa, setShowNovaDespesa] = useState(false);
  const [despesaForm, setDespesaForm] = useState(EMPTY_DESPESA);
  const [errosDespesa, setErrosDespesa] = useState<Record<string, string>>({});
  const [salvandoDespesa, setSalvandoDespesa] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

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

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  const filtradas = useMemo(() => transacoes.filter(t =>
    (filtroTipo === "todos" || t.tipo === filtroTipo) &&
    (filtroStatus === "todos" || t.status === filtroStatus) &&
    (search === "" ||
      t.cliente.toLowerCase().includes(search.toLowerCase()) ||
      t.procedimento.toLowerCase().includes(search.toLowerCase()))
  ), [transacoes, search, filtroTipo, filtroStatus]);

  const receitaTotal = filtradas.filter(t => t.status === "PAGO" && t.tipo === "RECEITA").reduce((s, t) => s + t.valor, 0);
  const pendente = filtradas.filter(t => t.status === "PENDENTE").reduce((s, t) => s + t.valor, 0);
  const despesaTotal = filtradas.filter(t => t.tipo === "DESPESA" && t.status !== "CANCELADO").reduce((s, t) => s + t.valor, 0);

  function validarDespesa() {
    const e: Record<string, string> = {};
    if (!despesaForm.descricao.trim()) e.descricao = "Informe a descrição";
    const valorNum = Number(despesaForm.valor.replace(",", "."));
    if (!despesaForm.valor || Number.isNaN(valorNum) || valorNum <= 0) e.valor = "Valor inválido";
    setErrosDespesa(e);
    return Object.keys(e).length === 0;
  }

  async function handleSalvarDespesa() {
    if (!validarDespesa()) return;
    setSalvandoDespesa(true);
    try {
      const nova: Transacao = {
        id: Date.now(),
        data: new Date().toISOString().slice(0, 10),
        cliente: "—",
        procedimento: despesaForm.descricao.trim(),
        valor: Number(despesaForm.valor.replace(",", ".")),
        status: despesaForm.status,
        tipo: "DESPESA",
        formaPagamento: despesaForm.formaPagamento,
      };
      setTransacoes(prev => [nova, ...prev]);
      showToast("Despesa lançada com sucesso!", "ok");
      setShowNovaDespesa(false);
      setDespesaForm(EMPTY_DESPESA);
      setErrosDespesa({});
    } finally {
      setSalvandoDespesa(false);
    }
  }

  function exportarCSV() {
    const header = ["Data", "Cliente", "Procedimento", "Forma de Pagamento", "Valor", "Tipo", "Status"];
    const linhas = filtradas.map(t => [
      fmtDate(t.data), t.cliente, t.procedimento, t.formaPagamento,
      t.valor.toFixed(2).replace(".", ","), t.tipo, STATUS_CFG[t.status].label,
    ]);
    const csv = [header, ...linhas].map(l => l.map(v => `"${v}"`).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeiro-${periodo}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Relatório exportado!", "ok");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="w-8 h-8 animate-spin text-[#0B1F3A]" />
      </div>
    );
  }

  const receitaVsDespesa = stats ? stats.receitasPrevistas + stats.despesasPrevistas : 0;
  const pctReceita = receitaVsDespesa > 0 ? (stats!.receitasPrevistas / receitaVsDespesa) * 100 : 0;
  const pctDespesa = 100 - pctReceita;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${toast.type === "ok" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.type === "ok" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

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
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
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
          <button
            onClick={() => setShowNovaDespesa(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition shrink-0"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nova Despesa</span>
          </button>
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
            <div
              key={i}
              style={{ animationDelay: `${i * 75}ms` }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
            >
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

      {/* Receita x Despesa (previsto no período) */}
      {stats && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#0B1F3A] text-sm">Receita x Despesa previstas</h2>
            <p className="text-xs text-gray-400">Total: {fmt(receitaVsDespesa)}</p>
          </div>
          <div className="flex w-full h-6 rounded-full overflow-hidden gap-0.5 bg-gray-100">
            <div
              className="bg-green-500 h-full first:rounded-l-full"
              style={{ width: `${pctReceita}%` }}
              title={`Receitas: ${fmt(stats.receitasPrevistas)}`}
            />
            <div
              className="bg-red-400 h-full last:rounded-r-full"
              style={{ width: `${pctDespesa}%` }}
              title={`Despesas: ${fmt(stats.despesasPrevistas)}`}
            />
          </div>
          <div className="flex flex-wrap gap-5 mt-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
              <span className="text-gray-500">Receitas</span>
              <span className="font-semibold text-gray-700">{fmt(stats.receitasPrevistas)}</span>
              <span className="text-gray-400">({pctReceita.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
              <span className="text-gray-500">Despesas</span>
              <span className="font-semibold text-gray-700">{fmt(stats.despesasPrevistas)}</span>
              <span className="text-gray-400">({pctDespesa.toFixed(0)}%)</span>
            </div>
          </div>
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
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <ArrowDownCircle className="w-8 h-8 text-red-500 shrink-0" />
          <div>
            <p className="text-xs text-red-500 font-medium">Despesas lançadas</p>
            <p className="text-lg font-bold text-red-600">{fmt(despesaTotal)}</p>
          </div>
        </div>
      </div>

      {/* Busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente ou procedimento..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] bg-white"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value as typeof filtroTipo)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20"
          >
            <option value="todos">Todos os tipos</option>
            <option value="RECEITA">Receitas</option>
            <option value="DESPESA">Despesas</option>
          </select>
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value as typeof filtroStatus)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20"
          >
            <option value="todos">Todos os status</option>
            <option value="PAGO">Pago</option>
            <option value="PENDENTE">Pendente</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-[#0B1F3A]">Transações {filtradas.length !== transacoes.length ? `(${filtradas.length} de ${transacoes.length})` : ""}</h2>
          <button onClick={exportarCSV} className="flex items-center gap-2 text-sm text-[#1C4468] hover:text-[#0B1F3A] transition">
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>

        {filtradas.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            Nenhuma transação encontrada
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="sm:hidden divide-y divide-gray-50">
              {filtradas.map(t => {
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
                      <p className={`text-sm font-bold ${t.status === "CANCELADO" ? "text-gray-400 line-through" : t.tipo === "DESPESA" ? "text-red-600" : "text-[#0B1F3A]"}`}>
                        {t.tipo === "DESPESA" ? "- " : ""}{fmt(t.valor)}
                      </p>
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
                  {filtradas.map(t => {
                    const cfg = STATUS_CFG[t.status];
                    const Icon = cfg.icon;
                    return (
                      <tr key={t.id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3.5 text-sm text-gray-500">{fmtDate(t.data)}</td>
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{t.cliente}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">{t.procedimento}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">{t.formaPagamento}</td>
                        <td className={`px-5 py-3.5 text-sm font-bold ${t.status === "CANCELADO" ? "text-gray-400 line-through" : t.tipo === "DESPESA" ? "text-red-600" : "text-[#0B1F3A]"}`}>
                          {t.tipo === "DESPESA" ? "- " : ""}{fmt(t.valor)}
                        </td>
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
          </>
        )}
      </div>

      {/* Modal Nova Despesa */}
      {showNovaDespesa && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#0B1F3A]">Nova Despesa</h2>
              <button onClick={() => setShowNovaDespesa(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descrição</label>
                <input
                  value={despesaForm.descricao}
                  onChange={e => setDespesaForm(p => ({ ...p, descricao: e.target.value }))}
                  placeholder="Ex: Aluguel, material de consumo..."
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 transition ${errosDespesa.descricao ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"}`}
                />
                {errosDespesa.descricao && <p className="text-red-500 text-xs mt-1">{errosDespesa.descricao}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Valor (R$)</label>
                <input
                  value={despesaForm.valor}
                  onChange={e => setDespesaForm(p => ({ ...p, valor: e.target.value }))}
                  placeholder="0,00"
                  inputMode="decimal"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 transition ${errosDespesa.valor ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"}`}
                />
                {errosDespesa.valor && <p className="text-red-500 text-xs mt-1">{errosDespesa.valor}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Forma de pagamento</label>
                  <select
                    value={despesaForm.formaPagamento}
                    onChange={e => setDespesaForm(p => ({ ...p, formaPagamento: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20"
                  >
                    {FORMAS_PAGAMENTO.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                  <select
                    value={despesaForm.status}
                    onChange={e => setDespesaForm(p => ({ ...p, status: e.target.value as Transacao["status"] }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20"
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="PAGO">Pago</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
              <button onClick={() => setShowNovaDespesa(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition">
                Cancelar
              </button>
              <button
                onClick={handleSalvarDespesa}
                disabled={salvandoDespesa}
                className="flex-1 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {salvandoDespesa ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Lançar Despesa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
