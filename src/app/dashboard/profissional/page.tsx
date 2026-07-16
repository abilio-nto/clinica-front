"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, Clock, User, Phone, Mail, 
  CheckCircle, Play, Eye, X, FileText,
  Stethoscope, Activity, Star, AlertCircle,
  Loader2, ChevronRight, Users, ListChecks
} from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface AgendamentoProfissional {
  id: number;
  hrAgendamento: string;
  procedimento: string;
  status: string;
  clienteId: number;
  nomeCliente: string;
  telefoneCliente: string;
  emailCliente: string;
  observacoes?: string;
  alergias?: string;
  historicoProcedimentos?: string[];
}

interface EstatisticaProfissional {
  totalAtendimentosHoje: number;
  totalAtendimentosSemana: number;
  totalAtendimentosMes: number;
  mediaAtendimentosDia: number;
  satisfacaoMedia: number;
  agendamentosPrevistos: number;
}

export default function ProfissionalDashboard() {
  const { user } = useAuth();
  const [agendamentosHoje, setAgendamentosHoje] = useState<AgendamentoProfissional[]>([]);
  const [agendamentosSemana, setAgendamentosSemana] = useState<AgendamentoProfissional[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticaProfissional>({
    totalAtendimentosHoje: 0,
    totalAtendimentosSemana: 0,
    totalAtendimentosMes: 0,
    mediaAtendimentosDia: 0,
    satisfacaoMedia: 0,
    agendamentosPrevistos: 0,
  });
  const [selectedAtendimento, setSelectedAtendimento] = useState<AgendamentoProfissional | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfissionalData();
  }, []);

  async function fetchProfissionalData() {
    try {
      const response = await api.get(`/profissional/dashboard/${user?.id}`);
      setAgendamentosHoje(response.data.agendamentosHoje);
      setAgendamentosSemana(response.data.agendamentosSemana);
      setEstatisticas(response.data.estatisticas);
    } catch (error) {
      console.error("Erro ao carregar dados do profissional:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleIniciarAtendimento = async (atendimento: AgendamentoProfissional) => {
    setSelectedAtendimento(atendimento);
    setObservacoes(atendimento.observacoes || "");
    setIsModalOpen(true);
  };

  const handleConfirmarInicio = async () => {
    try {
      await api.put(`/atendimento/iniciar-atendimento/${selectedAtendimento?.id}`, {
        observacoes: observacoes
      });
      await fetchProfissionalData();
      setIsModalOpen(false);
      setSelectedAtendimento(null);
    } catch (error) {
      console.error("Erro ao iniciar atendimento:", error);
      alert("Erro ao iniciar atendimento");
    }
  };

  const handleFinalizarAtendimento = async () => {
    try {
      await api.put(`/atendimento/finalizar-atendimento/${selectedAtendimento?.id}`, {
        observacoes: observacoes,
        dataHoraFim: new Date().toISOString()
      });
      await fetchProfissionalData();
      setIsModalOpen(false);
      setSelectedAtendimento(null);
    } catch (error) {
      console.error("Erro ao finalizar atendimento:", error);
      alert("Erro ao finalizar atendimento");
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'AGENDADO': return 'bg-blue-100 text-blue-700';
      case 'EM_ANDAMENTO': return 'bg-yellow-100 text-yellow-700';
      case 'FINALIZADO': return 'bg-green-100 text-green-700';
      case 'CANCELADO': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'AGENDADO': return 'Aguardando';
      case 'EM_ANDAMENTO': return 'Em Atendimento';
      case 'FINALIZADO': return 'Finalizado';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  };

  // Estatísticas rápidas
  const quickStats = [
    { title: "Hoje", value: estatisticas.totalAtendimentosHoje, icon: Calendar, color: "from-blue-500 to-blue-600" },
    { title: "Esta Semana", value: estatisticas.totalAtendimentosSemana, icon: Clock, color: "from-emerald-500 to-emerald-600" },
    { title: "Este Mês", value: estatisticas.totalAtendimentosMes, icon: Calendar, color: "from-purple-500 to-purple-600" },
    { title: "Média/Dia", value: estatisticas.mediaAtendimentosDia, icon: Activity, color: "from-amber-500 to-amber-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-xl">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] bg-clip-text text-transparent">
              Meus Atendimentos
            </h1>
            <p className="text-gray-500 mt-1">Gerencie seus pacientes e procedimentos</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            style={{ animationDelay: `${index * 75}ms` }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">{stat.title}</p>
                <p className="text-2xl font-bold text-[#0B1F3A]">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color} opacity-75`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Satisfação e Próximos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-200" />
            <div>
              <p className="text-white/80 text-sm">Satisfação dos Pacientes</p>
              <p className="text-3xl font-bold">{estatisticas.satisfacaoMedia}%</p>
              <p className="text-white/70 text-xs mt-1">Baseado nos últimos 30 dias</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3">
            <ListChecks className="w-8 h-8 text-white/70" />
            <div>
              <p className="text-white/80 text-sm">Próximos Agendamentos</p>
              <p className="text-3xl font-bold">{estatisticas.agendamentosPrevistos}</p>
              <p className="text-white/70 text-xs mt-1">Nos próximos 7 dias</p>
            </div>
          </div>
        </div>
      </div>

      {/* Atendimentos de Hoje */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0B1F3A]" />
              <h2 className="text-xl font-bold text-[#0B1F3A]">Atendimentos de Hoje</h2>
            </div>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0B1F3A] mx-auto" />
          </div>
        ) : agendamentosHoje.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum atendimento agendado para hoje</p>
            <p className="text-sm">Aproveite para atualizar prontuários ou estudar casos</p>
          </div>
        ) : (
          <div className="divide-y">
            {agendamentosHoje.map((agendamento) => (
              <div key={agendamento.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 text-center">
                      <p className="text-xl font-bold text-[#1C4468]">{agendamento.hrAgendamento.substring(0, 5)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{agendamento.nomeCliente}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {agendamento.telefoneCliente}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {agendamento.emailCliente}
                        </span>
                      </div>
                      <p className="text-sm text-[#1C4468] mt-1">{agendamento.procedimento}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                      {getStatusText(agendamento.status)}
                    </span>
                    {agendamento.status === 'AGENDADO' && (
                      <button
                        onClick={() => handleIniciarAtendimento(agendamento)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition flex items-center gap-1"
                      >
                        <Play className="w-4 h-4" /> Iniciar
                      </button>
                    )}
                    {agendamento.status === 'EM_ANDAMENTO' && (
                      <button
                        onClick={() => handleIniciarAtendimento(agendamento)}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> Finalizar
                      </button>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Próximos Atendimentos da Semana */}
      {agendamentosSemana.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0B1F3A]" />
                <h2 className="text-xl font-bold text-[#0B1F3A]">Próximos Atendimentos</h2>
              </div>
              <button className="text-sm text-[#1C4468] hover:text-[#0B1F3A] flex items-center gap-1">
                Ver agenda completa <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="divide-y">
            {agendamentosSemana.slice(0, 5).map((agendamento) => (
              <div key={agendamento.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24">
                      <p className="text-sm font-semibold text-[#1C4468]">
                        {new Date(agendamento.hrAgendamento).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })}
                      </p>
                      <p className="text-xs text-gray-500">{agendamento.hrAgendamento.substring(0, 5)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{agendamento.nomeCliente}</p>
                      <p className="text-sm text-gray-500">{agendamento.procedimento}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                    {getStatusText(agendamento.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Atendimento */}
      {isModalOpen && selectedAtendimento && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-[#0B1F3A]">
                  {selectedAtendimento.status === 'EM_ANDAMENTO' ? 'Finalizar' : 'Iniciar'} Atendimento
                </h2>
                <p className="text-gray-500 text-sm mt-1">{selectedAtendimento.nomeCliente}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações do Paciente */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-4 h-4" /> Informações do Paciente
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Nome</p>
                    <p className="font-medium">{selectedAtendimento.nomeCliente}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Telefone</p>
                    <p className="font-medium">{selectedAtendimento.telefoneCliente}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">E-mail</p>
                    <p className="font-medium">{selectedAtendimento.emailCliente}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Procedimento</p>
                    <p className="font-medium">{selectedAtendimento.procedimento}</p>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações do Atendimento
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Registre observações sobre o atendimento, evolução do paciente, próximos passos..."
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                  rows={5}
                />
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={selectedAtendimento.status === 'EM_ANDAMENTO' ? handleFinalizarAtendimento : handleConfirmarInicio}
                  className="flex-1 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white py-3 rounded-lg font-semibold hover:shadow-lg"
                >
                  {selectedAtendimento.status === 'EM_ANDAMENTO' ? 'Finalizar' : 'Iniciar'} Atendimento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}