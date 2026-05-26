"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Plus, Clock, Users, ChevronRight,
  CheckCircle, AlertCircle, Loader2, BarChart3
} from "lucide-react";
import { mockDelay } from "@/services/mockData";
import { USE_MOCK } from "@/services/apiWrapper";
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

export default function AgendaPage() {
  const router = useRouter();
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setIsLoading(true);
    try {
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

  const fmtDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    if (date.toDateString() === hoje.toDateString()) return "Hoje";
    if (date.toDateString() === amanha.toDateString()) return "Amanhã";
    return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
  };

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
            const ocupacao = Math.round((agenda.vagasOcupadas / agenda.totalVagas) * 100);
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
                  {/* Data */}
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 ${isToday ? "bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] text-white" : "bg-gray-100 text-gray-700"}`}>
                    <span className="text-xs font-medium opacity-70">
                      {agendaDate.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase()}
                    </span>
                    <span className="text-2xl font-bold leading-tight">{agendaDate.getDate()}</span>
                    {isToday && <span className="text-xs opacity-70">Hoje</span>}
                  </div>

                  {/* Info */}
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
                    {/* Barra de ocupação */}
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0B1F3A] to-[#4F7FAE] rounded-full transition-all"
                        style={{ width: `${ocupacao}%` }}
                      />
                    </div>
                  </div>

                  {/* Ações */}
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
                        <div key={item.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition">
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
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[item.status] || STATUS_COLOR["DISPONIVEL"]}`}>
                            {item.status === "DISPONIVEL" ? "Livre" :
                             item.status === "EM_ANDAMENTO" ? "Andamento" :
                             item.status === "FINALIZADO" ? "Concluído" :
                             item.status === "AGENDADO" ? "Agendado" : item.status}
                          </span>
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
    </div>
  );
}
