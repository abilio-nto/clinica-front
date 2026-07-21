"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, User, Phone, Mail, MapPin, Cake, AlertTriangle,
  Syringe, Calendar, DollarSign, FileText, Paperclip, Image as ImageIcon,
  Send, Loader2, XCircle, ShieldAlert, Pencil, Plus, X, CheckCircle,
  Upload, TrendingUp, Clock, Activity,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  buscarPaciente,
  listarHistorico,
  listarEvolucoes,
  adicionarEvolucao,
  listarAnexos,
  atualizarPaciente,
  adicionarHistorico,
  adicionarAnexo,
  type Paciente,
  type HistoricoProcedimento,
  type Evolucao,
  type Anexo,
} from "@/services/prontuarioService";

type Aba = "dados" | "historico" | "evolucoes" | "anexos";

const EMPTY_PROCEDIMENTO = {
  procedimento: "", profissional: "", data: "", valor: "", observacoes: "",
  status: "FINALIZADO" as HistoricoProcedimento["status"],
};

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
  const [toast, setToast] = useState<string | null>(null);

  const [showEditar, setShowEditar] = useState(false);
  const [editForm, setEditForm] = useState({ telefone: "", email: "", endereco: "", alergias: "", contraindicacoes: "" });
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const [showNovoProcedimento, setShowNovoProcedimento] = useState(false);
  const [procedimentoForm, setProcedimentoForm] = useState(EMPTY_PROCEDIMENTO);
  const [errosProcedimento, setErrosProcedimento] = useState<Record<string, string>>({});
  const [salvandoProcedimento, setSalvandoProcedimento] = useState(false);

  const [enviandoAnexo, setEnviandoAnexo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function mostrarToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

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

  function abrirEditar() {
    if (!paciente) return;
    setEditForm({
      telefone: paciente.telefone,
      email: paciente.email,
      endereco: paciente.endereco,
      alergias: paciente.alergias.join(", "),
      contraindicacoes: paciente.contraindicacoes.join(", "),
    });
    setShowEditar(true);
  }

  async function handleSalvarEdicao() {
    setSalvandoEdicao(true);
    try {
      const atualizado = await atualizarPaciente(pacienteId, {
        telefone: editForm.telefone.trim(),
        email: editForm.email.trim(),
        endereco: editForm.endereco.trim(),
        alergias: editForm.alergias.split(",").map((s) => s.trim()).filter(Boolean),
        contraindicacoes: editForm.contraindicacoes.split(",").map((s) => s.trim()).filter(Boolean),
      });
      if (atualizado) setPaciente(atualizado);
      setShowEditar(false);
      mostrarToast("Dados do paciente atualizados!");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  function validarProcedimento() {
    const e: Record<string, string> = {};
    if (!procedimentoForm.procedimento.trim()) e.procedimento = "Informe o procedimento";
    if (!procedimentoForm.profissional.trim()) e.profissional = "Informe o profissional";
    if (!procedimentoForm.data) e.data = "Informe a data";
    const valorNum = Number(procedimentoForm.valor.replace(",", "."));
    if (!procedimentoForm.valor || Number.isNaN(valorNum) || valorNum < 0) e.valor = "Valor inválido";
    setErrosProcedimento(e);
    return Object.keys(e).length === 0;
  }

  async function handleSalvarProcedimento() {
    if (!validarProcedimento()) return;
    setSalvandoProcedimento(true);
    try {
      const novo = await adicionarHistorico(pacienteId, {
        procedimento: procedimentoForm.procedimento.trim(),
        profissional: procedimentoForm.profissional.trim(),
        data: new Date(procedimentoForm.data).toISOString(),
        valor: Number(procedimentoForm.valor.replace(",", ".")),
        observacoes: procedimentoForm.observacoes.trim(),
        status: procedimentoForm.status,
      });
      setHistorico((prev) => [novo, ...prev]);
      setShowNovoProcedimento(false);
      setProcedimentoForm(EMPTY_PROCEDIMENTO);
      setErrosProcedimento({});
      mostrarToast("Procedimento registrado no histórico!");
    } finally {
      setSalvandoProcedimento(false);
    }
  }

  async function handleUploadAnexo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEnviandoAnexo(true);
    try {
      const tipo: Anexo["tipo"] = file.type.startsWith("image/")
        ? "IMAGEM"
        : /exame|laudo/i.test(file.name)
        ? "EXAME"
        : "DOCUMENTO";
      const novo = await adicionarAnexo(pacienteId, file.name, tipo);
      setAnexos((prev) => [novo, ...prev]);
      mostrarToast("Anexo adicionado!");
    } finally {
      setEnviandoAnexo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const kpis = useMemo(() => {
    const finalizados = historico.filter((h) => h.status === "FINALIZADO");
    const totalInvestido = finalizados.reduce((s, h) => s + h.valor, 0);
    const ultima = historico.slice().sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];
    return {
      totalProcedimentos: finalizados.length,
      totalInvestido,
      ultimaVisita: ultima ? formatarData(ultima.data) : "—",
      totalEvolucoes: evolucoes.length,
    };
  }, [historico, evolucoes]);

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

  const abas: { id: Aba; label: string; shortLabel: string; icon: typeof User; count?: number }[] = [
    { id: "dados", label: "Dados Pessoais", shortLabel: "Dados", icon: User },
    { id: "historico", label: "Histórico de Procedimentos", shortLabel: "Histórico", icon: Syringe, count: historico.length },
    { id: "evolucoes", label: "Evoluções", shortLabel: "Evoluções", icon: FileText, count: evolucoes.length },
    { id: "anexos", label: "Anexos", shortLabel: "Anexos", icon: Paperclip, count: anexos.length },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 bg-green-500 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Voltar */}
      <button
        onClick={() => router.push("/dashboard/pacientes")}
        className="flex items-center gap-2 text-gray-600 hover:text-[#0B1F3A] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar para Pacientes
      </button>

      {/* Header do Paciente */}
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-16 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468]" />
        <div className="p-6 -mt-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0B1F3A] to-[#4F7FAE] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0 border-4 border-white shadow-md">
                {iniciais(paciente.nome)}
              </div>
              <div className="pt-8">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-[#0B1F3A]">{paciente.nome}</h1>
                  <button
                    onClick={abrirEditar}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-[#0B1F3A]"
                    title="Editar dados do paciente"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-500 mt-0.5">CPF: {formatarCpf(paciente.cpf)}</p>
              </div>
            </div>

            {(paciente.alergias.length > 0 || paciente.contraindicacoes.length > 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-center gap-2 mt-8">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-sm text-amber-800 font-medium">
                  {paciente.alergias.length + paciente.contraindicacoes.length} alerta(s) clínico(s)
                </span>
              </div>
            )}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Procedimentos", value: kpis.totalProcedimentos, icon: Syringe, color: "text-blue-600 bg-blue-50" },
              { label: "Total investido", value: fmt(kpis.totalInvestido), icon: TrendingUp, color: "text-green-600 bg-green-50" },
              { label: "Última visita", value: kpis.ultimaVisita, icon: Clock, color: "text-purple-600 bg-purple-50" },
              { label: "Evoluções", value: kpis.totalEvolucoes, icon: Activity, color: "text-amber-600 bg-amber-50" },
            ].map((k) => (
              <div key={k.label} className={`rounded-xl p-3 ${k.color}`}>
                <k.icon className="w-4 h-4 mb-1.5" />
                <p className="text-sm font-bold leading-tight">{k.value}</p>
                <p className="text-[11px] opacity-80">{k.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
          {abas.map((item) => {
            const Icon = item.icon;
            const ativo = aba === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAba(item.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 shrink-0 transition-colors ${
                  ativo
                    ? "border-[#0B1F3A] text-[#0B1F3A]"
                    : "border-transparent text-gray-500 hover:text-[#1C4468]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="sm:hidden">{item.shortLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
                {typeof item.count === "number" && item.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${ativo ? "bg-[#0B1F3A] text-white" : "bg-gray-100 text-gray-500"}`}>
                    {item.count}
                  </span>
                )}
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

              <button
                onClick={abrirEditar}
                className="flex items-center gap-2 text-sm text-[#1C4468] hover:text-[#0B1F3A] font-medium"
              >
                <Pencil className="w-4 h-4" /> Editar dados e alertas clínicos
              </button>
            </div>
          )}

          {/* Histórico de Procedimentos */}
          {aba === "historico" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-end mb-5">
                <button
                  onClick={() => setShowNovoProcedimento(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white rounded-lg text-sm font-semibold hover:shadow-md transition"
                >
                  <Plus className="w-4 h-4" /> Novo Procedimento
                </button>
              </div>
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
                        <div className="bg-gray-50 rounded-xl p-4 hover:shadow-sm transition-shadow">
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
                            <DollarSign className="w-3 h-3" /> {fmt(item.valor)}
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
                    <div key={evolucao.id} className="flex gap-3 border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B1F3A] to-[#4F7FAE] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {iniciais(evolucao.autor)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1 flex-wrap gap-1">
                          <p className="text-sm font-semibold text-[#0B1F3A]">{evolucao.autor}</p>
                          <p className="text-xs text-gray-400">{formatarDataHora(evolucao.data)}</p>
                        </div>
                        <p className="text-sm text-gray-700">{evolucao.texto}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Anexos */}
          {aba === "anexos" && (
            <div className="animate-in fade-in duration-300">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleUploadAnexo}
                accept="image/*,.pdf,.doc,.docx"
              />
              <div className="flex justify-end mb-5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={enviandoAnexo}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white rounded-lg text-sm font-semibold hover:shadow-md transition disabled:opacity-60"
                >
                  {enviandoAnexo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Adicionar Anexo
                </button>
              </div>
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
                      <div className="p-2 bg-[#0B1F3A]/10 rounded-lg shrink-0">
                        {anexo.tipo === "IMAGEM" ? (
                          <ImageIcon className="w-5 h-5 text-[#0B1F3A]" />
                        ) : (
                          <FileText className="w-5 h-5 text-[#0B1F3A]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{anexo.nome}</p>
                        <p className="text-xs text-gray-500">{formatarData(anexo.criadoEm)} • {anexo.tipo.toLowerCase()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Editar Paciente */}
      {showEditar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#0B1F3A]">Editar Paciente</h2>
              <button onClick={() => setShowEditar(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Telefone</label>
                <input
                  value={editForm.telefone}
                  onChange={(e) => setEditForm((p) => ({ ...p, telefone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">E-mail</label>
                <input
                  value={editForm.email}
                  onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Endereço</label>
                <input
                  value={editForm.endereco}
                  onChange={(e) => setEditForm((p) => ({ ...p, endereco: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Alergias (separe por vírgula)</label>
                <input
                  value={editForm.alergias}
                  onChange={(e) => setEditForm((p) => ({ ...p, alergias: e.target.value }))}
                  placeholder="Ex: Látex, Ácido hialurônico"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contraindicações (separe por vírgula)</label>
                <input
                  value={editForm.contraindicacoes}
                  onChange={(e) => setEditForm((p) => ({ ...p, contraindicacoes: e.target.value }))}
                  placeholder="Ex: Gestante, Uso de anticoagulantes"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex gap-3">
              <button onClick={() => setShowEditar(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition">
                Cancelar
              </button>
              <button
                onClick={handleSalvarEdicao}
                disabled={salvandoEdicao}
                className="flex-1 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {salvandoEdicao ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Procedimento */}
      {showNovoProcedimento && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#0B1F3A]">Novo Procedimento</h2>
              <button onClick={() => setShowNovoProcedimento(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Procedimento</label>
                <input
                  value={procedimentoForm.procedimento}
                  onChange={(e) => setProcedimentoForm((p) => ({ ...p, procedimento: e.target.value }))}
                  placeholder="Ex: Botox, Limpeza de Pele..."
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 transition ${errosProcedimento.procedimento ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"}`}
                />
                {errosProcedimento.procedimento && <p className="text-red-500 text-xs mt-1">{errosProcedimento.procedimento}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Profissional responsável</label>
                <input
                  value={procedimentoForm.profissional}
                  onChange={(e) => setProcedimentoForm((p) => ({ ...p, profissional: e.target.value }))}
                  placeholder="Ex: Nayane Pimentel"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 transition ${errosProcedimento.profissional ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"}`}
                />
                {errosProcedimento.profissional && <p className="text-red-500 text-xs mt-1">{errosProcedimento.profissional}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Data</label>
                  <input
                    type="date"
                    value={procedimentoForm.data}
                    onChange={(e) => setProcedimentoForm((p) => ({ ...p, data: e.target.value }))}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 transition ${errosProcedimento.data ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"}`}
                  />
                  {errosProcedimento.data && <p className="text-red-500 text-xs mt-1">{errosProcedimento.data}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Valor (R$)</label>
                  <input
                    value={procedimentoForm.valor}
                    onChange={(e) => setProcedimentoForm((p) => ({ ...p, valor: e.target.value }))}
                    placeholder="0,00"
                    inputMode="decimal"
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 transition ${errosProcedimento.valor ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"}`}
                  />
                  {errosProcedimento.valor && <p className="text-red-500 text-xs mt-1">{errosProcedimento.valor}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                <select
                  value={procedimentoForm.status}
                  onChange={(e) => setProcedimentoForm((p) => ({ ...p, status: e.target.value as HistoricoProcedimento["status"] }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20"
                >
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Observações</label>
                <textarea
                  value={procedimentoForm.observacoes}
                  onChange={(e) => setProcedimentoForm((p) => ({ ...p, observacoes: e.target.value }))}
                  placeholder="Detalhes da aplicação, reações, orientações..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex gap-3">
              <button onClick={() => setShowNovoProcedimento(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition">
                Cancelar
              </button>
              <button
                onClick={handleSalvarProcedimento}
                disabled={salvandoProcedimento}
                className="flex-1 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {salvandoProcedimento ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Registrar Procedimento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
