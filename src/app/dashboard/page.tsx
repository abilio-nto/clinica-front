"use client";

import { useState, useEffect } from "react";
import { Calendar, Users, DollarSign, TrendingUp, Clock, Star, Eye, X, Play, CheckCircle, User, Phone, FileText, AlertCircle ,Mail} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

export default function Dashboard() {

  type ItAgendamento = {
    id: number;
    hrAgendamento: string;
    procedimento: string;
    valorProcedimento: number;
    status: string;
    nomeCliente?: string;
    nomeProfissional?: string;
    emailCliente?: string;
    telefoneCliente?: string;
  };

  type AgendaResponse = {
    id: number;
    dtAgenda: string;
    totalVagas: number;
    atendidos: number;
    vagasDisponiveis: number;
    vagasOcupadas: number;
    itensAgenda: ItAgendamento[];
  };

  const [agendaData, setAgendaData] = useState<AgendaResponse | null>(null);
  const [nextAppointments, setNextAppointments] = useState<ItAgendamento[]>([]);
  
  // Novos estados para o modal
  const [selectedAtendimento, setSelectedAtendimento] = useState<ItAgendamento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<"iniciar" | "finalizar" | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (agendaData?.itensAgenda) {
      getNextAppointments();
    }
  }, [agendaData]);

  async function fetchDashboardData() {
    try {
      const response = await api.get("/agendas/AgendaHoje");
      setAgendaData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    }
  }

  function getNextAppointments() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Função para converter horário string (ex: "14:30") para minutos
    const convertTimeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Filtrar apenas os horários futuros
    const futureAppointments = agendaData!.itensAgenda.filter(appointment => {
      const appointmentTimeInMinutes = convertTimeToMinutes(appointment.hrAgendamento);
      return appointmentTimeInMinutes > currentTimeInMinutes;
    });

    // Ordenar por horário
    const sortedAppointments = [...futureAppointments].sort((a, b) => {
      return convertTimeToMinutes(a.hrAgendamento) - convertTimeToMinutes(b.hrAgendamento);
    });

    // Pegar os próximos 4 atendimentos
    const nextFour = sortedAppointments.slice(0, 4);
    setNextAppointments(nextFour);
  }

  // Novas funções para o modal
  const handleOpenAtendimento = (atendimento: ItAgendamento) => {
    setSelectedAtendimento(atendimento);
    setObservacoes("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAtendimento(null);
    setObservacoes("");
  };

  const handleStatusChange = async () => {
    await fetchDashboardData();
  };

  const handleIniciarAtendimento = async () => {
    setIsLoading(true);
    try {
      await api.put(`/agendas/iniciar-atendimento/${selectedAtendimento?.id}`, {
        observacoes: observacoes
      });
      await handleStatusChange();
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao iniciar atendimento:", error);
      alert("Erro ao iniciar atendimento. Tente novamente.");
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleFinalizarAtendimento = async () => {
    setIsLoading(true);
    try {
      await api.put(`/agendas/finalizar-atendimento/${selectedAtendimento?.id}`, {
        observacoes: observacoes,
        dataHoraFim: new Date().toISOString()
      });
      await handleStatusChange();
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao finalizar atendimento:", error);
      alert("Erro ao finalizar atendimento. Tente novamente.");
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGENDADO':
        return 'bg-blue-100 text-blue-700';
      case 'EM_ANDAMENTO':
        return 'bg-yellow-100 text-yellow-700';
      case 'FINALIZADO':
        return 'bg-green-100 text-green-700';
      case 'CANCELADO':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AGENDADO':
        return 'Agendado';
      case 'EM_ANDAMENTO':
        return 'Em Andamento';
      case 'FINALIZADO':
        return 'Finalizado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const stats = [
    {
      title: "Atendimentos Hoje",
      value: agendaData?.atendidos || 0,
      icon: Calendar,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Clientes Ativos",
      value: "85",
      icon: Users,
      color: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Faturamento Mensal",
      value: "R$ 12.000",
      icon: DollarSign,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Taxa Ocupação",
      value: "78%",
      icon: TrendingUp,
      color: "from-amber-500 to-amber-600"
    },
  ];

  const { user } = useAuth();
  console.log(user);

  // Função auxiliar para verificar se é o próximo horário
  const isNextAppointment = (index: number) => {
    return index === 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Bem-vinda de volta! Aqui está o resumo do dia.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border transition-all duration-300 overflow-hidden"
          >
            <div className="p-6 border items-center justify-center flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-gray-500 text-md font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-[#0B1F3A] mt-1">{stat.value}</p>
            </div>
            <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
          </div>
        ))}
      </div>

      {/* Recent Activity & Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Próximos Atendimentos */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#0B1F3A]">Próximos Atendimentos</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Agora: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          
          {nextAppointments.length > 0 ? (
            <div className="space-y-4">
              {nextAppointments.map((apt, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3 rounded-xl transition cursor-pointer ${
                    isNextAppointment(idx) 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#1C4468]' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleOpenAtendimento(apt)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 text-sm font-semibold text-[#1C4468]">
                      {apt.hrAgendamento}
                      {isNextAppointment(idx) && (
                        <span className="ml-1 text-xs text-green-600">◀</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {apt.nomeCliente != null ? apt.nomeCliente : 'Horário livre'}
                        {isNextAppointment(idx) && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Próximo
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {apt.procedimento !== null ? apt.procedimento : 'Procedimento não especificado'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === 'AGENDADO' ? 'bg-green-100 text-green-700' :
                        apt.status === 'CANCELADO' ? 'bg-red-100 text-red-700' :
                        apt.status === 'DISPONIVEL' ? 'bg-yellow-100 text-yellow-700' :
                        apt.status === 'EM_ANDAMENTO' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {apt.status === 'DISPONIVEL' ? 'DISPONÍVEL' : 
                         apt.status === 'EM_ANDAMENTO' ? 'EM ANDAMENTO' : apt.status}
                      </span>
                      <Eye className="w-4 h-4 text-gray-400 hover:text-[#0B1F3A] transition" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum atendimento próximo encontrado</p>
              <p className="text-sm">Os próximos atendimentos aparecerão aqui</p>
            </div>
          )}
          
          {nextAppointments.length > 0 && nextAppointments.length < 4 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Mostrando {nextAppointments.length} de {agendaData?.itensAgenda.length || 0} atendimentos restantes
            </div>
          )}
        </div>

        {/* Indicadores Rápidos */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#0B1F3A] mb-6">Indicadores Rápidos</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Satisfação dos Clientes</span>
                <span className="text-sm font-semibold text-[#1C4468]">98%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] h-2 rounded-full w-[98%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Retenção de Clientes</span>
                <span className="text-sm font-semibold text-[#1C4468]">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] h-2 rounded-full w-[85%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Meta Mensal</span>
                <span className="text-sm font-semibold text-[#1C4468]">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] h-2 rounded-full w-[67%]" />
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] rounded-xl text-white">
            <div className="flex items-center gap-3">
              <Star className="w-10 h-10 text-yellow-300" />
              <div>
                <p className="text-sm opacity-90">Próximo marco</p>
                <p className="font-bold">Faltam 15 atendimentos para bater a meta do mês!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Atendimento */}
      {isModalOpen && selectedAtendimento && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-[#0B1F3A]">Detalhes do Atendimento</h2>
                <p className="text-gray-500 text-sm mt-1">Gerencie o andamento do atendimento</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAtendimento.status)}`}>
                  {getStatusText(selectedAtendimento.status)}
                </span>
                <span className="text-sm text-gray-500">
                  ID: #{selectedAtendimento.id}
                </span>
              </div>

              {/* Horário */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#0B1F3A]" />
                  <div>
                    <p className="text-sm text-gray-500">Horário</p>
                    <p className="font-semibold text-[#0B1F3A]">{selectedAtendimento.hrAgendamento}</p>
                  </div>
                </div>
              </div>

              {/* Cliente */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 text-[#0B1F3A]" />
                  <p className="font-semibold text-[#0B1F3A]">Cliente</p>
                </div>
                <div className="ml-8 space-y-2">
                  <p className="text-gray-800 font-medium">{selectedAtendimento.nomeCliente || 'Não informado'}</p>
                  {selectedAtendimento.telefoneCliente && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{selectedAtendimento.telefoneCliente}</span>
                    </div>
                  )}
                  {selectedAtendimento.emailCliente && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{selectedAtendimento.emailCliente}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Procedimento */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-[#0B1F3A]" />
                  <p className="font-semibold text-[#0B1F3A]">Procedimento</p>
                </div>
                <div className="ml-8">
                  <p className="text-gray-800">{selectedAtendimento.procedimento || 'Não especificado'}</p>
                  {selectedAtendimento.valorProcedimento > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>Valor: R$ {selectedAtendimento.valorProcedimento.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Observações */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-[#0B1F3A]" />
                  <p className="font-semibold text-[#0B1F3A]">Observações</p>
                </div>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Adicione observações sobre o atendimento..."
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] text-gray-800"
                  rows={4}
                />
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-4">
                {selectedAtendimento.status === 'AGENDADO' && (
                  <button
                    onClick={() => {
                      setActionType("iniciar");
                      setShowConfirmDialog(true);
                    }}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Iniciar Atendimento
                  </button>
                )}

                {selectedAtendimento.status === 'EM_ANDAMENTO' && (
                  <button
                    onClick={() => {
                      setActionType("finalizar");
                      setShowConfirmDialog(true);
                    }}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Finalizar Atendimento
                  </button>
                )}

                {(selectedAtendimento.status === 'FINALIZADO' || selectedAtendimento.status === 'CANCELADO') && (
                  <div className="flex-1 text-center py-3 bg-gray-100 rounded-lg text-gray-500">
                    Atendimento já foi {getStatusText(selectedAtendimento.status).toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-bold text-gray-800">
                {actionType === "iniciar" ? "Iniciar Atendimento" : "Finalizar Atendimento"}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {actionType === "iniciar" 
                ? "Tem certeza que deseja iniciar este atendimento?" 
                : "Tem certeza que deseja finalizar este atendimento? Esta ação não poderá ser desfeita."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={actionType === "iniciar" ? handleIniciarAtendimento : handleFinalizarAtendimento}
                disabled={isLoading}
                className="flex-1 bg-[#0B1F3A] text-white py-2 rounded-lg hover:bg-[#1C4468] transition disabled:opacity-50"
              >
                {isLoading ? "Processando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}