"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar, Clock, User, Phone, Mail, CheckCircle,
  XCircle, AlertCircle, Eye, Plus, Search, Play,
  X, ChevronRight, ChevronLeft, Activity, Loader2
} from "lucide-react";
import {
  fetchAgendamentosHoje, fetchClientes, fetchProcedimentos,
  fetchProfissionais, iniciarAtendimento, finalizarAtendimento, cancelarAgendamento
} from "@/services/apiWrapper";

interface Agendamento {
  id: number;
  hrAgendamento: string;
  procedimento: string | null;
  status: string;
  nomeCliente: string | null;
  telefoneCliente: string | null;
  emailCliente: string | null;
  valorProcedimento: number;
  nomeProfissional: string | null;
}

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  endereco: string;
}

interface Procedimento {
  id: number;
  nome: string;
  duracao: number;
  valor: number;
}

interface Profissional {
  id: number;
  nome: string;
  especialidade: string;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  AGENDADO: { label: "Agendado", color: "text-blue-700", bg: "bg-blue-100" },
  EM_ANDAMENTO: { label: "Em andamento", color: "text-amber-700", bg: "bg-amber-100" },
  FINALIZADO: { label: "Finalizado", color: "text-green-700", bg: "bg-green-100" },
  CANCELADO: { label: "Cancelado", color: "text-red-700", bg: "bg-red-100" },
  DISPONIVEL: { label: "Disponível", color: "text-gray-500", bg: "bg-gray-100" },
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function RecepcaoDashboard() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Modal detalhes
  const [selectedAgt, setSelectedAgt] = useState<Agendamento | null>(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [observacoes, setObservacoes] = useState("");

  // Modal novo agendamento
  const [showNovo, setShowNovo] = useState(false);
  const [step, setStep] = useState(1);
  const [selCliente, setSelCliente] = useState<Cliente | null>(null);
  const [selProcedimento, setSelProcedimento] = useState<Procedimento | null>(null);
  const [selProfissional, setSelProfissional] = useState<Profissional | null>(null);
  const [busca, setBusca] = useState("");
  const [savingNovo, setSavingNovo] = useState(false);

  // Modal cancelar
  const [showCancelar, setShowCancelar] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setIsLoading(true);
    try {
      const [a, c, p, prof] = await Promise.all([
        fetchAgendamentosHoje(), fetchClientes(), fetchProcedimentos(), fetchProfissionais()
      ]);
      setAgendamentos(a as Agendamento[]);
      setClientes(c as Cliente[]);
      setProcedimentos(p as Procedimento[]);
      setProfissionais(prof as Profissional[]);
    } catch { showToast("Erro ao carregar dados", "err"); }
    finally { setIsLoading(false); }
  }

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const filtrados = useMemo(() =>
    agendamentos.filter(a =>
      a.status !== "DISPONIVEL" &&
      (searchTerm === "" ||
        a.nomeCliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.procedimento?.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [agendamentos, searchTerm]);

  const disponiveis = agendamentos.filter(a => a.status === "DISPONIVEL");
  const concluidos = agendamentos.filter(a => a.status === "FINALIZADO").length;
  const emAndamento = agendamentos.filter(a => a.status === "EM_ANDAMENTO").length;
  const agendados = agendamentos.filter(a => a.status === "AGENDADO").length;

  const openDetalhes = (a: Agendamento) => {
    setSelectedAgt(a);
    setObservacoes("");
    setShowDetalhes(true);
  };

  async function handleIniciar() {
    if (!selectedAgt) return;
    setActionLoading(true);
    try {
      await iniciarAtendimento(selectedAgt.id, observacoes);
      setAgendamentos(prev => prev.map(a =>
        a.id === selectedAgt.id ? { ...a, status: "EM_ANDAMENTO" } : a
      ));
      setShowDetalhes(false);
      showToast("Atendimento iniciado com sucesso!", "ok");
    } catch { showToast("Erro ao iniciar atendimento", "err"); }
    finally { setActionLoading(false); }
  }

  async function handleFinalizar() {
    if (!selectedAgt) return;
    setActionLoading(true);
    try {
      await finalizarAtendimento(selectedAgt.id, observacoes);
      setAgendamentos(prev => prev.map(a =>
        a.id === selectedAgt.id ? { ...a, status: "FINALIZADO" } : a
      ));
      setShowDetalhes(false);
      showToast("Atendimento finalizado!", "ok");
    } catch { showToast("Erro ao finalizar atendimento", "err"); }
    finally { setActionLoading(false); }
  }

  async function handleCancelar() {
    if (!selectedAgt) return;
    setActionLoading(true);
    try {
      await cancelarAgendamento(selectedAgt.id, motivoCancelamento);
      setAgendamentos(prev => prev.map(a =>
        a.id === selectedAgt.id ? { ...a, status: "CANCELADO" } : a
      ));
      setShowCancelar(false);
      setShowDetalhes(false);
      showToast("Agendamento cancelado", "ok");
    } catch { showToast("Erro ao cancelar", "err"); }
    finally { setActionLoading(false); }
  }

  function resetNovo() {
    setStep(1); setSelCliente(null); setSelProcedimento(null);
    setSelProfissional(null); setBusca(""); setShowNovo(false);
  }

  async function handleSalvarNovo() {
    if (!selCliente || !selProcedimento || !selProfissional) return;
    setSavingNovo(true);
    await new Promise(r => setTimeout(r, 800));
    setSavingNovo(false);
    resetNovo();
    showToast("Agendamento criado com sucesso!", "ok");
    load();
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.cpf.includes(busca)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0B1F3A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 transition-all ${toast.type === "ok" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.type === "ok" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-xl shadow-md">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Recepção</h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNovo(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Novo Agendamento
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Agendados", value: agendados, color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "Em andamento", value: emAndamento, color: "bg-amber-50 text-amber-700 border-amber-200" },
          { label: "Concluídos", value: concluidos, color: "bg-green-50 text-green-700 border-green-200" },
          { label: "Disponíveis", value: disponiveis.length, color: "bg-gray-50 text-gray-600 border-gray-200" },
        ].map((k, i) => (
          <div key={i} className={`rounded-xl border p-4 text-center ${k.color}`}>
            <p className="text-2xl font-bold">{k.value}</p>
            <p className="text-xs mt-0.5 font-medium opacity-80">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar por cliente ou procedimento..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] bg-white"
        />
      </div>

      {/* Tabela de agendamentos */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-[#0B1F3A]">Agenda de Hoje — {filtrados.length} atendimentos</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {filtrados.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Nenhum agendamento encontrado</p>
            </div>
          ) : filtrados.map(a => {
            const cfg = STATUS_CFG[a.status] || STATUS_CFG["DISPONIVEL"];
            return (
              <div key={a.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition group">
                {/* Hora */}
                <div className="w-14 shrink-0">
                  <span className="text-sm font-bold text-[#1C4468]">{a.hrAgendamento}</span>
                </div>
                {/* Info cliente */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{a.nomeCliente || "—"}</p>
                  <p className="text-xs text-gray-400 truncate">{a.procedimento || "Sem procedimento"} • {a.nomeProfissional || "—"}</p>
                </div>
                {/* Status */}
                <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
                {/* Valor */}
                <span className="hidden md:block text-sm font-semibold text-gray-700 w-20 text-right">
                  {a.valorProcedimento > 0 ? fmt(a.valorProcedimento) : "—"}
                </span>
                {/* Ações */}
                <button
                  onClick={() => openDetalhes(a)}
                  className="p-2 rounded-lg hover:bg-[#0B1F3A]/5 transition opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <Eye className="w-4 h-4 text-[#0B1F3A]" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Modal Detalhes ─── */}
      {showDetalhes && selectedAgt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#0B1F3A]">Detalhes do Atendimento</h2>
              <button onClick={() => setShowDetalhes(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CFG[selectedAgt.status]?.bg} ${STATUS_CFG[selectedAgt.status]?.color}`}>
                  {STATUS_CFG[selectedAgt.status]?.label}
                </span>
                <span className="text-xs text-gray-400">#{selectedAgt.id}</span>
              </div>
              {/* Horário */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                <Clock className="w-4 h-4 text-[#0B1F3A]" />
                <div>
                  <p className="text-xs text-gray-400">Horário</p>
                  <p className="font-semibold text-[#0B1F3A] text-sm">{selectedAgt.hrAgendamento}</p>
                </div>
              </div>
              {/* Cliente */}
              <div className="bg-gray-50 p-3 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-[#0B1F3A]" />
                  <p className="text-xs font-semibold text-gray-600">Cliente</p>
                </div>
                <p className="text-sm font-medium text-gray-800">{selectedAgt.nomeCliente || "Não informado"}</p>
                {selectedAgt.telefoneCliente && (
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{selectedAgt.telefoneCliente}</p>
                )}
                {selectedAgt.emailCliente && (
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{selectedAgt.emailCliente}</p>
                )}
              </div>
              {/* Procedimento */}
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs font-semibold text-gray-600 mb-1">Procedimento</p>
                <p className="text-sm font-medium text-gray-800">{selectedAgt.procedimento || "Não especificado"}</p>
                {selectedAgt.valorProcedimento > 0 && (
                  <p className="text-sm text-[#1C4468] font-semibold mt-1">{fmt(selectedAgt.valorProcedimento)}</p>
                )}
              </div>
              {/* Observações */}
              {(selectedAgt.status === "AGENDADO" || selectedAgt.status === "EM_ANDAMENTO") && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Observações</label>
                  <textarea
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    placeholder="Adicione observações..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 resize-none"
                    rows={3}
                  />
                </div>
              )}
              {/* Ações */}
              <div className="flex gap-2 pt-2">
                {selectedAgt.status === "AGENDADO" && (
                  <>
                    <button
                      onClick={() => { setShowCancelar(true); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition"
                    >
                      <XCircle className="w-4 h-4" /> Cancelar
                    </button>
                    <button
                      onClick={handleIniciar}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition disabled:opacity-60"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      Iniciar
                    </button>
                  </>
                )}
                {selectedAgt.status === "EM_ANDAMENTO" && (
                  <button
                    onClick={handleFinalizar}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Finalizar Atendimento
                  </button>
                )}
                {(selectedAgt.status === "FINALIZADO" || selectedAgt.status === "CANCELADO") && (
                  <div className="flex-1 text-center py-2.5 bg-gray-100 rounded-xl text-gray-500 text-sm">
                    Atendimento encerrado
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Cancelar ─── */}
      {showCancelar && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Cancelar Agendamento</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Informe o motivo do cancelamento:</p>
            <textarea
              value={motivoCancelamento}
              onChange={e => setMotivoCancelamento(e.target.value)}
              placeholder="Motivo do cancelamento..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCancelar(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                Voltar
              </button>
              <button
                onClick={handleCancelar}
                disabled={actionLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Novo Agendamento ─── */}
      {showNovo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[#0B1F3A]">Novo Agendamento</h2>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3].map(s => (
                    <div key={s} className={`flex items-center gap-1 text-xs ${step >= s ? "text-[#0B1F3A] font-semibold" : "text-gray-300"}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step > s ? "bg-green-500 text-white" : step === s ? "bg-[#0B1F3A] text-white" : "bg-gray-200 text-gray-400"}`}>
                        {step > s ? "✓" : s}
                      </div>
                      {s === 1 ? "Cliente" : s === 2 ? "Procedimento" : "Profissional"}
                      {s < 3 && <ChevronRight className="w-3 h-3 text-gray-300 ml-1" />}
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={resetNovo} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Step 1 - Selecionar cliente */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700">Selecione o cliente</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={busca}
                      onChange={e => setBusca(e.target.value)}
                      placeholder="Buscar por nome ou CPF..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20"
                    />
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {clientesFiltrados.map(c => (
                      <div
                        key={c.id}
                        onClick={() => setSelCliente(c)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border ${selCliente?.id === c.id ? "border-[#0B1F3A] bg-[#0B1F3A]/5" : "border-gray-100 hover:bg-gray-50"}`}
                      >
                        <div className="w-9 h-9 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {c.nome.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{c.nome}</p>
                          <p className="text-xs text-gray-400">{c.cpf} • {c.telefone}</p>
                        </div>
                        {selCliente?.id === c.id && <CheckCircle className="w-4 h-4 text-[#0B1F3A] ml-auto" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 - Procedimento */}
              {step === 2 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700">Selecione o procedimento</h3>
                  {procedimentos.filter(p => p).map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelProcedimento(p)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition border ${selProcedimento?.id === p.id ? "border-[#0B1F3A] bg-[#0B1F3A]/5" : "border-gray-100 hover:bg-gray-50"}`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{p.nome}</p>
                        <p className="text-xs text-gray-400">{p.duracao} min</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#0B1F3A]">{fmt(p.valor)}</p>
                        {selProcedimento?.id === p.id && <CheckCircle className="w-4 h-4 text-[#0B1F3A] ml-auto mt-1" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3 - Profissional */}
              {step === 3 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700">Selecione o profissional</h3>
                  {profissionais.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelProfissional(p)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border ${selProfissional?.id === p.id ? "border-[#0B1F3A] bg-[#0B1F3A]/5" : "border-gray-100 hover:bg-gray-50"}`}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-[#0B1F3A] to-[#4F7FAE] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {p.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{p.nome}</p>
                        <p className="text-xs text-gray-400">{p.especialidade}</p>
                      </div>
                      {selProfissional?.id === p.id && <CheckCircle className="w-4 h-4 text-[#0B1F3A] ml-auto" />}
                    </div>
                  ))}
                  {/* Resumo */}
                  {selCliente && selProcedimento && (
                    <div className="mt-4 p-4 bg-[#0B1F3A]/5 rounded-xl border border-[#0B1F3A]/10">
                      <p className="text-xs font-semibold text-[#0B1F3A] mb-2">Resumo do agendamento</p>
                      <p className="text-sm text-gray-700"><span className="font-medium">Cliente:</span> {selCliente.nome}</p>
                      <p className="text-sm text-gray-700"><span className="font-medium">Procedimento:</span> {selProcedimento.nome}</p>
                      <p className="text-sm text-gray-700"><span className="font-medium">Valor:</span> {fmt(selProcedimento.valor)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3">
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition">
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </button>
              )}
              <div className="flex-1" />
              {step < 3 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={step === 1 && !selCliente || step === 2 && !selProcedimento}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:shadow-md transition"
                >
                  Próximo <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSalvarNovo}
                  disabled={!selProfissional || savingNovo}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:shadow-md transition"
                >
                  {savingNovo ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirmar Agendamento
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
