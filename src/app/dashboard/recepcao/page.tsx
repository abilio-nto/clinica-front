"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, Clock, User, Phone, Mail, MapPin, CheckCircle, 
  XCircle, AlertCircle, Loader2, Eye, Plus, Search, 
  Play, Trash2, MessageSquare, FileText, DollarSign,
  X, ChevronRight, ChevronLeft, Filter, Printer
} from "lucide-react";
import { api } from "@/services/api";
import { DialogCompoenent } from "@/components/ui/DialogCompoenent";

interface Agendamento {
  id: number;
  hrAgendamento: string;
  procedimento: string;
  status: string;
  nomeCliente: string;
  telefoneCliente: string;
  emailCliente: string;
  observacoes?: string;
  valor?: number;
  profissional?: string;
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
  descricao: string;
}

interface Profissional {
  id: number;
  nome: string;
  especialidade: string;
}

export default function RecepcaoDashboard() {
  const [agendamentosHoje, setAgendamentosHoje] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para modais
  const [showNovoAgendamentoModal, setShowNovoAgendamentoModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  
  // Estados para formulário de novo agendamento
  const [step, setStep] = useState(1);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedProcedimento, setSelectedProcedimento] = useState<Procedimento | null>(null);
  const [selectedProfissional, setSelectedProfissional] = useState<Profissional | null>(null);
  const [selectedData, setSelectedData] = useState("");
  const [selectedHorario, setSelectedHorario] = useState("");
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [searchCliente, setSearchCliente] = useState("");
  const [novoCliente, setNovoCliente] = useState<Partial<Cliente>>({});
  const [showCadastroCliente, setShowCadastroCliente] = useState(false);
  
  // Estados para dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogType, setDialogType] = useState<"error" | "warning" | "success" | "info">("success");
  const [onDialogConfirm, setOnDialogConfirm] = useState<(() => void) | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    fetchAgendamentosHoje();
    fetchClientes();
    fetchProcedimentos();
    fetchProfissionais();
  }, []);

  // Buscar agendamentos do dia
  async function fetchAgendamentosHoje() {
    setIsLoading(true);
    try {
      const response = await api.get("/agendas/AgendaHoje");
      setAgendamentosHoje(response.data.itensAgenda || []);
      console.log(response)
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      showDialog("Erro ao carregar agendamentos", "error", "Erro");
    } finally {
      setIsLoading(false);
    }
  }

  // Buscar clientes
  async function fetchClientes() {
    try {
      const response = await api.get("/clientes");
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  }

  // Buscar procedimentos
  async function fetchProcedimentos() {
    try {
      const response = await api.get("/procedimentos");
      setProcedimentos(response.data);
      console.log(response)
    } catch (error) {
      console.error("Erro ao carregar procedimentos:", error);
    }
  }

  // Buscar profissionais
  async function fetchProfissionais() {
    try {
      const response = await api.get("/profissionais");
      setProfissionais(response.data);
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
    }
  }

  // Buscar horários disponíveis
  async function buscarHorariosDisponiveis() {
    if (!selectedData || !selectedProfissional) return;
    
    try {
      const response = await api.get(`/agendas/horarios-disponiveis?data=${selectedData}&profissionalId=${selectedProfissional.id}`);
      setHorariosDisponiveis(response.data);
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      setHorariosDisponiveis([]);
    }
  }

  useEffect(() => {
    if (selectedData && selectedProfissional) {
      buscarHorariosDisponiveis();
    }
  }, [selectedData, selectedProfissional]);

  // Funções dos Modais
  const showDialog = (message: string, type: "error" | "warning" | "success" | "info" = "success", title?: string, onConfirm?: () => void) => {
    setDialogMessage(message);
    setDialogType(type);
    setDialogTitle(title || "");
    setOnDialogConfirm(() => onConfirm);
    setDialogOpen(true);
  };

  // Iniciar atendimento
  const handleIniciarAtendimento = async (agendamento: Agendamento) => {
    showDialog(
      `Deseja iniciar o atendimento de ${agendamento.nomeCliente}?`,
      "warning",
      "Iniciar Atendimento",
      async () => {
        try {
          // TODO: Configurar endpoint
          await api.put(`/atendimentos/${agendamento.id}/iniciar`);
          await fetchAgendamentosHoje();
          showDialog("Atendimento iniciado com sucesso!", "success", "Sucesso");
        } catch (error) {
          showDialog("Erro ao iniciar atendimento", "error", "Erro");
        }
      }
    );
  };

  // Cancelar agendamento
  const handleCancelarAgendamento = async () => {
    if (!selectedAgendamento) return;
    
    try {
      // TODO: Configurar endpoint
      await api.put(`/agendamentos/${selectedAgendamento.id}/cancelar`);
      await fetchAgendamentosHoje();
      setShowCancelarModal(false);
      showDialog("Agendamento cancelado com sucesso!", "success", "Sucesso");
    } catch (error) {
      showDialog("Erro ao cancelar agendamento", "error", "Erro");
    }
  };

  // Finalizar atendimento
  const handleFinalizarAtendimento = async (agendamento: Agendamento) => {
    showDialog(
      `Deseja finalizar o atendimento de ${agendamento.nomeCliente}?`,
      "warning",
      "Finalizar Atendimento",
      async () => {
        try {
          // TODO: Configurar endpoint
          await api.put(`/atendimentos/${agendamento.id}/finalizar`);
          await fetchAgendamentosHoje();
          showDialog("Atendimento finalizado com sucesso!", "success", "Sucesso");
        } catch (error) {
          showDialog("Erro ao finalizar atendimento", "error", "Erro");
        }
      }
    );
  };

  // Salvar novo agendamento
  const handleSalvarAgendamento = async () => {
    if (!selectedCliente || !selectedProcedimento || !selectedProfissional || !selectedData || !selectedHorario) {
      showDialog("Preencha todos os campos obrigatórios", "warning", "Campos incompletos");
      return;
    }

    try {
      // TODO: Configurar endpoint
      await api.post("/agendamentos", {
        clienteId: selectedCliente.id,
        procedimentoId: selectedProcedimento.id,
        profissionalId: selectedProfissional.id,
        data: selectedData,
        horario: selectedHorario,
        observacoes: ""
      });
      
      setShowNovoAgendamentoModal(false);
      resetForm();
      await fetchAgendamentosHoje();
      showDialog("Agendamento realizado com sucesso!", "success", "Sucesso");
    } catch (error) {
      showDialog("Erro ao realizar agendamento", "error", "Erro");
    }
  };

  // Cadastrar novo cliente
  const handleCadastrarCliente = async () => {
    if (!novoCliente.nome || !novoCliente.email || !novoCliente.telefone) {
      showDialog("Preencha os campos obrigatórios", "warning", "Campos incompletos");
      return;
    }

    try {
      // TODO: Configurar endpoint
      const response = await api.post("/clientes", novoCliente);
      setClientes([...clientes, response.data]);
      setSelectedCliente(response.data);
      setShowCadastroCliente(false);
      setNovoCliente({});
      showDialog("Cliente cadastrado com sucesso!", "success", "Sucesso");
    } catch (error) {
      showDialog("Erro ao cadastrar cliente", "error", "Erro");
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCliente(null);
    setSelectedProcedimento(null);
    setSelectedProfissional(null);
    setSelectedData("");
    setSelectedHorario("");
    setSearchCliente("");
    setNovoCliente({});
    setShowCadastroCliente(false);
  };

  const clientesFiltrados = clientes.filter(c => []
    // c.nome.toLowerCase().includes(searchCliente.toLowerCase()) ||
    // c.cpf.includes(searchCliente)
  );

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
      case 'AGENDADO': return 'Agendado';
      case 'EM_ANDAMENTO': return 'Em Andamento';
      case 'FINALIZADO': return 'Finalizado';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  };

  const filteredAgendamentos = agendamentosHoje.filter(apt => []
    // apt?.nomeCliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // apt?.procedimento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-xl">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] bg-clip-text text-transparent">
              Recepção
            </h1>
            <p className="text-gray-500 mt-1">Gerencie os atendimentos do dia</p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Hoje</p>
              <p className="text-2xl font-bold text-[#0B1F3A]">{agendamentosHoje.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-[#0B1F3A] opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Em Andamento</p>
              <p className="text-2xl font-bold text-yellow-600">
                {agendamentosHoje.filter(a => a.status === 'EM_ANDAMENTO').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Finalizados</p>
              <p className="text-2xl font-bold text-green-600">
                {agendamentosHoje.filter(a => a.status === 'FINALIZADO').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por cliente ou procedimento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
        />
      </div>

      {/* Lista de Agendamentos */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Horário</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Cliente</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Procedimento</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Contato</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0B1F3A] mx-auto" />
                  </td>
                </tr>
              ) : filteredAgendamentos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    Nenhum agendamento encontrado
                  </td>
                </tr>
              ) : (
                filteredAgendamentos.map((apt) => (
                  <tr key={apt.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 font-semibold text-[#1C4468]">{apt.hrAgendamento.substring(0, 5)}</td>
                    <td className="p-4">
                      <p className="font-medium text-gray-800">{apt.nomeCliente || 'Horário livre'}</p>
                    </td>
                    <td className="p-4 text-gray-600">{apt.procedimento || '—'}</td>
                    <td className="p-4">
                      {apt.telefoneCliente && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Phone className="w-3 h-3" />
                          <span>{apt.telefoneCliente}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {getStatusText(apt.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedAgendamento(apt);
                            setShowDetalhesModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        
                        {apt.status === 'AGENDADO' && (
                          <button 
                            onClick={() => handleIniciarAtendimento(apt)}
                            className="p-2 hover:bg-green-100 rounded-lg transition"
                            title="Iniciar atendimento"
                          >
                            <Play className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        
                        {apt.status === 'EM_ANDAMENTO' && (
                          <button 
                            onClick={() => handleFinalizarAtendimento(apt)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition"
                            title="Finalizar atendimento"
                          >
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                        
                        {apt.status === 'AGENDADO' && (
                          <button 
                            onClick={() => {
                              setSelectedAgendamento(apt);
                              setShowCancelarModal(true);
                            }}
                            className="p-2 hover:bg-red-100 rounded-lg transition"
                            title="Cancelar agendamento"
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botão Novo Agendamento */}
      <div className="fixed bottom-6 right-6">
        <button 
          onClick={() => setShowNovoAgendamentoModal(true)}
          className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* ==================== MODAL NOVO AGENDAMENTO ==================== */}
      {showNovoAgendamentoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-[#0B1F3A]">Novo Agendamento</h2>
                <p className="text-gray-500 text-sm mt-1">Preencha os dados para agendar um horário</p>
              </div>
              <button 
                onClick={() => {
                  setShowNovoAgendamentoModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Steps */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                {[
                  { step: 1, label: "Cliente" },
                  { step: 2, label: "Procedimento" },
                  { step: 3, label: "Profissional" },
                  { step: 4, label: "Data/Horário" }
                ].map((s) => (
                  <div key={s.step} className="flex-1 text-center">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center transition-all
                      ${step >= s.step ? 'bg-[#0B1F3A] text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {s.step}
                    </div>
                    <p className={`text-sm mt-2 ${step >= s.step ? 'text-[#0B1F3A] font-medium' : 'text-gray-400'}`}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Step 1: Cliente */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Selecione o cliente</h3>
                    <button 
                      onClick={() => setShowCadastroCliente(true)}
                      className="text-[#1C4468] hover:text-[#0B1F3A] text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Novo cliente
                    </button>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nome ou CPF..."
                      value={searchCliente}
                      onChange={(e) => setSearchCliente(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                    />
                  </div>
                  
                  <div className="border rounded-xl divide-y max-h-96 overflow-y-auto">
                    {clientesFiltrados.map((cliente) => (
                      <button
                        key={cliente.id}
                        onClick={() => {
                          setSelectedCliente(cliente);
                          setStep(2);
                        }}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition flex items-center justify-between ${
                          selectedCliente?.id === cliente.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div>
                          <p className="font-medium text-gray-800">{cliente.nome}</p>
                          <p className="text-sm text-gray-500">{cliente.cpf} • {cliente.telefone}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                  
                  {selectedCliente && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700">Cliente selecionado</p>
                        <p className="font-medium text-green-800">{selectedCliente.nome}</p>
                      </div>
                      <button 
                        onClick={() => setStep(2)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Continuar →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Procedimento */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Selecione o procedimento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {procedimentos.map((proc) => (
                      <button
                        key={proc.id}
                        onClick={() => setSelectedProcedimento(proc)}
                        className={`p-4 border rounded-xl text-left transition ${
                          selectedProcedimento?.id === proc.id 
                            ? 'border-[#0B1F3A] bg-blue-50' 
                            : 'hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-800">{proc.nome}</p>
                        <p className="text-sm text-gray-500 mt-1">⏱ {proc.duracao}min</p>
                        <p className="text-lg font-bold text-[#1C4468] mt-2">
                          R$ {proc.valor.toFixed(2)}
                        </p>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg"
                    >
                      Voltar
                    </button>
                    <button 
                      onClick={() => selectedProcedimento && setStep(3)}
                      disabled={!selectedProcedimento}
                      className="flex-1 bg-[#0B1F3A] text-white py-2 rounded-lg disabled:opacity-50"
                    >
                      Continuar →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Profissional */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Selecione o profissional</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profissionais.map((prof) => (
                      <button
                        key={prof.id}
                        onClick={() => setSelectedProfissional(prof)}
                        className={`p-4 border rounded-xl text-left transition ${
                          selectedProfissional?.id === prof.id 
                            ? 'border-[#0B1F3A] bg-blue-50' 
                            : 'hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-800">{prof.nome}</p>
                        <p className="text-sm text-gray-500">{prof.especialidade}</p>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setStep(2)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg"
                    >
                      Voltar
                    </button>
                    <button 
                      onClick={() => selectedProfissional && setStep(4)}
                      disabled={!selectedProfissional}
                      className="flex-1 bg-[#0B1F3A] text-white py-2 rounded-lg disabled:opacity-50"
                    >
                      Continuar →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Data e Horário */}
              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Escolha data e horário</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                    <input
                      type="date"
                      value={selectedData}
                      onChange={(e) => setSelectedData(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                    />
                  </div>
                  
                  {selectedData && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                      <div className="grid grid-cols-4 gap-3">
                        {horariosDisponiveis.map((horario) => (
                          <button
                            key={horario}
                            onClick={() => setSelectedHorario(horario)}
                            className={`p-3 border rounded-lg text-center transition ${
                              selectedHorario === horario 
                                ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]' 
                                : 'hover:border-[#0B1F3A]'
                            }`}
                          >
                            {horario}
                          </button>
                        ))}
                      </div>
                      {horariosDisponiveis.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                          Nenhum horário disponível para esta data
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setStep(3)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg"
                    >
                      Voltar
                    </button>
                    <button 
                      onClick={handleSalvarAgendamento}
                      disabled={!selectedHorario}
                      className="flex-1 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white py-2 rounded-lg disabled:opacity-50"
                    >
                      Confirmar Agendamento
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL CADASTRO CLIENTE ==================== */}
      {showCadastroCliente && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-[#0B1F3A]">Novo Cliente</h2>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Nome completo *"
                value={novoCliente.nome || ""}
                onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
              <input
                type="email"
                placeholder="E-mail *"
                value={novoCliente.email || ""}
                onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
              <input
                type="tel"
                placeholder="Telefone *"
                value={novoCliente.telefone || ""}
                onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
              <input
                type="text"
                placeholder="CPF"
                value={novoCliente.cpf || ""}
                onChange={(e) => setNovoCliente({...novoCliente, cpf: e.target.value})}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
              <input
                type="date"
                placeholder="Data de Nascimento"
                value={novoCliente.dataNascimento || ""}
                onChange={(e) => setNovoCliente({...novoCliente, dataNascimento: e.target.value})}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
              <textarea
                placeholder="Endereço"
                value={novoCliente.endereco || ""}
                onChange={(e) => setNovoCliente({...novoCliente, endereco: e.target.value})}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                rows={2}
              />
            </div>
            <div className="p-6 border-t flex gap-3">
              <button 
                onClick={() => setShowCadastroCliente(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCadastrarCliente}
                className="flex-1 bg-[#0B1F3A] text-white py-2 rounded-lg"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DETALHES ==================== */}
      {showDetalhesModal && selectedAgendamento && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#0B1F3A]">Detalhes do Agendamento</h2>
              <button 
                onClick={() => setShowDetalhesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Clock className="w-5 h-5 text-[#0B1F3A]" />
                <div>
                  <p className="text-sm text-gray-500">Horário</p>
                  <p className="font-semibold">{selectedAgendamento.hrAgendamento.substring(0, 5)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-[#0B1F3A]" />
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-semibold">{selectedAgendamento.nomeCliente}</p>
                  <p className="text-sm text-gray-500">{selectedAgendamento.telefoneCliente}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <FileText className="w-5 h-5 text-[#0B1F3A]" />
                <div>
                  <p className="text-sm text-gray-500">Procedimento</p>
                  <p className="font-semibold">{selectedAgendamento.procedimento}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAgendamento.status)}`}>
                  {getStatusText(selectedAgendamento.status)}
                </span>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button 
                onClick={() => setShowDetalhesModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg"
              >
                Fechar
              </button>
              {selectedAgendamento.status === 'AGENDADO' && (
                <button 
                  onClick={() => {
                    setShowDetalhesModal(false);
                    handleIniciarAtendimento(selectedAgendamento);
                  }}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                >
                  Iniciar Atendimento
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL CANCELAR ==================== */}
      {showCancelarModal && selectedAgendamento && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Cancelar Agendamento</h2>
              <p className="text-gray-500 mb-4">
                Tem certeza que deseja cancelar o agendamento de <strong>{selectedAgendamento.nomeCliente}</strong>?
              </p>
              <p className="text-sm text-gray-400 mb-6">Esta ação não poderá ser desfeita.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCancelarModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg"
                >
                  Voltar
                </button>
                <button 
                  onClick={handleCancelarAgendamento}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Component */}
      <DialogCompoenent
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        message={dialogMessage}
        title={dialogTitle}
        type={dialogType}
        onConfirm={onDialogConfirm || undefined}
        showCancel={dialogType === "warning"}
      />
    </div>
  );
}