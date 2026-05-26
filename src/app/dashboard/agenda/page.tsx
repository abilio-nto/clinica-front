"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Plus, Clock, Users, ChevronRight,
  CheckCircle, AlertCircle, Loader2, BarChart3,
  UserPlus, XCircle, Search, X
} from "lucide-react";
import { mockDelay } from "@/services/mockData";
import {
  USE_MOCK, fetchClientes, fetchProcedimentos,
  agendarSlotAgenda, cancelarSlotAgenda,
} from "@/services/apiWrapper";
import { api } from "@/services/api";

interface ItAgenda {
  id: number;
  hrAgendamento: string;
  status: string;
  procedimento: string | null;
  nomeCliente: string | null;
}

interface Agenda {
  id: number;
  dtAgenda: string;
  totalVagas: number;
  vagasDisponiveis: number;
  vagasOcupadas: number;
  atendidos: number;
  itensAgenda: ItAgenda[];
}

interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
}

interface Procedimento {
  id: number;
  nome: string;
  valor: number;
  duracao: number;
  ativo?: boolean;
}

const MOCK_AGENDAS: Agenda[] = [
  {
    id: 1, dtAgenda: "2026-05-26", totalVagas: 8, vagasDisponiveis: 2, vagasOcupadas: 6, atendidos: 2,
    itensAgenda: [
      { id: 101, hrAgendamento: "08:00", status: "FINALIZADO", procedimento: "Limpeza de Pele", nomeCliente: "Juliana Souza" },
      { id: 102, hrAgendamento: "09:00", status: "FINALIZADO", procedimento: "Botox", nomeCliente: "Mariana Santos" },
      { id: 103, hrAgendamento: "10:00", status: "EM_ANDAMENTO", procedimento: "Drenagem Linfática", nomeCliente: "Camila Rodrigues" },
      { id: 104, hrAgendamento: "11:00", status: "AGENDADO", procedimento: "Peeling Químico", nomeCliente: "Tatiane Ferreira" },
      { id: 105, hrAgendamento: "14:00", status: "AGENDADO", procedimento: "Harmonização Facial", nomeCliente: "Patricia Alves" },
      { id: 106, hrAgendamento: "15:00", status: "DISPONIVEL", procedimento: null, nomeCliente: null },
      { id: 107, hrAgendamento: "16:00", status: "AGENDADO", procedimento: "Massagem Relaxante", nomeCliente: "Gabriela Lima" },
      { id: 108, hrAgendamento: "17:00", status: "DISPONIVEL", procedimento: null, nomeCliente: null },
    ]
  },
  {
    id: 2, dtAgenda: "2026-05-27", totalVagas: 8, vagasDisponiveis: 5, vagasOcupadas: 3, atendidos: 0,
    itensAgenda: [
      { id: 201, hrAgendamento: "09:00", status: "AGENDADO", procedimento: "Botox", nomeCliente: "Fernanda Costa" },
      { id: 202, hrAgendamento: "10:00", status: "AGENDADO", procedimento: "Peeling Químico", nomeCliente: "Roberta Mendes" },
      { id: 203, hrAgendamento: "11:00", status: "AGENDADO", procedimento: "Limpeza de Pele", nomeCliente: "Mariana Santos" },
      { id: 204, hrAgendamento: "14:00", status: "DISPONIVEL", procedimento: null, nomeCliente: null },
      { id: 205, hrAgendamento: "15:00", status: "DISPONIVEL", procedimento: null, nomeCliente: null },
      { id: 206, hrAgendamento: "16:00", status: "DISPONIVEL", procedimento: null, nomeCliente: null },
      { id: 207, hrAgendamento: "17:00", status: "DISPONIVEL", procedimento: null, nomeCliente: null },
    ]
  },
  {
    id: 3, dtAgenda: "2026-05-28", totalVagas: 8, vagasDisponiveis: 7, vagasOcupadas: 1, atendidos: 0,
    itensAgenda: [
      { id: 301, hrAgendamento: "10:00", status: "AGENDADO", procedimento: "Botox", nomeCliente: "Juliana Souza" },
      { id: 302, hrAgendamento: "11:00", status: "DISPONIVEL", procedimento: null, nomeCliente: null },
      { id: 303, hrAgendamento: "14:00", status: "DISPONIVEL", procedimento: null, nomeCliente: null },
    ]
  },
];

