"use client";

import { useState, useEffect } from "react";
import {
  Calendar, Clock, User, Phone, Mail,
  CheckCircle, Play, X, AlertCircle,
  Loader2, Activity, Star
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchAgendamentosHoje, iniciarAtendimento, finalizarAtendimento } from "@/services/apiWrapper";
import { MOCK_AGENDAMENTOS_HOJE } from "@/services/mockData";

interface Agendamento {
  id: number;
  hrAgendamento: string;
  procedimento: string | null;
  status: string;
  nomeCliente: string | null;
  telefoneCliente: string | null;
  emailCliente: string | null;
  valorProcedimento: number;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  AGENDADO: { label: "Agendado", color: "text-blue-700", bg: "bg-blue-100" },
  EM_ANDAMENTO: { label: "Em andamento", color: "text-amber-700", bg: "bg-amber-100" },
  FINALIZADO: { label: "Finalizado", color: "text-green-700", bg: "bg-green-100" },
  CANCELADO: { label: "Cancelado", color: "text-red-700", bg: "bg-red-100" },
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function ProfissionalDashboard() {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [selected, setSelected] = useState<Agendamento | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setIsLoading(true);
    try {
      const data = await fetchAgendamentosHoje();
      // Filtra apenas os agendamentos do profissional logado (mock: todos)
      setAgendamentos((data as Agendamento[]).filter(a => a.status !== "DISPONIVEL"));
    } catch { showToast("Erro ao carregar agenda", "err"); }
    finally { setIsLoading(false); }
  }

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const totalHoje = agendamentos.length;
  const concluidos = agendamentos.filter(a => a.status === "FINALIZADO").length;
  const emAndamento = agendamentos.filter(a => a.status === "EM_ANDAMENTO").length;
  const faturamento = agendamentos
    .filter(a => a.status === "FINALIZADO")
    .reduce((s, a) => s + a.valorProcedimento, 0);

  async function handleIniciar() {
    if (!selected) return;
    setActionLoading(true);
    try {
      await iniciarAtendimento(selected.id, observacoes);
      setAgendamentos(prev => prev.map(a => a.id === selected.id ? { ...a, status: "EM_ANDAMENTO" } : a));
      setShowModal(false);
      showToast("Atendimento iniciado!", "ok");
    } catch { showToast("Erro ao iniciar", "err"); }
    finally { setActionLoading(false); }
  }

  async function handleFinalizar() {
    if (!selected) return;
    setActionLoading(true);
    try {
      await finalizarAtendimento(selected.id, observacoes);
      setAgendamentos(prev => prev.map(a => a.id === selected.id ? { ...a, status: "FINALIZADO" } : a));
      setShowModal(false);
      showToast("Atendimento finalizado!", "ok");
    } catch { showToast("Erro ao finalizar", "err"); }
    finally { setActionLoading(false); }
  }

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 ${toast.type === "ok" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.type === "ok" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-xl shadow-md">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3A]">
            Olá, {user?.pessoa?.nome?.split(" ")[0] || "Profissional"}!
          </h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Atendimentos hoje", value: totalHoje, color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "Em andamento", value: emAndamento, color: "bg-amber-50 text-amber-700 border-amber-200" },
          { label: "Concluídos", value: concluidos, color: "bg-green-50 text-green-700 border-green-200" },
          { label: "Faturado hoje", value: fmt(faturamento), color: "bg-purple-50 text-purple-700 border-purple-200" },
        ].map((k, i) => (
          <div key={i} className={`rounded-2xl border p-4 text-center ${k.color}`}>
            <p className="text-xl sm:text-2xl font-bold">{k.value}</p>
            <p className="text-xs mt-0.5 font-medium opacity-80">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Lista de atendimentos */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-[#0B1F3A]">Minha Agenda de Hoje</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {agendamentos.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Nenhum atendimento hoje</p>
            </div>
          ) : agendamentos.map(a => {
            const cfg = STATUS_CFG[a.status] || STATUS_CFG["AGENDADO"];
            return (
              <div
                key={a.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition cursor-pointer group"
                onClick={() => { setSelected(a); setObservacoes(""); setShowModal(true); }}
              >
                <div className="w-14 shrink-0">
                  <span className="text-sm font-bold text-[#1C4468]">{a.hrAgendamento}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{a.nomeCliente || "—"}</p>
                  <p className="text-xs text-gray-400 truncate">{a.procedimento || "Procedimento não definido"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  {a.status === "AGENDADO" && (
                    <Play className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition" />
                  )}
                  {a.status === "EM_ANDAMENTO" && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="font-bold text-[#0B1F3A]">Atendimento #{selected.id}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${STATUS_CFG[selected.status]?.bg} ${STATUS_CFG[selected.status]?.color}`}>
                {STATUS_CFG[selected.status]?.label}
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-400">Horário</p>
                  <p className="font-semibold text-sm text-[#0B1F3A]">{selected.hrAgendamento}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-400">Valor</p>
                  <p className="font-semibold text-sm text-[#0B1F3A]">
                    {selected.valorProcedimento > 0 ? fmt(selected.valorProcedimento) : "—"}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                <p className="text-xs text-gray-400">Cliente</p>
                <p className="font-semibold text-sm text-gray-800">{selected.nomeCliente || "—"}</p>
                {selected.telefoneCliente && (
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{selected.telefoneCliente}</p>
                )}
                {selected.emailCliente && (
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{selected.emailCliente}</p>
                )}
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs text-gray-400">Procedimento</p>
                <p className="font-semibold text-sm text-gray-800">{selected.procedimento || "Não definido"}</p>
              </div>
              {(selected.status === "AGENDADO" || selected.status === "EM_ANDAMENTO") && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Observações</label>
                  <textarea
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    placeholder="Adicione observações do atendimento..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 resize-none"
                    rows={3}
                  />
                </div>
              )}
              <div className="flex gap-2 pt-1">
                {selected.status === "AGENDADO" && (
                  <button
                    onClick={handleIniciar}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Iniciar
                  </button>
                )}
                {selected.status === "EM_ANDAMENTO" && (
                  <button
                    onClick={handleFinalizar}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Finalizar
                  </button>
                )}
                {(selected.status === "FINALIZADO" || selected.status === "CANCELADO") && (
                  <div className="flex-1 text-center py-2.5 bg-gray-100 rounded-xl text-gray-500 text-sm">
                    Atendimento encerrado
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
