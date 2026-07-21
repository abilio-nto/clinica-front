"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Syringe, Search, Plus, Edit2, ToggleLeft, ToggleRight,
  X, CheckCircle, AlertCircle, Loader2, Clock, DollarSign, Tag
} from "lucide-react";
import { fetchProcedimentos, criarProcedimento, atualizarProcedimento } from "@/services/apiWrapper";

interface Procedimento {
  id: number;
  nome: string;
  descricao: string;
  duracao: number;
  valor: number;
  ativo: boolean;
  categoria: string;
}

const EMPTY: Partial<Procedimento> = {
  nome: "", descricao: "", duracao: 30, valor: 0, ativo: true, categoria: "Facial"
};

const CATEGORIAS = ["Facial", "Corporal", "Injetável", "Depilação", "Outros"];

const CAT_COLORS: Record<string, string> = {
  Facial: "bg-pink-100 text-pink-700",
  Corporal: "bg-blue-100 text-blue-700",
  Injetável: "bg-purple-100 text-purple-700",
  Depilação: "bg-amber-100 text-amber-700",
  Outros: "bg-gray-100 text-gray-700",
};

export default function ProcedimentosPage() {
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"criar" | "editar">("criar");
  const [form, setForm] = useState<Partial<Procedimento>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { load(); }, []);

  async function load() {
    setIsLoading(true);
    try {
      const data = await fetchProcedimentos();
      setProcedimentos(data as Procedimento[]);
    } catch { showToast("Erro ao carregar procedimentos", "err"); }
    finally { setIsLoading(false); }
  }

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const filtrados = useMemo(() =>
    procedimentos.filter(p => {
      const matchSearch = search === "" ||
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        p.categoria.toLowerCase().includes(search.toLowerCase());
      const matchCat = filtroCategoria === "Todos" || p.categoria === filtroCategoria;
      return matchSearch && matchCat;
    }), [procedimentos, search, filtroCategoria]);

  function openCriar() {
    setForm(EMPTY); setErrors({}); setModalMode("criar"); setShowModal(true);
  }
  function openEditar(p: Procedimento) {
    setForm(p); setErrors({}); setModalMode("editar"); setShowModal(true);
  }

  async function toggleAtivo(p: Procedimento) {
    try {
      await atualizarProcedimento(p.id, { ...p, ativo: !p.ativo });
      setProcedimentos(prev => prev.map(x => x.id === p.id ? { ...x, ativo: !x.ativo } : x));
      showToast(`Procedimento ${!p.ativo ? "ativado" : "desativado"}`, "ok");
    } catch { showToast("Erro ao atualizar", "err"); }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nome?.trim()) e.nome = "Nome obrigatório";
    if (!form.valor || form.valor <= 0) e.valor = "Valor deve ser maior que zero";
    if (!form.duracao || form.duracao <= 0) e.duracao = "Duração obrigatória";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSalvar() {
    if (!validate()) return;
    setSaving(true);
    try {
      if (modalMode === "criar") {
        const novo = await criarProcedimento(form as Record<string, unknown>);
        setProcedimentos(prev => [...prev, novo as Procedimento]);
        showToast("Procedimento criado!", "ok");
      } else {
        const atualizado = await atualizarProcedimento(form.id!, form as Record<string, unknown>);
        setProcedimentos(prev => prev.map(p => p.id === form.id ? atualizado as Procedimento : p));
        showToast("Procedimento atualizado!", "ok");
      }
      setShowModal(false);
    } catch { showToast("Erro ao salvar", "err"); }
    finally { setSaving(false); }
  }

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const ativos = procedimentos.filter(p => p.ativo).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0B1F3A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Carregando procedimentos...</p>
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
            <Syringe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Procedimentos</h1>
            <p className="text-sm text-gray-500">{ativos} ativos de {procedimentos.length} cadastrados</p>
          </div>
        </div>
        <button
          onClick={openCriar}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0B1F3A] to-[#1C4468] text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Novo Procedimento
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar procedimento..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["Todos", ...CATEGORIAS].map(cat => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition border ${filtroCategoria === cat ? "bg-[#0B1F3A] text-white border-[#0B1F3A]" : "bg-white text-gray-500 border-gray-200 hover:border-[#0B1F3A]/30"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <Syringe className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Nenhum procedimento encontrado</p>
          </div>
        ) : filtrados.map(p => (
          <div key={p.id} className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden border-2 ${p.ativo ? "border-transparent" : "border-gray-100 opacity-60"}`}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${CAT_COLORS[p.categoria] || CAT_COLORS["Outros"]}`}>
                  <Tag className="w-3 h-3 inline mr-1" />{p.categoria}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => openEditar(p)} className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="Editar">
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => toggleAtivo(p)} className="p-1.5 hover:bg-gray-100 rounded-lg transition" title={p.ativo ? "Desativar" : "Ativar"}>
                    {p.ativo
                      ? <ToggleRight className="w-5 h-5 text-green-500" />
                      : <ToggleLeft className="w-5 h-5 text-gray-400" />
                    }
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-[#0B1F3A] text-base">{p.nome}</h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.descricao}</p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs">{p.duracao} min</span>
                </div>
                <div className="flex items-center gap-1 text-[#0B1F3A] font-bold">
                  <span className="text-base">{fmt(p.valor)}</span>
                </div>
              </div>
            </div>
            <div className={`h-1 ${p.ativo ? "bg-gradient-to-r from-[#0B1F3A] to-[#4F7FAE]" : "bg-gray-200"}`} />
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#0B1F3A]">
                {modalMode === "criar" ? "Novo Procedimento" : "Editar Procedimento"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome do procedimento *</label>
                <input
                  value={form.nome || ""}
                  onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                  placeholder="Ex: Limpeza de Pele"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.nome ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"}`}
                />
                {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
              </div>
              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descrição</label>
                <textarea
                  value={form.descricao || ""}
                  onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                  placeholder="Descreva o procedimento..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] resize-none"
                  rows={3}
                />
              </div>
              {/* Categoria */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Categoria</label>
                <select
                  value={form.categoria || "Facial"}
                  onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] bg-white"
                >
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Duração e Valor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Duração (min) *</label>
                  <input
                    type="number"
                    min={5}
                    value={form.duracao || ""}
                    onChange={e => setForm(p => ({ ...p, duracao: parseInt(e.target.value) || 0 }))}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.duracao ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"}`}
                  />
                  {errors.duracao && <p className="text-red-500 text-xs mt-1">{errors.duracao}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Valor (R$) *</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.valor || ""}
                    onChange={e => setForm(p => ({ ...p, valor: parseFloat(e.target.value) || 0 }))}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.valor ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"}`}
                  />
                  {errors.valor && <p className="text-red-500 text-xs mt-1">{errors.valor}</p>}
                </div>
              </div>
              {/* Ativo */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <button
                  onClick={() => setForm(p => ({ ...p, ativo: !p.ativo }))}
                  className="transition"
                >
                  {form.ativo
                    ? <ToggleRight className="w-7 h-7 text-green-500" />
                    : <ToggleLeft className="w-7 h-7 text-gray-400" />
                  }
                </button>
                <span className="text-sm text-gray-700 font-medium">
                  Procedimento {form.ativo ? "ativo" : "inativo"}
                </span>
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
                {modalMode === "criar" ? "Criar procedimento" : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
