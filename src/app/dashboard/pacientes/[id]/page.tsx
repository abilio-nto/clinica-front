"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, User, Phone, Mail, MapPin, Cake, AlertTriangle,
  Syringe, Calendar, DollarSign, FileText, Paperclip, Image as ImageIcon,
  Send, Loader2, XCircle, ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  buscarPaciente,
  listarHistorico,
  listarEvolucoes,
  adicionarEvolucao,
  listarAnexos,
  type Paciente,
  type HistoricoProcedimento,
  type Evolucao,
  type Anexo,
} from "@/services/prontuarioService";

type Aba = "dados" | "historico" | "evolucoes" | "anexos";

export default function ProntuarioPaciente() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const pacienteId = Number(params.id);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [historico, setHistorico] = useState<HistoricoProcedimento[]>([]);
  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([]);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aba, setAba] = useState<Aba>("dados");
  const [novaEvolucao, setNovaEvolucao] = useState("");
  const [isSalvandoEvolucao, setIsSalvandoEvolucao] = useState(false);

  async function carregarProntuario() {
    setIsLoading(true);
    try {
      const [p, h, e, a] = await Promise.all([
        buscarPaciente(pacienteId),
        listarHistorico(pacienteId),
        listarEvolucoes(pacienteId),
        listarAnexos(pacienteId),
      ]);
      setPaciente(p ?? null);
      setHistorico(h);
      setEvolucoes(e);
      setAnexos(a);
    } catch (error) {
      console.error("Erro ao carregar prontuário:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (pacienteId) carregarProntuario();
  }, [pacienteId]);

  async function handleAdicionarEvolucao() {
    if (!novaEvolucao.trim()) return;
    setIsSalvandoEvolucao(true);
    try {
      const autor = user?.pessoa?.nome || "Profissional";
      const evolucao = await adicionarEvolucao(pacienteId, novaEvolucao.trim(), autor);
      setEvolucoes((prev) => [evolucao, ...prev]);
      setNovaEvolucao("");
    } catch (error) {
      console.error("Erro ao adicionar evolução:", error);
    } finally {
      setIsSalvandoEvolucao(false);
    }
  }

  const formatarData = (data: string) =>
    new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const formatarDataHora = (data: string) =>
    new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " às " +
    new Date(data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const formatarCpf = (cpf: string) =>
    cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

  const iniciais = (nome: string) =>
    nome.trim().split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0B1F3A] mx-auto mb-4" />
          <p className="text-gray-500">Carregando prontuário...</p>
        </div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-700 mb-4">Paciente não encontrado</p>
          <button
            onClick={() => router.push("/dashboard/pacientes")}
            className="bg-[#0B1F3A] text-white px-4 py-2 rounded-lg hover:bg-[#1C4468] transition"
          >
            Voltar para Pacientes
          </button>
        </div>
      </div>
    );
  }

  const abas: { id: Aba; label: string; icon: typeof User }[] = [
    { id: "dados", label: "Dados Pessoais", icon: User },
    { id: "historico", label: "Histórico de Procedimentos", icon: Syringe },
    { id: "evolucoes", label: "Evoluções", icon: FileText },
    { id: "anexos", label: "Anexos", icon: Paperclip },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Voltar */}
      <button
        onClick={() => router.push("/dashboard/pacientes")}
        className="flex items-center gap-2 text-gray-600 hover:text-[#0B1F3A] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar para Pacientes
      </button>

      {/* Header do Paciente */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {iniciais(paciente.nome)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0B1F3A]">{paciente.nome}</h1>
              <p className="text-gray-500 mt-1">CPF: {formatarCpf(paciente.cpf)}</p>
            </div>
          </div>

          {(paciente.alergias.length > 0 || paciente.contraindicacoes.length > 0) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="text-sm text-amber-800 font-medium">
                {paciente.alergias.length + paciente.contraindicacoes.length} alerta(s) clínico(s)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Abas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {abas.map((item) => {
            const Icon = item.icon;
            const ativo = aba === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAba(item.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  ativo
                    ? "border-[#0B1F3A] text-[#0B1F3A]"
                    : "border-transparent text-gray-500 hover:text-[#1C4468]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Dados Pessoais */}
          {aba === "dados" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#0B1F3A]" />
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-medium text-gray-800">{paciente.telefone}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#0B1F3A]" />
                  <div>
                    <p className="text-sm text-gray-500">E-mail</p>
                    <p className="font-medium text-gray-800">{paciente.email}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                  <Cake className="w-5 h-5 text-[#0B1F3A]" />
                  <div>
                    <p className="text-sm text-gray-500">Data de Nascimento</p>
                    <p className="font-medium text-gray-800">{formatarData(paciente.dataNascimento)}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#0B1F3A]" />
                  <div>
                    <p className="text-sm text-gray-500">Endereço</p>
                    <p className="font-medium text-gray-800">{paciente.endereco}</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <p className="font-semibold text-amber-800 text-sm">Alergias</p>
                  </div>
                  {paciente.alergias.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhuma alergia registrada</p>
                  ) : (
                    <ul className="text-sm text-amber-800 space-y-1">
                      {paciente.alergias.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <p className="font-semibold text-red-800 text-sm">Contraindicações</p>
                  </div>
                  {paciente.contraindicacoes.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhuma contraindicação registrada</p>
                  ) : (
                    <ul className="text-sm text-red-800 space-y-1">
                      {paciente.contraindicacoes.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Histórico de Procedimentos */}
          {aba === "historico" && (
            <div className="animate-in fade-in duration-300">
              {historico.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Syringe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum procedimento registrado</p>
                </div>
              ) : (
                <div className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {historico
                    .slice()
                    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                    .map((item) => (
                      <div key={item.id} className="relative pl-12">
                        <div
                          className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            item.status === "FINALIZADO" ? "bg-[#0B1F3A]" : "bg-gray-300"
                          }`}
                        >
                          <Syringe className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                              <p className="font-semibold text-gray-800">{item.procedimento}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" /> {formatarDataHora(item.data)} • {item.profissional}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === "FINALIZADO"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.status === "FINALIZADO" ? "Finalizado" : "Cancelado"}
                            </span>
                          </div>
                          {item.observacoes && (
                            <p className="text-sm text-gray-600 mt-2">{item.observacoes}</p>
                          )}
                          <p className="text-sm font-semibold text-[#1C4468] flex items-center gap-1 mt-2">
                            <DollarSign className="w-3 h-3" /> {item.valor.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Evoluções */}
          {aba === "evolucoes" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova anotação de evolução
                </label>
                <textarea
                  value={novaEvolucao}
                  onChange={(e) => setNovaEvolucao(e.target.value)}
                  placeholder="Registre a evolução clínica do paciente..."
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] text-gray-800"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleAdicionarEvolucao}
                    disabled={isSalvandoEvolucao || !novaEvolucao.trim()}
                    className="bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white px-5 py-2 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSalvandoEvolucao ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Salvar Evolução
                  </button>
                </div>
              </div>

              {evolucoes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma evolução registrada ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {evolucoes.map((evolucao) => (
                    <div key={evolucao.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-[#0B1F3A]">{evolucao.autor}</p>
                        <p className="text-xs text-gray-400">{formatarDataHora(evolucao.data)}</p>
                      </div>
                      <p className="text-sm text-gray-700">{evolucao.texto}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Anexos */}
          {aba === "anexos" && (
            <div className="animate-in fade-in duration-300">
              {anexos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Paperclip className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum anexo enviado</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {anexos.map((anexo) => (
                    <div
                      key={anexo.id}
                      className="flex items-center gap-3 border border-gray-100 rounded-xl p-4 hover:shadow-md transition"
                    >
                      <div className="p-2 bg-[#0B1F3A]/10 rounded-lg">
                        {anexo.tipo === "IMAGEM" ? (
                          <ImageIcon className="w-5 h-5 text-[#0B1F3A]" />
                        ) : (
                          <FileText className="w-5 h-5 text-[#0B1F3A]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{anexo.nome}</p>
                        <p className="text-xs text-gray-500">{formatarData(anexo.criadoEm)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
