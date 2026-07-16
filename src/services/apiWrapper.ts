// ============================================================
// API WRAPPER - Alterne USE_MOCK para conectar à API Java real
// USE_MOCK = true  → usa dados locais (mockData.ts)
// USE_MOCK = false → chama http://localhost:8081 (API Java)
// ============================================================

import { api } from "./api";
import {
  mockDelay,
  MOCK_AGENDA_HOJE,
  MOCK_DASHBOARD_STATS,
  MOCK_FINANCEIRO_STATS,
  MOCK_TRANSACOES,
  MOCK_AGENDAMENTOS_HOJE,
  MOCK_CLIENTES,
  MOCK_PROCEDIMENTOS,
  MOCK_PROFISSIONAIS,
  MOCK_USUARIOS,
} from "./mockData";

export const USE_MOCK = true; // ← mude para false quando a API estiver pronta

// ─── AUTH ────────────────────────────────────────────────────
export const authLogin = async (username: string, password: string) => {
  if (USE_MOCK) {
    await mockDelay();
    const { MOCK_USERS } = await import("./mockData");
    const found = MOCK_USERS.find(u => u.username === username && u.password === password);
    if (!found) throw new Error("Credenciais inválidas");
    return { token: `mock-jwt-${found.id}-${found.role}` };
  }
  const res = await api.post("/auth/login", { username, password });
  return res.data;
};

export const authMe = async () => {
  if (USE_MOCK) {
    await mockDelay(200);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) throw new Error("Sem token");
    const { MOCK_USERS } = await import("./mockData");
    const id = parseInt(token.split("-")[2]);
    const found = MOCK_USERS.find(u => u.id === id);
    if (!found) throw new Error("Usuário não encontrado");
    return found;
  }
  const res = await api.get("/auth/me");
  return res.data;
};

// ─── DASHBOARD ───────────────────────────────────────────────
export const fetchDashboardStats = async () => {
  if (USE_MOCK) {
    await mockDelay();
    return MOCK_DASHBOARD_STATS;
  }
  const res = await api.get("/dashboard/stats");
  return res.data;
};

export const fetchAgendaHoje = async () => {
  if (USE_MOCK) {
    await mockDelay();
    return MOCK_AGENDA_HOJE;
  }
  const res = await api.get("/agendas/AgendaHoje");
  return res.data;
};

// ─── AGENDAMENTOS ─────────────────────────────────────────────
export const fetchAgendamentosHoje = async () => {
  if (USE_MOCK) {
    await mockDelay();
    return MOCK_AGENDAMENTOS_HOJE;
  }
  const res = await api.get("/agendas/AgendaHoje");
  return res.data.itensAgenda;
};

export const iniciarAtendimento = async (id: number, observacoes: string) => {
  if (USE_MOCK) {
    await mockDelay(600);
    return { success: true };
  }
  const res = await api.put(`/atendimento/iniciar-atendimento/${id}`, { observacoes });
  return res.data;
};

export const finalizarAtendimento = async (id: number, observacoes: string) => {
  if (USE_MOCK) {
    await mockDelay(600);
    return { success: true };
  }
  const res = await api.put(`/atendimento/finalizar-atendimento/${id}`, {
    observacoes,
    dataHoraFim: new Date().toISOString(),
  });
  return res.data;
};

export const cancelarAgendamento = async (id: number, motivo: string) => {
  if (USE_MOCK) {
    await mockDelay(500);
    return { success: true };
  }
  const res = await api.put(`/atendimento/cancelar/${id}`, { motivo });
  return res.data;
};

// ─── CLIENTES ─────────────────────────────────────────────────
export const fetchClientes = async () => {
  if (USE_MOCK) {
    await mockDelay();
    return MOCK_CLIENTES;
  }
  const res = await api.get("/clientes");
  return res.data;
};

export const fetchClienteByCpf = async (cpf: string) => {
  if (USE_MOCK) {
    await mockDelay();
    const found = MOCK_CLIENTES.find(c => c.cpf === cpf);
    if (!found) throw new Error("Cliente não encontrado");
    return found;
  }
  const res = await api.get(`/clientes/cpf/${cpf}`);
  return res.data;
};

export const criarCliente = async (data: Record<string, unknown>) => {
  if (USE_MOCK) {
    await mockDelay(700);
    return { id: Date.now(), ...data };
  }
  const res = await api.post("/clientes", data);
  return res.data;
};

export const atualizarCliente = async (id: number, data: Record<string, unknown>) => {
  if (USE_MOCK) {
    await mockDelay(700);
    return { id, ...data };
  }
  const res = await api.put(`/clientes/${id}`, data);
  return res.data;
};

// ─── PROCEDIMENTOS ────────────────────────────────────────────
export const fetchProcedimentos = async () => {
  if (USE_MOCK) {
    await mockDelay();
    return MOCK_PROCEDIMENTOS;
  }
  const res = await api.get("/procedimentos");
  return res.data;
};

export const criarProcedimento = async (data: Record<string, unknown>) => {
  if (USE_MOCK) {
    await mockDelay(700);
    return { id: Date.now(), ...data };
  }
  const res = await api.post("/procedimentos", data);
  return res.data;
};

export const atualizarProcedimento = async (id: number, data: Record<string, unknown>) => {
  if (USE_MOCK) {
    await mockDelay(700);
    return { id, ...data };
  }
  const res = await api.put(`/procedimentos/${id}`, data);
  return res.data;
};

// ─── PROFISSIONAIS ────────────────────────────────────────────
export const fetchProfissionais = async () => {
  if (USE_MOCK) {
    await mockDelay();
    return MOCK_PROFISSIONAIS;
  }
  const res = await api.get("/profissionais");
  return res.data;
};

// ─── FINANCEIRO ───────────────────────────────────────────────
export const fetchFinanceiroStats = async (periodo = "mes") => {
  if (USE_MOCK) {
    await mockDelay();
    return { stats: MOCK_FINANCEIRO_STATS, transacoesRecentes: MOCK_TRANSACOES };
  }
  const res = await api.get(`/financeiro/dashboard?periodo=${periodo}`);
  return res.data;
};

// ─── USUÁRIOS ─────────────────────────────────────────────────
export const fetchUsuarios = async () => {
  if (USE_MOCK) {
    await mockDelay();
    return MOCK_USUARIOS;
  }
  const res = await api.get("/usuarios");
  return res.data;
};

export const criarUsuario = async (data: Record<string, unknown>) => {
  if (USE_MOCK) {
    await mockDelay(700);
    return { id: Date.now(), ...data };
  }
  const res = await api.post("/usuarios", data);
  return res.data;
};

export const toggleUsuarioAtivo = async (id: number) => {
  if (USE_MOCK) {
    await mockDelay(500);
    return { success: true };
  }
  const res = await api.patch(`/usuarios/${id}/toggle-ativo`);
  return res.data;
};

// ─── AGENDA SLOTS ─────────────────────────────────────────────
export const agendarSlotAgenda = async (
  itAgendaId: number,
  clienteId: number,
  procedimentoId: number
) => {
  if (USE_MOCK) {
    await mockDelay(700);
    return { success: true };
  }
  const res = await api.post("/agendas/agendar-slot", { itAgendaId, clienteId, procedimentoId });
  return res.data;
};

export const cancelarSlotAgenda = async (itAgendaId: number) => {
  if (USE_MOCK) {
    await mockDelay(500);
    return { success: true };
  }
  const res = await api.put(`/agendas/cancelar-slot/${itAgendaId}`);
  return res.data;
};
