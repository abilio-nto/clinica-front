"use client";

import { useState, useEffect } from "react";
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  Loader2, Star, History, Plus, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { mockDelay, MOCK_AGENDAMENTOS_HOJE } from "@/services/mockData";

interface AgendamentoCliente {
  id: number;
  dtAgenda: string;
  hrAgendamento: string;
  procedimento: string | null;
  status: string;
  profissional: string | null;
  valor: number;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  AGENDADO: { label: "Agendado", color: "text-blue-700", bg: "bg-blue-100", icon: Clock },
  CONFIRMADO: { label: "Confirmado", color: "text-green-700", bg: "bg-green-100", icon: CheckCircle },
  CANCELADO: { label: "Cancelado", color: "text-red-700", bg: "bg-red-100", icon: XCircle },
  FINALIZADO: { label: "Finalizado", color: "text-gray-600", bg: "bg-gray-100", icon: CheckCircle },
  EM_ANDAMENTO: { label: "Em andamento", color: "text-amber-700", bg: "bg-amber-100", icon: AlertCircle },
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

// Mock de agendamentos do cliente
const MOCK_AGT_CLIENTE: AgendamentoCliente[] = [
  { id: 1, dtAgenda: "2026-05-26", hrAgendamento: "08:00", procedimento: "Limpeza de Pele", status: "FINALIZADO", profissional: "Dra. Fernanda Costa", valor: 150 },
  { id: 2, dtAgenda: "2026-05-28", hrAgendamento: "10:00", procedimento: "Botox", status: "AGENDADO", profissional: "Dra. Larissa Moura", valor: 450 },
  { id: 3, dtAgenda: "2026-04-15", hrAgendamento: "14:00", procedimento: "Drenagem Linfática", status: "FINALIZADO", profissional: "Dra. Amanda Silveira", valor: 120 },
  { id: 4, dtAgenda: "2026-03-22", hrAgendamento: "09:00", procedimento: "Peeling Químico", status: "CANCELADO", profissional: "Dra. Fernanda Costa", valor: 250 },
];

export default function ClienteDashboard() {
  const { user } = useAuth();
  const [proximos, setProximos] = useState<AgendamentoCliente[]>([]);
  const [historico, setHistorico] = useState<AgendamentoCliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    await mockDelay();
    const agora = new Date();
    const futuros = MOCK_AGT_CLIENTE.filter(a =>
      new Date(a.dtAgenda) >= agora && a.status !== "CANCELADO"
    );
    const passados = MOCK_AGT_CLIENTE.filter(a =>
      new Date(a.dtAgenda) < agora || a.status === "CANCELADO"
    );
    setProximos(futuros);
    setHistorico(passados);
    setIsLoading(false);
  }

  const totalAtendimentos = MOCK_AGT_CLIENTE.filter(a => a.status === "FINALIZADO").length;
  const totalGasto = MOCK_AGT_CLIENTE
    .filter(a => a.status === "FINALIZADO")
    .reduce((s, a) => s + a.valor, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="w-8 h-8 animate-spin text-[#0B1F3A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Saudação */}
      <div className="bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Olá, {user?.pessoa?.nome?.split(" ")[0] || "Cliente"}! ✨
        </h1>
        <p className="text-white/70 mt-1 text-sm">Sua área de agendamentos e histórico</p>
        <div className="flex gap-4 mt-4">
          <div className="bg-white/10 rounded-xl p-3 text-center min-w-[80px]">
            <p className="text-xl font-bold">{totalAtendimentos}</p>
            <p className="text-xs text-white/70">Atendimentos</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center min-w-[80px]">
            <p className="text-xl font-bold">{fmt(totalGasto)}</p>
            <p className="text-xs text-white/70">Investido</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center min-w-[80px]">
            <p className="text-xl font-bold">{proximos.length}</p>
            <p className="text-xs text-white/70">Próximos</p>
          </div>
        </div>
      </div>

      {/* CTA novo agendamento */}
      <Link
        href="/agendamento"
        className="flex items-center justify-between w-full p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#0B1F3A]/20 transition group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0B1F3A] to-[#4F7FAE] rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-[#0B1F3A] text-sm">Agendar novo tratamento</p>
            <p className="text-xs text-gray-400">Clique para ver horários disponíveis</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#0B1F3A] transition" />
      </Link>

      {/* Próximos agendamentos */}
      {proximos.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0B1F3A]" />
            <h2 className="font-bold text-[#0B1F3A]">Próximos Agendamentos</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {proximos.map(a => {
              const cfg = STATUS_CFG[a.status] || STATUS_CFG["AGENDADO"];
              const Icon = cfg.icon;
              return (
                <div key={a.id} className="flex items-center gap-4 px-5 py-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.procedimento || "—"}</p>
                    <p className="text-xs text-gray-400">
                      {fmtDate(a.dtAgenda)} às {a.hrAgendamento}
                      {a.profissional ? ` • ${a.profissional}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#0B1F3A]">{fmt(a.valor)}</p>
                    <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Histórico */}
      {historico.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <History className="w-4 h-4 text-gray-500" />
            <h2 className="font-bold text-[#0B1F3A]">Histórico</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {historico.map(a => {
              const cfg = STATUS_CFG[a.status] || STATUS_CFG["FINALIZADO"];
              return (
                <div key={a.id} className="flex items-center gap-4 px-5 py-3.5 opacity-75">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{a.procedimento || "—"}</p>
                    <p className="text-xs text-gray-400">{fmtDate(a.dtAgenda)} às {a.hrAgendamento}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${cfg.bg} ${cfg.color}`}>{cfg.label}</p>
                    {a.status === "FINALIZADO" && (
                      <p className="text-xs text-gray-400 mt-0.5">{fmt(a.valor)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rating e fidelidade */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
        <div className="flex">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`w-5 h-5 ${s <= 4 ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">Cliente fiel!</p>
          <p className="text-xs text-amber-600">Você tem {totalAtendimentos} atendimentos. Continue assim!</p>
        </div>
      </div>
    </div>
  );
}
