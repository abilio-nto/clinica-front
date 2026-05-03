"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, MapPin, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { apiPublic } from "@/services/apiPublic";
import { DialogCompoenent } from "@/components/ui/DialogCompoenent";

interface Agenda {
  id: number;
  dtAgenda: string;
  itensAgenda: ItAgendamento[];
}

interface ItAgendamento {
  id: number;
  hrAgendamento: string;
  procedimento: string;
  status: string;
}

interface ClienteData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  endereco: string;
}

export default function AgendamentoPublico() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
  const [selectedHorario, setSelectedHorario] = useState<ItAgendamento | null>(null);
  const [cpf, setCpf] = useState("");
  const [cliente, setCliente] = useState<ClienteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCadastro, setShowCadastro] = useState(false);
  const [cadastroData, setCadastroData] = useState<Partial<ClienteData>>({});
  const [success, setSuccess] = useState("");

  // Estados para o dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogType, setDialogType] = useState<"error" | "warning" | "success" | "info">("error");
  const [onDialogConfirm, setOnDialogConfirm] = useState<(() => void) | null>(null);

  // Buscar agendas disponíveis
  useEffect(() => {
    carregarAgendas();
  }, []);

  async function carregarAgendas() {
    try {
      setIsLoading(true);
      const response = await apiPublic.get("/agendas/AgendasMes");

      console.log("=== RESPOSTA COMPLETA DA API ===");
      console.log("Todas agendas recebidas:", response.data.map((a: Agenda) => ({ id: a.id, data: a.dtAgenda })));

      const agendasDisponiveis = [...response.data]
        .filter((agenda: Agenda) =>
          agenda.itensAgenda?.some(
            (item: ItAgendamento) => item.status === "DISPONIVEL"
          )
        )
        .sort((a, b) => a.id - b.id)
        .map((agenda) => ({ ...agenda }));

      console.log("=== AGENDAS COM HORÁRIOS DISPONÍVEIS ===");
      agendasDisponiveis.forEach((agenda: Agenda, index: number) => {
        console.log(`Índice ${index} -> ID: ${agenda.id} | Data: ${agenda.dtAgenda} | Horários: ${agenda.itensAgenda.filter(i => i.status === "DISPONIVEL").length}`);
      });

      setAgendas(agendasDisponiveis);
    } catch (err) {
      console.error("Erro ao carregar agendas:", err);
      setDialogMessage("Erro ao carregar horários disponíveis");
      setDialogTitle("Erro");
      setDialogType("error");
      setDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  }

  // Função para mostrar dialog
  const showDialog = (message: string, type: "error" | "warning" | "success" | "info" = "error", title?: string, onConfirm?: () => void) => {
    setDialogMessage(message);
    setDialogType(type);
    setDialogTitle(title || "");
    setOnDialogConfirm(() => onConfirm);
    setDialogOpen(true);
  };

  // Buscar cliente por CPF
  async function buscarClientePorCpf() {
    if (!cpf || cpf.length < 11) {
      showDialog("CPF inválido. Digite um CPF válido com 11 números.", "warning", "Atenção");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiPublic.get(`/pessoa/cpf/${cpf}`);
      if (response.data) {
        console.log("Cliente encontrado:", response.data);
        setCliente(response.data);
        setShowCadastro(false);
        setStep(4);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        showDialog(
          `O CPF ${cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")} não está cadastrado em nosso sistema. Deseja realizar o cadastro agora?`,
          "warning",
          "Cliente não encontrado",
          () => setShowCadastro(true)
        );
      } else {
        showDialog("Erro ao buscar cliente. Tente novamente mais tarde.", "error", "Erro na busca");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Cadastrar novo cliente
  async function cadastrarCliente() {
    if (!cadastroData.nome || !cadastroData.email || !cadastroData.telefone) {
      showDialog("Preencha todos os campos obrigatórios para continuar.", "warning", "Campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiPublic.post("/pessoa", {
        ...cadastroData,
        cpf: cpf
      });
      setCliente(response.data);
      setShowCadastro(false);
      showDialog(
        "Seu cadastro foi realizado com sucesso! Agora vamos confirmar seu agendamento.",
        "success",
        "Cadastro concluído",
        () => setStep(4)
      );
    } catch (err) {
      console.error("Erro no cadastro:", err);
      showDialog("Não foi possível realizar seu cadastro. Verifique os dados e tente novamente.", "error", "Erro no cadastro");
    } finally {
      setIsLoading(false);
    }
  }

  // Confirmar agendamento
  async function confirmarAgendamento() {
    if (!selectedHorario || !cliente || !selectedAgenda) {
      showDialog("Dados incompletos para realizar o agendamento.", "error", "Erro");
      return;
    }

    setIsLoading(true);
    try {
      console.log("=== CONFIRMANDO AGENDAMENTO ===");
      console.log("Agenda ID:", selectedAgenda.id);
      console.log("Agenda Data:", selectedAgenda.dtAgenda);
      console.log("Horário ID:", selectedHorario.id);
      console.log("Cliente ID:", cliente.id);

      await apiPublic.post("/agendas/agendar", {
        itAgenda: selectedHorario.id,
        agendaId: selectedAgenda.id,
        clienteId: cliente.id,
        procedimento: selectedHorario.procedimento || "Procedimento",
        valorProcedimento: 0,
        profissionalId: 6
      });

      setSuccess("Agendamento realizado com sucesso!");
      setTimeout(() => {
        router.push("/agendamento/sucesso");
      }, 2000);
    } catch (err) {
      console.error("Erro no agendamento:", err);
      showDialog("Não foi possível confirmar seu agendamento. Tente novamente mais tarde.", "error", "Erro no agendamento");
    } finally {
      setIsLoading(false);
    }
  }

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  const dataLocal = new Date(Number(ano), Number(mes) - 1, Number(dia));

  return dataLocal.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

  // Função para selecionar agenda - usando o objeto completo
  function handleSelectAgenda(agenda: Agenda) {
    console.log("=== CLIQUE NA AGENDA ===");
    console.log("ID da agenda clicada:", agenda.id);
    console.log("Data da agenda clicada:", agenda.dtAgenda);
    console.log("Objeto completo:", agenda);

    // Armazenar a agenda SEM ALTERAÇÕES
    setSelectedAgenda({ ...agenda });
    setStep(2);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <ArrowLeft className="w-5 h-5 text-[#0B1F3A]" />
            <span className="text-gray-600">Voltar para o site</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-between items-center">
            {[
              "Escolher Data",
              "Selecionar Horário",
              "Identificação",
              "Confirmar"
            ].map((label, index) => (
              <div key={index} className="flex-1 relative">
                <div className={`text-center ${index + 1 === step ? "text-[#0B1F3A]" : index + 1 < step ? "text-green-600" : "text-gray-400"}`}>
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 
                    ${index + 1 === step ? "border-[#0B1F3A] bg-[#0B1F3A] text-white" :
                      index + 1 < step ? "border-green-600 bg-green-600 text-white" : "border-gray-300 bg-white"}`}>
                    {index + 1 < step ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                  <p className="text-sm mt-2 hidden md:block">{label}</p>
                </div>
                {index < 3 && (
                  <div className={`absolute top-5 left-1/2 w-full h-0.5 
                    ${index + 1 < step ? "bg-green-600" : "bg-gray-300"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Selecionar Data */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-[#0B1F3A] mb-6">Escolha uma data</h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#0B1F3A]" />
              </div>
            ) : (
              <div className="grid gap-4">
                {agendas.map((agenda) => (
                  <button
                    key={`agenda-${agenda.id}-${agenda.dtAgenda}`} // Key única combinando ID e data
                    onClick={() => handleSelectAgenda(agenda)}
                    className="text-left p-4 border rounded-xl hover:border-[#0B1F3A] hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <CalendarIcon className="w-5 h-5 text-[#0B1F3A] mb-2" />
                        <p className="font-semibold text-gray-800">
                          {formatarData(agenda.dtAgenda)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {agenda.itensAgenda.filter(i => i.status === "DISPONIVEL").length} horários disponíveis
                        </p>
                        <div className="flex gap-2 mt-1">
                          <p className="text-xs text-blue-600 font-mono">
                            ID: {agenda.id}
                          </p>
                          <p className="text-xs text-gray-400">
                            Data: {agenda.dtAgenda}
                          </p>
                        </div>
                      </div>
                      <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                    </div>
                  </button>
                ))}

                {agendas.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Nenhum horário disponível no momento</p>
                    <p className="text-sm text-gray-400 mt-2">Por favor, tente novamente mais tarde</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Selecionar Horário */}
        {step === 2 && selectedAgenda && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <button
              onClick={() => setStep(1)}
              className="text-gray-500 hover:text-[#0B1F3A] mb-4 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>

            {/* Informação clara da agenda selecionada */}
            {/* <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800 font-semibold mb-2">📅 AGENDA SELECIONADA:</p>
              <div className="flex flex-col gap-1">
                <p className="text-gray-800">
                  <span className="font-bold">Data:</span> {formatarData(selectedAgenda.dtAgenda)}
                </p>
                <p className="text-gray-800">
                  <span className="font-bold">ID na API:</span> <code className="bg-blue-100 px-2 py-0.5 rounded">{selectedAgenda.id}</code>
                </p>
                <p className="text-gray-800">
                  <span className="font-bold">Data original:</span> <code className="bg-blue-100 px-2 py-0.5 rounded">{selectedAgenda.dtAgenda}</code>
                </p>
              </div>
            </div> */}

            <h2 className="text-2xl font-bold text-[#0B1F3A] mb-2">
              Selecione o horário
            </h2>
            <p className="text-gray-500 mb-6">Escolha o melhor horário para você</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {selectedAgenda.itensAgenda
                .filter(item => item.status === "DISPONIVEL")
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      console.log("Horário selecionado:", item);
                      setSelectedHorario(item);
                      setStep(3);
                    }}
                    className="p-3 border rounded-lg hover:border-[#0B1F3A] hover:bg-[#0B1F3A]/5 transition-all text-center"
                  >
                    <Clock className="w-4 h-4 text-[#0B1F3A] mx-auto mb-1" />
                    <span className="font-semibold text-[#0B1F3A]">
                      {item.hrAgendamento.substring(0, 5)}
                    </span>
                  </button>
                ))}
            </div>

            {selectedAgenda.itensAgenda.filter(item => item.status === "DISPONIVEL").length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum horário disponível para esta data</p>
                <button
                  onClick={() => setStep(1)}
                  className="mt-4 text-[#0B1F3A] underline"
                >
                  Voltar e escolher outra data
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Identificação */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <button
              onClick={() => setStep(2)}
              className="text-gray-500 hover:text-[#0B1F3A] mb-4 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>

            <h2 className="text-2xl font-bold text-[#0B1F3A] mb-6">Identificação</h2>

            {!showCadastro ? (
              <div>
                <p className="text-gray-600 mb-4">Digite seu CPF para agilizar o agendamento</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                    maxLength={11}
                    className="flex-1 border text-[#0B1F3A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                  />
                  <button
                    onClick={buscarClientePorCpf}
                    disabled={isLoading}
                    className="bg-[#0B1F3A] text-white px-6 py-2 rounded-lg hover:bg-[#1C4468] transition disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buscar"}
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      if (cpf && cpf.length === 11) {
                        showDialog(
                          `O CPF ${cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")} não está cadastrado. Deseja se cadastrar agora?`,
                          "warning",
                          "Cadastro de novo cliente",
                          () => setShowCadastro(true)
                        );
                      } else {
                        showDialog("Por favor, digite seu CPF antes de continuar.", "warning", "CPF não informado");
                      }
                    }}
                    className="text-[#1C4468] hover:underline text-sm"
                  >
                    Não tenho cadastro → Clique aqui
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Complete seu cadastro</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome completo *"
                    value={cadastroData.nome || ""}
                    onChange={(e) => setCadastroData({ ...cadastroData, nome: e.target.value })}
                    className="w-full text-[#0B1F3A] border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                  />
                  <input
                    type="email"
                    placeholder="E-mail *"
                    value={cadastroData.email || ""}
                    onChange={(e) => setCadastroData({ ...cadastroData, email: e.target.value })}
                    className="w-full text-[#0B1F3A] border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                  />
                  <input
                    type="tel"
                    placeholder="Telefone *"
                    value={cadastroData.telefone || ""}
                    onChange={(e) => setCadastroData({ ...cadastroData, telefone: e.target.value })}
                    className="w-full text-[#0B1F3A] border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                  />
                  <input
                    type="date"
                    placeholder="Data de Nascimento"
                    value={cadastroData.dataNascimento || ""}
                    onChange={(e) => setCadastroData({ ...cadastroData, dataNascimento: e.target.value })}
                    className="w-full text-[#0B1F3A] border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                  />
                  <textarea
                    placeholder="Endereço"
                    value={cadastroData.endereco || ""}
                    onChange={(e) => setCadastroData({ ...cadastroData, endereco: e.target.value })}
                    className="w-full text-[#0B1F3A] border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCadastro(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={cadastrarCliente}
                    disabled={isLoading}
                    className="flex-1 bg-[#0B1F3A] text-white py-2 rounded-lg hover:bg-[#1C4468] transition disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Cadastrar e Continuar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Confirmação */}
        {step === 4 && selectedHorario && cliente && selectedAgenda && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-[#0B1F3A] mb-6">Confirmar Agendamento</h2>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <CalendarIcon className="w-5 h-5 text-[#0B1F3A] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="font-semibold text-[#0B1F3A]">{formatarData(selectedAgenda.dtAgenda)}</p>
                  <p className="text-xs text-gray-400 font-mono mt-1">ID: {selectedAgenda.id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Clock className="w-5 h-5 text-[#0B1F3A] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Horário</p>
                  <p className="font-semibold text-[#0B1F3A]">{selectedHorario.hrAgendamento.substring(0, 5)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-[#0B1F3A] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-semibold text-[#0B1F3A]">{cliente.nome}</p>
                  <p className="text-md text-gray-600">{cliente.email} • {cliente.telefone}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                onClick={confirmarAgendamento}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirmar Agendamento"}
              </button>
            </div>

            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{success}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialog Component */}
      <DialogCompoenent
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setOnDialogConfirm(null);
          }
        }}
        message={dialogMessage}
        title={dialogTitle}
        type={dialogType}
        onConfirm={onDialogConfirm || undefined}
        showCancel={dialogType === "warning"}
      />
    </div>
  );
}