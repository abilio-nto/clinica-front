"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Search, Phone, Mail, FileText, Loader2, AlertTriangle,
  Plus, X, CheckCircle, ShieldCheck, UserPlus, Sparkles,
} from "lucide-react";
import { listarPacientes, criarPaciente, type Paciente } from "@/services/prontuarioService";

const EMPTY_FORM = { nome: "", cpf: "", email: "", telefone: "", dataNascimento: "", endereco: "" };

export default function PacientesPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function fetchPacientes() {
    try {
      const data = await listarPacientes();
      setPacientes(data);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPacientes();
  }, []);

  const formatarCpf = (cpf: string) =>
    cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

  const iniciais = (nome: string) =>
    nome.trim().split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const filteredPacientes = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cpf.includes(searchTerm.replace(/\D/g, ""))
  );

  const alertas = (p: Paciente) => p.alergias.length + p.contraindicacoes.length;

  const kpis = useMemo(() => {
    const comAlerta = pacientes.filter((p) => alertas(p) > 0).length;
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    const novosNoMes = pacientes.filter((p) => new Date(p.criadoEm) >= inicioMes).length;
    return { total: pacientes.length, comAlerta, novosNoMes };
  }, [pacientes]);

  function abrirNovo() {
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  }

  function validar() {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Nome obrigatório";
    if (!/^\d{11}$/.test(form.cpf.replace(/\D/g, ""))) e.cpf = "CPF deve ter 11 números";
    if (!form.telefone.trim()) e.telefone = "Telefone obrigatório";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = "E-mail inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSalvar() {
    if (!validar()) return;
    setSaving(true);
    try {
      const novo = await criarPaciente({
        nome: form.nome.trim(),
        cpf: form.cpf.replace(/\D/g, ""),
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        dataNascimento: form.dataNascimento,
        endereco: form.endereco.trim(),
      });
      setPacientes((prev) => [...prev, novo]);
      setShowModal(false);
      setToast(`Paciente ${novo.nome} cadastrado!`);
      setTimeout(() => setToast(null), 3500);
    } catch (error) {
      console.error("Erro ao cadastrar paciente:", error);
    } finally {
      setSaving(false);
    }
  }

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 transition ${errors[key] ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"}`}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0B1F3A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Carregando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 bg-green-500 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-xl shadow-md">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Pacientes</h1>
            <p className="text-sm text-gray-500">Prontuários e histórico de tratamentos</p>
          </div>
        </div>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Novo Paciente
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pacientes", value: kpis.total, icon: Users, color: "from-blue-500 to-blue-600" },
          { label: "Com alerta clínico", value: kpis.comAlerta, icon: AlertTriangle, color: "from-amber-500 to-amber-600" },
          { label: "Novos este mês", value: kpis.novosNoMes, icon: UserPlus, color: "from-emerald-500 to-emerald-600" },
        ].map((k, i) => (
          <div
            key={k.label}
            style={{ animationDelay: `${i * 75}ms` }}
            className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br ${k.color} rounded-xl flex items-center justify-center shadow-md shrink-0`}>
              <k.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-bold text-[#0B1F3A] leading-tight">{k.value}</p>
              <p className="text-[11px] sm:text-xs text-gray-500 truncate">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome ou CPF..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] bg-white"
        />
      </div>

      {filteredPacientes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-16 text-center text-gray-400 text-sm">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          Nenhum paciente encontrado
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {filteredPacientes.map((p, i) => (
              <div
                key={p.id}
                style={{ animationDelay: `${i * 60}ms` }}
                className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                onClick={() => router.push(`/dashboard/pacientes/${p.id}`)}
              >
                <div className="w-11 h-11 bg-gradient-to-br from-[#0B1F3A] to-[#4F7FAE] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {iniciais(p.nome)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.nome}</p>
                  <p className="text-xs text-gray-400 truncate">{formatarCpf(p.cpf)}</p>
                  <p className="text-xs text-gray-400 truncate">{p.telefone}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {alertas(p) > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      <AlertTriangle className="w-3 h-3" />
                      {alertas(p)}
                    </span>
                  )}
                  <FileText className="w-4 h-4 text-[#1C4468]" />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop tabela */}
          <div className="hidden sm:block bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <p className="text-sm text-gray-500">{filteredPacientes.length} paciente{filteredPacientes.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Paciente", "CPF", "Contato", "Alertas", "Ações"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPacientes.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50 transition cursor-pointer group"
                      onClick={() => router.push(`/dashboard/pacientes/${p.id}`)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-[#0B1F3A] to-[#4F7FAE] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {iniciais(p.nome)}
                          </div>
                          <p className="text-sm font-semibold text-gray-800">{p.nome}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{formatarCpf(p.cpf)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {p.telefone}</span>
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {p.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {alertas(p) > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <AlertTriangle className="w-3 h-3" />
                            {alertas(p)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-300">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/pacientes/${p.id}`);
                          }}
                          className="flex items-center gap-1 text-sm text-[#1C4468] hover:text-[#0B1F3A] font-medium opacity-0 group-hover:opacity-100 transition"
                        >
                          <FileText className="w-4 h-4" /> Ver Prontuário
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Novo Paciente */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1C4468]" />
                <h2 className="text-lg font-bold text-[#0B1F3A]">Novo Paciente</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {field("Nome completo", "nome", "text", "Ex: Maria Silva")}
              {field("CPF", "cpf", "text", "000.000.000-00")}
              {field("Telefone / WhatsApp", "telefone", "text", "(00) 00000-0000")}
              {field("E-mail", "email", "email", "email@exemplo.com")}
              {field("Data de nascimento", "dataNascimento", "date")}
              {field("Endereço", "endereco", "text", "Rua, número, bairro, cidade")}
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition">
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Cadastrar Paciente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
