// Mock de dados do módulo de Prontuário.
// Formato pensado para já refletir o que a API real (Spring Boot) deverá devolver —
// ver docs/GUIA_API_SPRING_BOOT_PRONTUARIO.md para o contrato completo.

export interface Paciente {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string; // ISO (yyyy-MM-dd)
  endereco: string;
  alergias: string[];
  contraindicacoes: string[];
  criadoEm: string; // ISO datetime
}

export interface HistoricoProcedimento {
  id: number;
  pacienteId: number;
  procedimento: string;
  profissional: string;
  data: string; // ISO datetime
  valor: number;
  observacoes: string;
  status: "FINALIZADO" | "CANCELADO";
}

export interface Evolucao {
  id: number;
  pacienteId: number;
  autor: string;
  data: string; // ISO datetime
  texto: string;
  procedimentoRelacionadoId?: number;
}

export interface Anexo {
  id: number;
  pacienteId: number;
  nome: string;
  tipo: "IMAGEM" | "DOCUMENTO" | "EXAME";
  url: string;
  criadoEm: string; // ISO datetime
}

export const mockPacientes: Paciente[] = [
  {
    id: 1,
    nome: "Ana Beatriz Souza",
    cpf: "12345678901",
    email: "ana.souza@email.com",
    telefone: "(81) 98888-1111",
    dataNascimento: "1992-03-14",
    endereco: "Rua das Flores, 120 - Boa Viagem, Recife - PE",
    alergias: ["Ácido hialurônico (leve)"],
    contraindicacoes: ["Gestante"],
    criadoEm: "2024-01-10T09:00:00",
  },
  {
    id: 2,
    nome: "Carla Menezes",
    cpf: "23456789012",
    email: "carla.menezes@email.com",
    telefone: "(81) 98888-2222",
    dataNascimento: "1988-07-22",
    endereco: "Av. Boa Viagem, 2200 - Recife - PE",
    alergias: [],
    contraindicacoes: [],
    criadoEm: "2024-02-05T14:30:00",
  },
  {
    id: 3,
    nome: "Fernanda Lima",
    cpf: "34567890123",
    email: "fernanda.lima@email.com",
    telefone: "(81) 98888-3333",
    dataNascimento: "1995-11-02",
    endereco: "Rua do Sol, 45 - Casa Forte, Recife - PE",
    alergias: ["Látex"],
    contraindicacoes: [],
    criadoEm: "2024-03-18T11:15:00",
  },
  {
    id: 4,
    nome: "Juliana Ramos",
    cpf: "45678901234",
    email: "juliana.ramos@email.com",
    telefone: "(81) 98888-4444",
    dataNascimento: "1990-05-30",
    endereco: "Rua da Aurora, 800 - Recife - PE",
    alergias: [],
    contraindicacoes: ["Uso de anticoagulantes"],
    criadoEm: "2024-04-22T16:45:00",
  },
  {
    id: 5,
    nome: "Patrícia Gomes",
    cpf: "56789012345",
    email: "patricia.gomes@email.com",
    telefone: "(81) 98888-5555",
    dataNascimento: "1998-09-09",
    endereco: "Rua Setúbal, 300 - Boa Viagem, Recife - PE",
    alergias: ["Anestésico tópico"],
    contraindicacoes: [],
    criadoEm: "2024-05-30T10:00:00",
  },
];

