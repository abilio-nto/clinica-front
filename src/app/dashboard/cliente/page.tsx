"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, User, Phone, Mail, Calendar as CalendarIcon, CheckCircle, XCircle, AlertCircle, Loader2, Star, History, Bell } from "lucide-react";
import Link from "next/link";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface AgendamentoCliente {
  id: number;
  dtAgenda: string;
  hrAgendamento: string;
  procedimento: string;
  status: string;
  profissional: string;
  valor: number;
}

export default function ClienteDashboard() {
  const { user } = useAuth();
  const [proximosAgendamentos, setProximosAgendamentos] = useState<AgendamentoCliente[]>([]);
  const [historicoAgendamentos, setHistoricoAgendamentos] = useState<AgendamentoCliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAgendamentos();
    }
  }, [user]);

  async function fetchAgendamentos() {
    try {
      const response = await api.get(`/agendamentos/cliente/${user?.id}`);
      const agora = new Date();
      
      const futuros = response.data.filter((a: AgendamentoCliente) => 
        new Date(a.dtAgenda) >= agora && a.status !== 'CANCELADO'
      );
      const passados = response.data.filter((a: AgendamentoCliente) => 
        new Date(a.dtAgenda) < agora || a.status === 'CANCELADO'
      );
      
      setProximosAgendamentos(futuros);
      setHistoricoAgendamentos(passados);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'AGENDADO': return 'bg-blue-100 text-blue-700';
      case 'CONFIRMADO': return 'bg-green-100 text-green-700';
      case 'CANCELADO': return 'bg-red-100 text-red-700';
      case 'FINALIZADO': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-xl">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] bg-clip-text text-transparent">
              Meus Agendamentos
            </h1>
            <p className="text-gray-500 mt-1">Gerencie seus horários e tratamentos</p>
          </div>
        </div>
      </div>

      {/* Dados do Cliente */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.nome?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0B1F3A]">{user?.nome}</h2>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Phone className="w-4 h-4" />
                <span>{user?.telefone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão Novo Agendamento */}
      <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-bold">Agendar novo horário</h3>
            <p className="text-white/80 text-sm mt-1">Escolha o melhor horário para seu próximo tratamento</p>
          </div>
          <Link href="/agendamento" className="bg-white text-[#0B1F3A] px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition">
            Agendar Agora →
          </Link>
        </div>
      </div>

      {/* Próximos Agendamentos */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#0B1F3A]" />
            <h2 className="text-xl font-bold text-[#0B1F3A]">Próximos Agendamentos</h2>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0B1F3A] mx-auto" />
          </div>
        ) : proximosAgendamentos.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Você não tem agendamentos futuros</p>
            <p className="text-sm">Clique em "Agendar Agora" para marcar seu próximo horário</p>
          </div>
        ) : (
          <div className="divide-y">
            {proximosAgendamentos.map((agendamento) => (
              <div key={agendamento.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <CalendarIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{agendamento.procedimento}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                        <span>📅 {formatarData(agendamento.dtAgenda)}</span>
                        <span>🕐 {agendamento.hrAgendamento.substring(0, 5)}</span>
                        <span>👩‍⚕️ {agendamento.profissional}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                      {agendamento.status}
                    </span>
                    <button className="text-[#0B1F3A] text-sm hover:underline">
                      Detalhes →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Histórico */}
      {historicoAgendamentos.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" />
              <h2 className="text-xl font-bold text-gray-700">Histórico de Agendamentos</h2>
            </div>
          </div>
          <div className="divide-y">
            {historicoAgendamentos.slice(0, 5).map((agendamento) => (
              <div key={agendamento.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-medium text-gray-800">{agendamento.procedimento}</p>
                    <p className="text-sm text-gray-500">
                      {formatarData(agendamento.dtAgenda)} às {agendamento.hrAgendamento.substring(0, 5)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                    {agendamento.status === 'FINALIZADO' ? 'Realizado' : agendamento.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dicas */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800">Dicas importantes</h3>
            <ul className="mt-2 space-y-1 text-sm text-amber-700">
              <li>• Chegue com 10 minutos de antecedência</li>
              <li>• Traga documentos e exames anteriores</li>
              <li>• Em caso de imprevistos, cancele com até 24h de antecedência</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}