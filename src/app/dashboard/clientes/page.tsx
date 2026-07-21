"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users, Search, Plus, Eye, Edit2, Phone, Mail,
  X, CheckCircle, AlertCircle, Loader2, Calendar, Star
} from "lucide-react";
import { fetchClientes, criarCliente, atualizarCliente } from "@/services/apiWrapper";

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  endereco: string;
  totalAtendimentos?: number;
  ultimaVisita?: string;
}

const EMPTY: Partial<Cliente> = {
  nome: "", email: "", telefone: "", cpf: "", dataNascimento: "", endereco: ""
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"criar" | "editar" | "ver">("criar");
  const [form, setForm] = useState<Partial<Cliente>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { load(); }, []);

  async function load() {
    setIsLoading(true);
    try {
      const data = await fetchClientes();
      setClientes(data as Cliente[]);
    } catch { showToast("Erro ao carregar clientes", "err"); }
    finally { setIsLoading(false); }
  }

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const filtrados = useMemo(() =>
    clientes.filter(c =>
      search === "" ||
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.cpf.includes(search) ||
      c.telefone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    ), [clientes, search]);

  function openCriar() {
    setForm(EMPTY); setErrors({}); setModalMode("criar"); setShowModal(true);
  }
  function openEditar(c: Cliente) {
    setForm(c); setErrors({}); setModalMode("editar"); setShowModal(true);
  }
  function openVer(c: Cliente) {
    setForm(c); setModalMode("ver"); setShowModal(true);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nome?.trim()) e.nome = "Nome obrigatório";
    if (!form.cpf?.trim()) e.cpf = "CPF obrigatório";
    if (!form.telefone?.trim()) e.telefone = "Telefone obrigatório";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = "E-mail inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSalvar() {
    if (!validate()) return;
    setSaving(true);
    try {
      if (modalMode === "criar") {
        const novo = await criarCliente(form as Record<string, unknown>);
        setClientes(prev => [...prev, novo as Cliente]);
        showToast("Cliente cadastrado com sucesso!", "ok");
      } else {
        const atualizado = await atualizarCliente(form.id!, form as Record<string, unknown>);
        setClientes(prev => prev.map(c => c.id === form.id ? atualizado as Cliente : c));
        showToast("Cliente atualizado!", "ok");
      }
      setShowModal(false);
    } catch { showToast("Erro ao salvar cliente", "err"); }
    finally { setSaving(false); }
  }

  const fmt = (d: string) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";

  const field = (label: string, key: keyof Cliente, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {modalMode === "ver" ? (
        <p className="text-sm text-gray-800 py-2 border-b border-gray-100">{form[key] as string || "—"}</p>
      ) : (
        <>
          <input
            type={type}
            value={(form[key] as string) || ""}
            onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
            placeholder={placeholder}
            className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${errors[key] ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"}`}
          />
          {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
        </>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0B1F3A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 ${toast.type === "ok" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.type === "ok" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#0B1F3A] to-[#1C4468] rounded-xl shadow-md">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Clientes</h1>
            <p className="text-sm text-gray-500">{clientes.length} clientes cadastrados</p>
          </div>
        </div>
        <button
          onClick={openCriar}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, CPF, telefone ou e-mail..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] bg-white"
        />
      </div>

      {/* Grid de cards (mobile) / tabela (desktop) */}
      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filtrados.map(c => (
          <div key={c.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#0B1F3A] to-[#4F7FAE] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
              {c.nome.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{c.nome}</p>
              <p className="text-xs text-gray-400 truncate">{c.telefone}</p>
              <p className="text-xs text-gray-400 truncate">{c.cpf}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openVer(c)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Eye className="w-4 h-4 text-gray-500" />
              </button>
              <button onClick={() => openEditar(c)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Edit2 className="w-4 h-4 text-[#0B1F3A]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop tabela */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <p className="text-sm text-gray-500">{filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Cliente", "CPF", "Telefone", "Última visita", "Atend.", "Ações"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400 text-sm">
                    <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : filtrados.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#0B1F3A] to-[#4F7FAE] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{c.nome}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{c.cpf}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{c.telefone}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{c.ultimaVisita ? fmt(c.ultimaVisita) : "—"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" />
                      <span className="text-sm font-semibold text-gray-700">{c.totalAtendimentos ?? 0}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => openVer(c)} className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="Ver detalhes">
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => openEditar(c)} className="p-1.5 hover:bg-[#0B1F3A]/5 rounded-lg transition" title="Editar">
                        <Edit2 className="w-4 h-4 text-[#0B1F3A]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#0B1F3A]">
                {modalMode === "criar" ? "Novo Cliente" : modalMode === "editar" ? "Editar Cliente" : "Detalhes do Cliente"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {modalMode === "ver" && form.totalAtendimentos !== undefined && (
                <div className="flex gap-3 mb-2">
                  <div className="flex-1 bg-[#0B1F3A]/5 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-[#0B1F3A]">{form.totalAtendimentos}</p>
                    <p className="text-xs text-gray-500">Atendimentos</p>
                  </div>
                  <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
                    <p className="text-sm font-bold text-amber-700">{form.ultimaVisita ? fmt(form.ultimaVisita) : "—"}</p>
                    <p className="text-xs text-gray-500">Última visita</p>
                  </div>
                </div>
              )}
              {field("Nome completo", "nome", "text", "Ex: Maria Silva")}
              {field("CPF", "cpf", "text", "000.000.000-00")}
              {field("Telefone / WhatsApp", "telefone", "text", "(00) 00000-0000")}
              {field("E-mail", "email", "email", "email@exemplo.com")}
              {field("Data de nascimento", "dataNascimento", "date")}
              {field("Endereço", "endereco", "text", "Rua, número, bairro, cidade")}
            </div>

            {modalMode !== "ver" && (
              <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition">
                  Cancelar
                </button>
                <button
                  onClick={handleSalvar}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {modalMode === "criar" ? "Cadastrar" : "Salvar alterações"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