export const mockHistorico: HistoricoProcedimento[] = [
  { id: 1, pacienteId: 1, procedimento: "Limpeza de Pele", profissional: "Nayane Pimentel", data: "2024-06-10T09:00:00", valor: 150, observacoes: "Pele oleosa, boa resposta ao tratamento.", status: "FINALIZADO" },
  { id: 2, pacienteId: 1, procedimento: "Botox", profissional: "Nayane Pimentel", data: "2024-08-15T10:30:00", valor: 450, observacoes: "Aplicação em terço superior, sem intercorrências.", status: "FINALIZADO" },
  { id: 3, pacienteId: 1, procedimento: "Peeling Químico", profissional: "Nayane Pimentel", data: "2024-11-02T09:00:00", valor: 250, observacoes: "Leve vermelhidão esperada, orientada sobre fotoproteção.", status: "FINALIZADO" },
  { id: 4, pacienteId: 2, procedimento: "Drenagem Linfática", profissional: "Nayane Pimentel", data: "2024-07-01T14:00:00", valor: 120, observacoes: "Sessão 1 de 10.", status: "FINALIZADO" },
  { id: 5, pacienteId: 2, procedimento: "Drenagem Linfática", profissional: "Nayane Pimentel", data: "2024-07-08T14:00:00", valor: 120, observacoes: "Sessão 2 de 10.", status: "FINALIZADO" },
  { id: 6, pacienteId: 3, procedimento: "Harmonização Facial", profissional: "Nayane Pimentel", data: "2024-09-20T11:00:00", valor: 1200, observacoes: "Preenchimento de sulco nasogeniano.", status: "FINALIZADO" },
  { id: 7, pacienteId: 3, procedimento: "Botox", profissional: "Nayane Pimentel", data: "2024-12-01T10:00:00", valor: 450, observacoes: "Manutenção, aplicação em glabela.", status: "FINALIZADO" },
  { id: 8, pacienteId: 4, procedimento: "Limpeza de Pele", profissional: "Nayane Pimentel", data: "2024-10-05T09:30:00", valor: 150, observacoes: "Pele mista, extração de comedões.", status: "FINALIZADO" },
  { id: 9, pacienteId: 4, procedimento: "Preenchimento Facial", profissional: "Nayane Pimentel", data: "2025-01-14T15:00:00", valor: 800, observacoes: "Cancelado a pedido da paciente.", status: "CANCELADO" },
  { id: 10, pacienteId: 5, procedimento: "Peeling Químico", profissional: "Nayane Pimentel", data: "2025-02-20T09:00:00", valor: 250, observacoes: "Primeira sessão, pele sensível.", status: "FINALIZADO" },
];

export const mockEvolucoes: Evolucao[] = [
  { id: 1, pacienteId: 1, autor: "Nayane Pimentel", data: "2024-06-10T09:30:00", texto: "Paciente relatou melhora na oleosidade após 1ª sessão de limpeza de pele. Orientada sobre skincare diário.", procedimentoRelacionadoId: 1 },
  { id: 2, pacienteId: 1, autor: "Nayane Pimentel", data: "2024-08-15T11:00:00", texto: "Aplicação de botox sem intercorrências. Retorno agendado para avaliação em 15 dias.", procedimentoRelacionadoId: 2 },
  { id: 3, pacienteId: 1, autor: "Nayane Pimentel", data: "2024-11-02T09:30:00", texto: "Peeling bem tolerado. Reforçada importância do protetor solar nos próximos 7 dias.", procedimentoRelacionadoId: 3 },
  { id: 4, pacienteId: 2, autor: "Nayane Pimentel", data: "2024-07-08T14:30:00", texto: "Boa evolução no protocolo de drenagem, redução perceptível de edema nos membros inferiores.", procedimentoRelacionadoId: 5 },
  { id: 5, pacienteId: 3, autor: "Nayane Pimentel", data: "2024-09-20T11:30:00", texto: "Harmonização facial concluída com bom resultado estético. Paciente satisfeita.", procedimentoRelacionadoId: 6 },
  { id: 6, pacienteId: 5, autor: "Nayane Pimentel", data: "2025-02-20T09:30:00", texto: "Paciente com pele sensível, optado por concentração mais branda de ácido. Reagendar em 30 dias.", procedimentoRelacionadoId: 10 },
];

export const mockAnexos: Anexo[] = [
  { id: 1, pacienteId: 1, nome: "Foto antes - Botox.jpg", tipo: "IMAGEM", url: "#", criadoEm: "2024-08-15T10:00:00" },
  { id: 2, pacienteId: 1, nome: "Foto depois - Botox.jpg", tipo: "IMAGEM", url: "#", criadoEm: "2024-08-29T10:00:00" },
  { id: 3, pacienteId: 1, nome: "Termo de consentimento.pdf", tipo: "DOCUMENTO", url: "#", criadoEm: "2024-08-15T09:45:00" },
  { id: 4, pacienteId: 3, nome: "Exame dermatológico.pdf", tipo: "EXAME", url: "#", criadoEm: "2024-09-18T08:00:00" },
];
