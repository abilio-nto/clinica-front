"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  Clock as ClockIcon,
  User,
  Syringe,
  DollarSign,
  Loader2
} from "lucide-react";
import { api } from "@/services/api";

interface ItAgendamento {
  id: number;
  hrAgendamento: string;
  procedimento: string;
  valorProcedimento: number;
  status: string;
  nomeCliente: string | null;
  nomeProfissional: string | null;
}

interface Agenda {
  id: number;
  dtAgenda: string;
  totalVagas: number;
  vagasDisponiveis: number;
  vagasOcupadas: number;
  itensAgenda: ItAgendamento[];
}

export default function DetalhesAgenda() {
  const params = useParams();
  const router = useRouter();
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      carregarAgenda();
    }
  }, [params.id]);

  async function carregarAgenda() {
    try {
      setIsLoading(true);
      const response = await api.get(`/agendas/${params.id}`);
      setAgenda(response.data);
    } catch (err) {
      console.error("Erro ao carregar agenda:", err);
      setError("Erro ao carregar detalhes da agenda");
    } finally {
      setIsLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch(status) {
      case 'DISPONIVEL':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'OCUPADO':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CANCELADO':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  function getStatusIcon(status: string) {
    switch(status) {
      case 'DISPONIVEL':
        return <CheckCircle className="w-4 h-4" />;
      case 'OCUPADO':
        return <User className="w-4 h-4" />;
      case 'CANCELADO':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  }

  function formatarHorario(horario: string) {
    return horario.substring(0, 5); // Pega apenas HH:MM
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0B1F3A] mx-auto mb-4" />
          <p className="text-gray-500">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  if (error || !agenda) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-700 mb-4">{error || "Agenda não encontrada"}</p>
          <button
            onClick={() => router.push("/dashboard/agenda")}
            className="bg-[#0B1F3A] text-white px-4 py-2 rounded-lg hover:bg-[#1C4468] transition"
          >
            Voltar para Agenda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#0B1F3A] transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0B1F3A]">
                  {new Date(agenda.dtAgenda).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h1>
                <p className="text-gray-500 mt-1">Detalhes dos horários de atendimento</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-gray-50 rounded-lg px-4 py-2 text-center">
                <p className="text-xs text-gray-500">Total de Vagas</p>
                <p className="text-xl font-bold text-[#0B1F3A]">{agenda.totalVagas}</p>
              </div>
              <div className="bg-green-50 rounded-lg px-4 py-2 text-center">
                <p className="text-xs text-green-600">Disponíveis</p>
                <p className="text-xl font-bold text-green-700">{agenda.vagasDisponiveis}</p>
              </div>
              <div className="bg-blue-50 rounded-lg px-4 py-2 text-center">
                <p className="text-xs text-blue-600">Ocupadas</p>
                <p className="text-xl font-bold text-blue-700">{agenda.vagasOcupadas}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Horários */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            Horários de Atendimento
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {agenda.itensAgenda.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              onClick={() => {
                if (item.status === 'OCUPADO') {
                  // Se quiser abrir detalhes do agendamento
                  console.log("Abrir detalhes do agendamento:", item.id);
                }
              }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Horário */}
                <div className="flex items-center gap-4 min-w-[120px]">
                  <div className="text-2xl font-bold text-[#0B1F3A]">
                    {formatarHorario(item.hrAgendamento)}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                    {item.status === 'DISPONIVEL' && 'Disponível'}
                    {item.status === 'OCUPADO' && 'Ocupado'}
                    {item.status === 'CANCELADO' && 'Cancelado'}
                  </div>
                </div>

                {/* Informações do Agendamento */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {item.status === 'OCUPADO' ? (
                    <>
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{item.nomeCliente || 'Cliente não informado'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Syringe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{item.procedimento}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-green-600">
                          R$ {item.valorProcedimento.toFixed(2)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-3 text-gray-400 text-sm">
                      {item.status === 'DISPONIVEL' ? 'Horário disponível para agendamento' : 'Horário cancelado'}
                    </div>
                  )}
                </div>

                {/* Botão de Ação */}
                {item.status === 'DISPONIVEL' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/agendamento/novo?agendaId=${agenda.id}&horarioId=${item.id}`);
                    }}
                    className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    Agendar
                  </button>
                )}

                {item.status === 'OCUPADO' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/agendamento/${item.id}`);
                    }}
                    className="border border-[#0B1F3A] text-[#0B1F3A] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0B1F3A] hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    Ver Detalhes
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer com ações */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Mostrando {agenda.itensAgenda.length} de {agenda.totalVagas} horários
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard/agenda/gerar")}
              className="text-sm text-[#0B1F3A] hover:text-[#1C4468] font-medium"
            >
              + Gerar nova agenda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}