const STATUS_COLOR: Record<string, string> = {
  DISPONIVEL: "bg-gray-100 text-gray-400",
  AGENDADO: "bg-blue-100 text-blue-700",
  EM_ANDAMENTO: "bg-amber-100 text-amber-700",
  FINALIZADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  DISPONIVEL: "Livre",
  AGENDADO: "Agendado",
  EM_ANDAMENTO: "Andamento",
  FINALIZADO: "Concluído",
  CANCELADO: "Cancelado",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function AgendaPage() {
  const router = useRouter();
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Modal agendar slot
  const [showAgendar, setShowAgendar] = useState(false);
  const [slotParaAgendar, setSlotParaAgendar] = useState<{ agendaId: number; slot: ItAgenda } | null>(null);
  const [selCliente, setSelCliente] = useState<Cliente | null>(null);
  const [selProcedimento, setSelProcedimento] = useState<Procedimento | null>(null);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [savingAgendar, setSavingAgendar] = useState(false);

  // Modal cancelar slot
  const [showCancelarSlot, setShowCancelarSlot] = useState(false);
  const [slotParaCancelar, setSlotParaCancelar] = useState<{ agendaId: number; slot: ItAgenda } | null>(null);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setIsLoading(true);
    try {
      const [c, p] = await Promise.all([fetchClientes(), fetchProcedimentos()]);
      setClientes(c as Cliente[]);
      setProcedimentos(p as Procedimento[]);

      if (USE_MOCK) {
        await mockDelay();
        setAgendas(MOCK_AGENDAS);
      } else {
        const res = await api.get("/agendas/ListAll");
        setAgendas(res.data);
      }
    } catch { console.error("Erro ao carregar agendas"); }
    finally { setIsLoading(false); }
  }

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const fmtDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    if (date.toDateString() === hoje.toDateString()) return "Hoje";
    if (date.toDateString() === amanha.toDateString()) return "Amanhã";
    return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
  };

  function openAgendar(agendaId: number, slot: ItAgenda) {
    setSlotParaAgendar({ agendaId, slot });
    setSelCliente(null);
    setSelProcedimento(null);
    setBuscaCliente("");
    setShowAgendar(true);
  }

  function openCancelar(agendaId: number, slot: ItAgenda) {
    setSlotParaCancelar({ agendaId, slot });
    setShowCancelarSlot(true);
  }

  async function handleConfirmarAgendamento() {
    if (!slotParaAgendar || !selCliente || !selProcedimento) return;
    setSavingAgendar(true);
    try {
      await agendarSlotAgenda(slotParaAgendar.slot.id, selCliente.id, selProcedimento.id);
      setAgendas(prev => prev.map(a =>
        a.id === slotParaAgendar.agendaId ? {
          ...a,
          vagasDisponiveis: Math.max(0, a.vagasDisponiveis - 1),
          vagasOcupadas: a.vagasOcupadas + 1,
          itensAgenda: a.itensAgenda.map(it =>
            it.id === slotParaAgendar.slot.id
              ? { ...it, status: "AGENDADO", nomeCliente: selCliente.nome, procedimento: selProcedimento.nome }
              : it
          ),
        } : a
      ));
      setShowAgendar(false);
      setSlotParaAgendar(null);
      showToast("Agendamento realizado com sucesso!", "ok");
    } catch { showToast("Erro ao realizar agendamento", "err"); }
    finally { setSavingAgendar(false); }
  }

  async function handleConfirmarCancelamento() {
    if (!slotParaCancelar) return;
    setCancelando(true);
    try {
      await cancelarSlotAgenda(slotParaCancelar.slot.id);
      setAgendas(prev => prev.map(a =>
        a.id === slotParaCancelar.agendaId ? {
          ...a,
          vagasDisponiveis: a.vagasDisponiveis + 1,
          vagasOcupadas: Math.max(0, a.vagasOcupadas - 1),
          itensAgenda: a.itensAgenda.map(it =>
            it.id === slotParaCancelar.slot.id
              ? { ...it, status: "DISPONIVEL", nomeCliente: null, procedimento: null }
              : it
          ),
        } : a
      ));
      setShowCancelarSlot(false);
      setSlotParaCancelar(null);
      showToast("Agendamento cancelado. Vaga liberada.", "ok");
    } catch { showToast("Erro ao cancelar agendamento", "err"); }
    finally { setCancelando(false); }
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
    c.cpf.includes(buscaCliente)
  );

  const procedimentosAtivos = procedimentos.filter(p => p.ativo !== false);

  const agendaDoSlot = slotParaAgendar
    ? agendas.find(a => a.id === slotParaAgendar.agendaId)
    : null;

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
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Agenda</h1>
            <p className="text-sm text-gray-500">Gerenciamento de horários e atendimentos</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard/agenda/gerar")}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Nova Agenda
        </button>
      </div>

      {/* Resumo geral */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Dias com agenda", value: agendas.length, color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "Total de vagas", value: agendas.reduce((s, a) => s + a.totalVagas, 0), color: "bg-gray-50 text-gray-600 border-gray-200" },
          { label: "Vagas ocupadas", value: agendas.reduce((s, a) => s + a.vagasOcupadas, 0), color: "bg-amber-50 text-amber-700 border-amber-200" },
          { label: "Vagas disponíveis", value: agendas.reduce((s, a) => s + a.vagasDisponiveis, 0), color: "bg-green-50 text-green-700 border-green-200" },
        ].map((k, i) => (
          <div key={i} className={`rounded-2xl border p-4 text-center ${k.color}`}>
            <p className="text-2xl font-bold">{k.value}</p>
            <p className="text-xs mt-0.5 font-medium opacity-80">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Lista de agendas */}
      {agendas.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
          <Calendar className="w-14 h-14 text-gray-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-600 mb-1">Nenhuma agenda encontrada</h3>
          <p className="text-sm text-gray-400 mb-4">Crie uma nova agenda para começar</p>
          <button
            onClick={() => router.push("/dashboard/agenda/gerar")}
            className="px-5 py-2.5 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white rounded-xl text-sm font-semibold"
          >
            Criar primeira agenda
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {agendas.map(agenda => {
            const isExpanded = expandedId === agenda.id;
            const ocupacao = agenda.totalVagas > 0
              ? Math.round((agenda.vagasOcupadas / agenda.totalVagas) * 100)
              : 0;
            const agendaDate = new Date(agenda.dtAgenda + "T00:00:00");
            const hoje = new Date();
            const isToday = agendaDate.toDateString() === hoje.toDateString();

            return (
              <div key={agenda.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 transition-all ${isToday ? "border-[#0B1F3A]/20" : "border-transparent"}`}>
                {/* Card header */}
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpandedId(isExpanded ? null : agenda.id)}
                >
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 ${isToday ? "bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] text-white" : "bg-gray-100 text-gray-700"}`}>
                    <span className="text-xs font-medium opacity-70">
                      {agendaDate.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase()}
                    </span>
                    <span className="text-2xl font-bold leading-tight">{agendaDate.getDate()}</span>
                    {isToday && <span className="text-xs opacity-70">Hoje</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[#0B1F3A]">{fmtDate(agenda.dtAgenda)}</h3>
                      {isToday && (
                        <span className="px-2 py-0.5 bg-[#0B1F3A] text-white text-xs rounded-full font-semibold">Hoje</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {agenda.itensAgenda.length} horários
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {agenda.vagasOcupadas}/{agenda.totalVagas} ocupados
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {agenda.vagasDisponiveis} disponíveis
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0B1F3A] to-[#4F7FAE] rounded-full transition-all"
                        style={{ width: `${ocupacao}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); router.push(`/dashboard/agenda/${agenda.id}`); }}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1F3A]/5 text-[#0B1F3A] rounded-lg text-xs font-medium hover:bg-[#0B1F3A]/10 transition"
                    >
                      <BarChart3 className="w-3.5 h-3.5" /> Detalhes
                    </button>
                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </div>

                {/* Horários expandidos */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <div className="divide-y divide-gray-50">
                      {agenda.itensAgenda.map(item => (
                        <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/80 transition group">
                          <span className="text-xs font-bold text-[#1C4468] w-10 shrink-0">{item.hrAgendamento}</span>

                          <div className="flex-1 min-w-0">
                            {item.nomeCliente ? (
                              <>
                                <p className="text-xs font-medium text-gray-800 truncate">{item.nomeCliente}</p>
                                <p className="text-xs text-gray-400 truncate">{item.procedimento || "Procedimento não definido"}</p>
                              </>
                            ) : (
                              <p className="text-xs text-gray-400 italic">Horário disponível</p>
                            )}
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_COLOR[item.status] || STATUS_COLOR["DISPONIVEL"]}`}>
                            {STATUS_LABEL[item.status] || item.status}
                          </span>

                          {item.status === "DISPONIVEL" && (
                            <button
                              onClick={e => { e.stopPropagation(); openAgendar(agenda.id, item); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition shrink-0"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span className="hidden sm:inline">Agendar</span>
                            </button>
                          )}

                          {item.status === "AGENDADO" && (
                            <button
                              onClick={e => { e.stopPropagation(); openCancelar(agenda.id, item); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold transition shrink-0"
                            >
                              <XCircle className="w-3 h-3" />
                              <span className="hidden sm:inline">Cancelar</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-gray-50 flex justify-end">
                      <button
                        onClick={() => router.push(`/dashboard/agenda/${agenda.id}`)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white rounded-xl text-xs font-semibold"
                      >
                        Ver agenda completa <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Modal Agendar Slot ─── */}
      {showAgendar && slotParaAgendar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            <div className="border-b px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-lg font-bold text-[#0B1F3A]">Agendar Horário</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {slotParaAgendar.slot.hrAgendamento}
                  {agendaDoSlot && ` — ${fmtDate(agendaDoSlot.dtAgenda)}`}
                </p>
              </div>
              <button onClick={() => setShowAgendar(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Busca de cliente */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Selecionar cliente</label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={buscaCliente}
                    onChange={e => setBuscaCliente(e.target.value)}
                    placeholder="Buscar por nome ou CPF..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"
                  />
                </div>
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {clientesFiltrados.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setSelCliente(c)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border ${selCliente?.id === c.id ? "border-[#0B1F3A] bg-[#0B1F3A]/5" : "border-gray-100 hover:bg-gray-50"}`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.nome.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{c.nome}</p>
                        <p className="text-xs text-gray-400">{c.cpf} • {c.telefone}</p>
                      </div>
                      {selCliente?.id === c.id && <CheckCircle className="w-4 h-4 text-[#0B1F3A] shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Procedimento */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Selecionar procedimento</label>
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {procedimentosAtivos.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelProcedimento(p)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition border ${selProcedimento?.id === p.id ? "border-[#0B1F3A] bg-[#0B1F3A]/5" : "border-gray-100 hover:bg-gray-50"}`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{p.nome}</p>
                        <p className="text-xs text-gray-400">{p.duracao} min</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="text-sm font-bold text-[#0B1F3A]">{fmt(p.valor)}</p>
                        {selProcedimento?.id === p.id && <CheckCircle className="w-4 h-4 text-[#0B1F3A]" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo */}
              {selCliente && selProcedimento && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs font-semibold text-green-700 mb-2">Resumo do agendamento</p>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><span className="font-medium">Horário:</span> {slotParaAgendar.slot.hrAgendamento}</p>
                    <p><span className="font-medium">Cliente:</span> {selCliente.nome}</p>
                    <p><span className="font-medium">Procedimento:</span> {selProcedimento.nome}</p>
                    <p><span className="font-medium">Valor:</span> {fmt(selProcedimento.valor)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t px-6 py-4 flex gap-3 bg-gray-50 shrink-0">
              <button onClick={() => setShowAgendar(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition">
                Cancelar
              </button>
              <button
                onClick={handleConfirmarAgendamento}
                disabled={!selCliente || !selProcedimento || savingAgendar}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:shadow-md transition"
              >
                {savingAgendar ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Cancelar Slot ─── */}
      {showCancelarSlot && slotParaCancelar && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Cancelar Agendamento</h3>
                <p className="text-xs text-gray-500">
                  {slotParaCancelar.slot.hrAgendamento} • {slotParaCancelar.slot.nomeCliente}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Deseja cancelar o agendamento de <strong>{slotParaCancelar.slot.nomeCliente}</strong> às{" "}
              <strong>{slotParaCancelar.slot.hrAgendamento}</strong>?
              O horário ficará disponível novamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelarSlot(false)}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmarCancelamento}
                disabled={cancelando}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {cancelando ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
