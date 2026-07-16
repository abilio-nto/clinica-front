"use client";

import { useState, useEffect, useMemo } from "react";
import {
  UserCog, Search, Plus, ToggleLeft, ToggleRight,
  X, CheckCircle, AlertCircle, Loader2, Shield,
  Eye, EyeOff
} from "lucide-react";
import { fetchUsuarios, criarUsuario, toggleUsuarioAtivo } from "@/services/apiWrapper";

interface Pessoa {
  nome: string;
  email: string;
  telefone?: string;
}

interface Usuario {
  id: number;
  username: string;
  role: string;
  ativo: boolean;
  pessoa: Pessoa;
}

const ROLE_CFG: Record<string, { label: string; color: string }> = {
  ADMIN: { label: "Administrador", color: "bg-red-100 text-red-700" },
  RECEPCAO: { label: "Recepção", color: "bg-blue-100 text-blue-700" },
  FINANCEIRO: { label: "Financeiro", color: "bg-purple-100 text-purple-700" },
  PROFISSIONAL: { label: "Profissional", color: "bg-emerald-100 text-emerald-700" },
  USER: { label: "Cliente", color: "bg-gray-100 text-gray-600" },
};

const EMPTY_FORM = { nome: "", email: "", telefone: "", username: "", password: "", role: "RECEPCAO" };

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { load(); }, []);

  async function load() {
    setIsLoading(true);
    try {
      const data = await fetchUsuarios();
      setUsuarios(data as Usuario[]);
    } catch { showToast("Erro ao carregar usuários", "err"); }
    finally { setIsLoading(false); }
  }

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const filtrados = useMemo(() =>
    usuarios.filter(u =>
      search === "" ||
      u.pessoa.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
    ), [usuarios, search]);

  async function handleToggle(u: Usuario) {
    try {
      await toggleUsuarioAtivo(u.id);
      setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, ativo: !x.ativo } : x));
      showToast(`Usuário ${!u.ativo ? "ativado" : "desativado"}`, "ok");
    } catch { showToast("Erro ao atualizar usuário", "err"); }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Nome obrigatório";
    if (!form.username.trim()) e.username = "Usuário obrigatório";
    if (!form.password || form.password.length < 6) e.password = "Senha deve ter no mínimo 6 caracteres";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = "E-mail inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSalvar() {
    if (!validate()) return;
    setSaving(true);
    try {
      const novo = await criarUsuario({
        username: form.username,
        password: form.password,
        role: form.role,
        pessoa: { nome: form.nome, email: form.email, telefone: form.telefone },
      });
      setUsuarios(prev => [...prev, novo as Usuario]);
      showToast("Usuário criado com sucesso!", "ok");
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch { showToast("Erro ao criar usuário", "err"); }
    finally { setSaving(false); }
  }

  const input = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${errors[key] ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"}`}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  const ativos = usuarios.filter(u => u.ativo).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0B1F3A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            <UserCog className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Usuários do Sistema</h1>
            <p className="text-sm text-gray-500">{ativos} ativos de {usuarios.length} cadastrados</p>
          </div>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setErrors({}); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Novo Usuário
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, usuário ou função..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] bg-white"
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Usuário", "Login", "Função", "Status", "Ações"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <UserCog className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Nenhum usuário encontrado</p>
                  </td>
                </tr>
              ) : filtrados.map(u => {
                const cfg = ROLE_CFG[u.role] || ROLE_CFG["USER"];
                return (
                  <tr key={u.id} className={`hover:bg-gray-50 transition ${!u.ativo ? "opacity-50" : ""}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#0B1F3A] to-[#4F7FAE] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.pessoa.nome.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{u.pessoa.nome}</p>
                          <p className="text-xs text-gray-400">{u.pessoa.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 font-mono">{u.username}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                        <Shield className="w-3 h-3" />{cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${u.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {u.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => handleToggle(u)} className="p-1.5 hover:bg-gray-100 rounded-lg transition" title={u.ativo ? "Desativar" : "Ativar"}>
                        {u.ativo
                          ? <ToggleRight className="w-6 h-6 text-green-500" />
                          : <ToggleLeft className="w-6 h-6 text-gray-400" />
                        }
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {filtrados.map(u => {
            const cfg = ROLE_CFG[u.role] || ROLE_CFG["USER"];
            return (
              <div key={u.id} className={`p-4 flex items-center gap-3 ${!u.ativo ? "opacity-50" : ""}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-[#0B1F3A] to-[#4F7FAE] rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  {u.pessoa.nome.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{u.pessoa.nome}</p>
                  <p className="text-xs text-gray-400">@{u.username}</p>
                  <span className={`inline-flex items-center gap-0.5 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
                <button onClick={() => handleToggle(u)}>
                  {u.ativo
                    ? <ToggleRight className="w-7 h-7 text-green-500" />
                    : <ToggleLeft className="w-7 h-7 text-gray-400" />
                  }
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal criar usuário */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#0B1F3A]">Novo Usuário</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-xl p-3">
                Preencha os dados para criar um novo acesso ao sistema.
              </p>
              {input("Nome completo *", "nome", "text", "Ex: Ana Lima")}
              {input("E-mail", "email", "email", "email@exemplo.com")}
              {input("Telefone", "telefone", "text", "(00) 00000-0000")}
              {input("Nome de usuário (login) *", "username", "text", "Ex: ana.lima")}
              {/* Senha com toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Senha *</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    className={`w-full border rounded-xl px-3 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 ${errors.password ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"}`}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              {/* Função */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Função *</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] bg-white"
                >
                  <option value="RECEPCAO">Recepção</option>
                  <option value="PROFISSIONAL">Profissional</option>
                  <option value="FINANCEIRO">Financeiro</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
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
                Criar usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
