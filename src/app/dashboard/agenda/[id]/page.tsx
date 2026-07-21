"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar, Clock, Users, ArrowLeft, CheckCircle,
  XCircle, User, AlertCircle, Loader2, UserPlus, Search, X
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
  valorProcedimento?: number;
  nomeProfissional?: string | null;
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

interface Cliente { id: number; nome: string; cpf: string; telefone: string; }
interface Procedimento { id: number; nome: string; valor: number; duracao: number; ativo?: boolean; }

const MOCK_AGENDAS: Agenda[] = [
  {
    id: 1, dtAgenda: "2026-05-26", totalVagas: 8, vagasDisponiveis: 2, vagasOcupadas: 6, atendidos: 2,
    itensAgenda: [
      { id: 101, hrAgendamento: "08:00", status: "FINALIZADO", procedimento: "Limpeza de Pele", nomeCliente: "Juliana Souza", valorProcedimento: 150, nomeProfissional: "Dra. Fernanda Costa" },
      { id: 102, hrAgendamento: "09:00", status: "FINALIZADO", procedimento: "Botox", nomeCliente: "Mariana Santos", valorProcedimento: 450, nomeProfissional: "Dra. Larissa Moura" },
      { id: 103, hrAgendamento: "10:00", status: "EM_ANDAMENTO", procedimento: "Drenagem Linfática", nomeCliente: "Camila Rodrigues", valorProcedimento: 120, nomeProfissional: "Dra. Amanda Silveira" },
      { id: 104, hrAgendamento: "11:00", status: "AGENDADO", procedimento: "Peeling Químico", nomeCliente: "Tatiane Ferreira", valorProcedimento: 250, nomeProfissional: "Dra. Fernanda Costa" },
      { id: 105, hrAgendamento: "14:00", status: "AGENDADO", procedimento: "Harmonização Facial", nomeCliente: "Patricia Alves", valorProcedimento: 1200, nomeProfissional: "Dra. Larissa Moura" },
      { id: 106, hrAgendamento: "15:00", status: "DISPONIVEL", procedimento: null, nomeCliente: null },
      { id: 107, hrAgendamento: "16:00", status: "AGENDADO", procedimento: "Massagem Relaxante", nomeCliente: "Gabriela Lima", valorProcedimento: 100, nomeProfissional: "Dra. Amanda Silveira" },
      { id: 108, hrAgendamento: "17:00", status: "DISPONIVEL", procedimento: null, nomeCliente: null },
    ]
  },
  {
    id: 2, dtAgenda: "2026-05-27", totalVagas: 8, vagasDisponiveis: 5, vagasOcupadas: 3, atendidos: 0,
    itensAgenda: [
      { id: 201, hrAgendamento: "09:00", status: "AGENDADO", procedimento: "Botox", nomeCliente: "Fernanda Costa", valorProcedimento: 450, nomeProfissional: "Dra. Larissa Moura" },
      { id: 202, hrAgendamento: "10:00", status: "AGENDADO", procedimento: "Peeling Químico", nomeCliente: "Roberta Mendes", valorProcedimento: 250, nomeProfissional: "Dra. Fernanda Costa" },
      { id: 203, hrAgendamento: "11:00", status: "AGENDADO", procedimento: "Limpeza de Pele", nomeCliente: "Mariana Santos", valorProcedimento: 150, nomeProfissional: "Dra. Fernanda Costa" },
      { id: 204, hrAgendamento: "14:00", status: "DISPONIVEL", procedimento: null, nomeCliente: null },
      { id: 205, hrAgendamento: "15:00", status: "DISPONIVEL", procedimento: null, nomeCliente: null },
      { id: 206, hrAgendamento: "16:00", status: "DISPONIVEL", procedimento: null, nomeCliente: null },
      { id: 207, hrAgendamento: "17:00", status: "DISPONIVEL", procedimento: null, nomeCliente: null },
    ]
  },
  {
    id: 3, dtAgenda: "2026-05-28", totalVagas: 8, vagasDisponiveis: 7, vagasOcupadas: 1, atendidos: 0,
    itensAgenda: [
      { id: 301, hrAgendamento: "10:00", status: "AGENDADO", procedimento: "Botox", nomeCliente: "Juliana Souza", valorProcedimento: 450, nomeProfissional: "Dra. Larissa Moura" },
      { id: 302, hrAgendamento: "11:00", status: "DISPONIVEL", procedimento: null, nomeCliente: null },
      { id: 303, hrAgendamento: "14:00", status: "DISPONIVEL", procedimento: null, nomeCliente: null },
    ]
  },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  DISPONIVEL:  { label: "Livre",       color: "text-gray-500",   bg: "bg-gray-100",   border: "border-gray-200" },
  AGENDADO:    { label: "Agendado",    color: "text-blue-700",   bg: "bg-blue-100",   border: "border-blue-200" },
  EM_ANDAMENTO:{ label: "Em andamento",color: "text-amber-700",  bg: "bg-amber-100",  border: "border-amber-200" },
  FINALIZADO:  { label: "Concluído",   color: "text-green-700",  bg: "bg-green-100",  border: "border-green-200" },
  CANCELADO:   { label: "Cancelado",   color: "text-red-700",    bg: "bg-red-100",    border: "border-red-200" },
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function DetalhesAgenda() {
  const params = useParams();
  const router = useRouter();
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Modal agendar
  const [showAgendar, setShowAgendar] = useState(false);
  const [slotParaAgendar, setSlotParaAgendar] = useState<ItAgenda | null>(null);
  const [selCliente, setSelCliente] = useState<Cliente | null>(null);
  const [selProcedimento, setSelProcedimento] = useState<Procedimento | null>(null);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [savingAgendar, setSavingAgendar] = useState(false);

  // Modal cancelar
  const [showCancelar, setShowCancelar] = useState(false);
  const [slotParaCancelar, setSlotParaCancelar] = useState<ItAgenda | null>(null);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    if (params.id) load();
  }, [params.id]);

  async function load() {
    setIsLoading(true);
    setError("");
    try {
      const [c, p] = await Promise.all([fetchClientes(), fetchProcedimentos()]);
      setClientes(c as Cliente[]);
      setProcedimentos(p as Procedimento[]);

      if (USE_MOCK) {
        await mockDelay();
        const found = MOCK_AGENDAS.find(a => a.id === Number(params.id));
        if (!found) { setError("Agenda não encontrada"); return; }
        setAgenda(found);
      } else {
        const res = await api.get(`/agendas/${params.id}`);
        setAgenda(res.data);
      }
    } catch {
      setError("Erro ao carregar detalhes da agenda");
    } finally {
      setIsLoading(false);
    }
  }

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function openAgendar(slot: ItAgenda) {
    setSlotParaAgendar(slot);
    setSelCliente(null);
    setSelProcedimento(null);
    setBuscaCliente("");
    setShowAgendar(true);
  }

  function openCancelar(slot: ItAgenda) {
    setSlotParaCancelar(slot);
    setShowCancelar(true);
  }

  async function handleConfirmarAgendamento() {
    if (!slotParaAgendar || !selCliente || !selProcedimento || !agenda) return;
    setSavingAgendar(true);
    try {
      await agendarSlotAgenda(slotParaAgendar.id, selCliente.id, selProcedimento.id);
      setAgenda(prev => prev ? {
        ...prev,
        vagasDisponiveis: Math.max(0, prev.vagasDisponiveis - 1),
        vagasOcupadas: prev.vagasOcupadas + 1,
        itensAgenda: prev.itensAgenda.map(it =>
          it.id === slotParaAgendar.id
            ? { ...it, status: "AGENDADO", nomeCliente: selCliente.nome, procedimento: selProcedimento.nome, valorProcedimento: selProcedimento.valor }
            : it
        ),
      } : prev);
      setShowAgendar(false);
      showToast("Agendamento realizado com sucesso!", "ok");
    } catch { showToast("Erro ao realizar agendamento", "err"); }
    finally { setSavingAgendar(false); }
  }

  async function handleConfirmarCancelamento() {
    if (!slotParaCancelar || !agenda) return;
    setCancelando(true);
    try {
      await cancelarSlotAgenda(slotParaCancelar.id);
      setAgenda(prev => prev ? {
        ...prev,
        vagasDisponiveis: prev.vagasDisponiveis + 1,
        vagasOcupadas: Math.max(0, prev.vagasOcupadas - 1),
        itensAgenda: prev.itensAgenda.map(it =>
          it.id === slotParaCancelar.id
            ? { ...it, status: "DISPONIVEL", nomeCliente: null, procedimento: null, valorProcedimento: 0 }
            : it
        ),
      } : prev);
      setShowCancelar(false);
      showToast("Agendamento cancelado. Vaga liberada.", "ok");
    } catch { showToast("Erro ao cancelar agendamento", "err"); }
    finally { setCancelando(false); }
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
    c.cpf.includes(buscaCliente)
  );

  const procedimentosAtivos = procedimentos.filter(p => p.ativo !== false);

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

  if (error || !agenda) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <XCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-gray-700 font-semibold mb-1">{error || "Agenda não encontrada"}</p>
          <p className="text-gray-400 text-sm mb-5">Verifique se o ID está correto</p>
          <button
            onClick={() => router.push("/dashboard/agenda")}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white rounded-xl text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Agenda
          </button>
        </div>
      </div>
    );
  }

  const agendaDate = new Date(agenda.dtAgenda + "T00:00:00");
  const ocupacao = agenda.totalVagas > 0
    ? Math.round((agenda.vagasOcupadas / agenda.totalVagas) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 ${toast.type === "ok" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.type === "ok" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Voltar */}
      <button
        onClick={() => router.push("/dashboard/agenda")}
        className="flex items-center gap-2 text-gray-500 hover:text-[#0B1F3A] transition text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Agenda
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-2xl shadow-md">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0B1F3A]">
                {agendaDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">Detalhes dos horários de atendimento</p>
            </div>
          </div>

          <div className="flex gap-3">
            {[
              { label: "Total", value: agenda.totalVagas, cls: "bg-gray-50 text-gray-700" },
              { label: "Disponíveis", value: agenda.vagasDisponiveis, cls: "bg-green-50 text-green-700" },
              { label: "Ocupadas", value: agenda.vagasOcupadas, cls: "bg-blue-50 text-blue-700" },
            ].map(k => (
              <div key={k.label} className={`rounded-xl px-4 py-2 text-center ${k.cls}`}>
                <p className="text-xs opacity-70 font-medium">{k.label}</p>
                <p className="text-xl font-bold">{k.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ocupação */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Ocupação</span>
            <span>{ocupacao}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0B1F3A] to-[#4F7FAE] rounded-full transition-all"
              style={{ width: `${ocupacao}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lista de horários */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0B1F3A]" />
          <h2 className="font-bold text-[#0B1F3A]">Horários — {agenda.itensAgenda.length} slots</h2>
        </div>

        <div className="divide-y divide-gray-50">
          {agenda.itensAgenda.map(item => {
            const cfg = STATUS_CFG[item.status] || STATUS_CFG["DISPONIVEL"];
            const isDisponivel = item.status === "DISPONIVEL";
            const isAgendado = item.status === "AGENDADO";

            return (
              <div key={item.id} className={`flex items-center gap-4 px-6 py-4 transition group ${isDisponivel ? "bg-green-50/30 hover:bg-green-50/60" : "hover:bg-gray-50/80"}`}>
                {/* Hora */}
                <div className={`w-14 text-base font-bold shrink-0 ${isDisponivel ? "text-green-600" : "text-[#1C4468]"}`}>
                  {item.hrAgendamento}
                </div>

                {/* Status badge */}
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                  {cfg.label}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {isDisponivel ? (
                    <p className="text-sm text-gray-400 italic">Horário disponível para agendamento</p>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {item.nomeCliente || "—"}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400 mt-0.5">
                        {item.procedimento && <span>{item.procedimento}</span>}
                        {item.nomeProfissional && <span>• {item.nomeProfissional}</span>}
                        {item.valorProcedimento && item.valorProcedimento > 0 && (
                          <span className="text-[#1C4468] font-semibold">• {fmt(item.valorProcedimento)}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Ações */}
                {isDisponivel && (
                  <button
                    onClick={() => openAgendar(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Agendar</span>
                  </button>
                )}
                {isAgendado && (
                  <button
                    onClick={() => openCancelar(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold transition shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cancelar</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {agenda.vagasDisponiveis} vaga{agenda.vagasDisponiveis !== 1 ? "s" : ""} disponível{agenda.vagasDisponiveis !== 1 ? "is" : ""}
          </p>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-gray-400">
              <Users className="w-3.5 h-3.5" /> {agenda.vagasOcupadas} ocupadas
            </span>
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3.5 h-3.5" /> {agenda.atendidos} concluídas
            </span>
          </div>
        </div>
      </div>

      {/* ─── Modal Agendar Slot ─── */}
      {showAgendar && slotParaAgendar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            <div className="border-b px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-lg font-bold text-[#0B1F3A]">Agendar Horário</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {slotParaAgendar.hrAgendamento}
                </p>
              </div>
              <button onClick={() => setShowAgendar(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Cliente */}
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
                    <p><span className="font-medium">Horário:</span> {slotParaAgendar.hrAgendamento}</p>
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
      {showCancelar && slotParaCancelar && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Cancelar Agendamento</h3>
                <p className="text-xs text-gray-500">
                  {slotParaCancelar.hrAgendamento} • {slotParaCancelar.nomeCliente}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Deseja cancelar o agendamento de <strong>{slotParaCancelar.nomeCliente}</strong> às{" "}
              <strong>{slotParaCancelar.hrAgendamento}</strong>? O horário ficará disponível novamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelar(false)}
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
