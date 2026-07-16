// Camada de acesso a dados do módulo de Prontuário.
//
// Hoje cada função devolve dados mock (src/mocks/prontuario.ts) para permitir
// construir e testar a tela sem depender do backend. Quando a API Spring Boot
// estiver pronta (ver docs/GUIA_API_SPRING_BOOT_PRONTUARIO.md), a troca é
// trivial: descomente a linha "API real" e apague o bloco mock de cada função —
// a assinatura e o formato de retorno já foram desenhados para bater com o
// contrato documentado no guia, então nenhum componente precisa mudar.

import {
  mockPacientes,
  mockHistorico,
  mockEvolucoes,
  mockAnexos,
  type Paciente,
  type HistoricoProcedimento,
  type Evolucao,
  type Anexo,
} from "@/mocks/prontuario";

const MOCK_DELAY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

export async function listarPacientes(): Promise<Paciente[]> {
  // API real: return (await api.get("/pacientes")).data;
  return delay(mockPacientes);
}

export async function buscarPaciente(pacienteId: number): Promise<Paciente | undefined> {
  // API real: return (await api.get(`/pacientes/${pacienteId}`)).data;
  return delay(mockPacientes.find((p) => p.id === pacienteId));
}

export async function listarHistorico(pacienteId: number): Promise<HistoricoProcedimento[]> {
  // API real: return (await api.get(`/pacientes/${pacienteId}/historico`)).data;
  return delay(mockHistorico.filter((h) => h.pacienteId === pacienteId));
}

export async function listarEvolucoes(pacienteId: number): Promise<Evolucao[]> {
  // API real: return (await api.get(`/pacientes/${pacienteId}/evolucoes`)).data;
  return delay(mockEvolucoes.filter((e) => e.pacienteId === pacienteId));
}

export async function adicionarEvolucao(pacienteId: number, texto: string, autor: string): Promise<Evolucao> {
  // API real: return (await api.post(`/pacientes/${pacienteId}/evolucoes`, { texto })).data;
  const nova: Evolucao = {
    id: Date.now(),
    pacienteId,
    autor,
    data: new Date().toISOString(),
    texto,
  };
  mockEvolucoes.unshift(nova);
  return delay(nova);
}

export async function listarAnexos(pacienteId: number): Promise<Anexo[]> {
  // API real: return (await api.get(`/pacientes/${pacienteId}/anexos`)).data;
  return delay(mockAnexos.filter((a) => a.pacienteId === pacienteId));
}

export type { Paciente, HistoricoProcedimento, Evolucao, Anexo };
