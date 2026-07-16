// ============================================================
// MOCK DATA - Substitua as chamadas aqui pela API Java real
// Para usar a API real: troque USE_MOCK para false em apiWrapper.ts
// ============================================================

export const MOCK_USERS = [
  { id: 1, username: "admin", password: "admin123", role: "ADMIN", pessoa: { nome: "Nayane Pimentel", email: "admin@clinica.com", telefone: "(81) 99999-0001" } },
  { id: 2, username: "recepcao", password: "123456", role: "RECEPCAO", pessoa: { nome: "Ana Lima", email: "recepcao@clinica.com", telefone: "(81) 99999-0002" } },
  { id: 3, username: "financeiro", password: "123456", role: "FINANCEIRO", pessoa: { nome: "Carlos Mendes", email: "financeiro@clinica.com", telefone: "(81) 99999-0003" } },
  { id: 4, username: "prof1", password: "123456", role: "PROFISSIONAL", id_profissional: 1, pessoa: { nome: "Dra. Fernanda Costa", email: "fernanda@clinica.com", telefone: "(81) 99999-0004" } },
  { id: 5, username: "cliente1", password: "123456", role: "USER", pessoa: { nome: "Juliana Souza", email: "juliana@email.com", telefone: "(81) 98888-1234" } },
];

export const MOCK_CLIENTES = [
  { id: 1, nome: "Juliana Souza", email: "juliana@email.com", telefone: "(81) 98888-1234", cpf: "123.456.789-00", dataNascimento: "1990-05-15", endereco: "Rua das Flores, 123 - Boa Vista, Recife", totalAtendimentos: 8, ultimaVisita: "2026-05-10" },
  { id: 2, nome: "Mariana Santos", email: "mariana@email.com", telefone: "(81) 97777-5678", cpf: "234.567.890-11", dataNascimento: "1988-11-23", endereco: "Av. Boa Viagem, 500 - Boa Viagem, Recife", totalAtendimentos: 12, ultimaVisita: "2026-05-20" },
  { id: 3, nome: "Camila Rodrigues", email: "camila@email.com", telefone: "(81) 96666-9012", cpf: "345.678.901-22", dataNascimento: "1995-03-08", endereco: "Rua do Sol, 44 - Aflitos, Recife", totalAtendimentos: 3, ultimaVisita: "2026-04-28" },
  { id: 4, nome: "Tatiane Ferreira", email: "tatiane@email.com", telefone: "(81) 95555-3456", cpf: "456.789.012-33", dataNascimento: "1992-07-19", endereco: "Rua Visconde, 89 - Derby, Recife", totalAtendimentos: 5, ultimaVisita: "2026-05-15" },
  { id: 5, nome: "Patricia Alves", email: "patricia@email.com", telefone: "(81) 94444-7890", cpf: "567.890.123-44", dataNascimento: "1985-12-30", endereco: "Av. Norte, 201 - Casa Amarela, Recife", totalAtendimentos: 20, ultimaVisita: "2026-05-22" },
  { id: 6, nome: "Gabriela Lima", email: "gabriela@email.com", telefone: "(81) 93333-2345", cpf: "678.901.234-55", dataNascimento: "1998-08-14", endereco: "Rua Nova, 77 - Madalena, Recife", totalAtendimentos: 1, ultimaVisita: "2026-05-25" },
  { id: 7, nome: "Roberta Mendes", email: "roberta@email.com", telefone: "(81) 92222-6789", cpf: "789.012.345-66", dataNascimento: "1987-02-27", endereco: "Rua Antiga, 33 - Graças, Recife", totalAtendimentos: 7, ultimaVisita: "2026-05-08" },
  { id: 8, nome: "Fernanda Costa", email: "fernanda@email.com", telefone: "(81) 91111-0123", cpf: "890.123.456-77", dataNascimento: "1993-09-05", endereco: "Av. Caxangá, 150 - Torre, Recife", totalAtendimentos: 15, ultimaVisita: "2026-05-18" },
];

export const MOCK_PROCEDIMENTOS = [
  { id: 1, nome: "Limpeza de Pele", descricao: "Remoção de impurezas e renovação celular profunda", duracao: 60, valor: 150.00, ativo: true, categoria: "Facial" },
  { id: 2, nome: "Botox", descricao: "Suavização de linhas de expressão com toxina botulínica", duracao: 30, valor: 450.00, ativo: true, categoria: "Injetável" },
  { id: 3, nome: "Preenchimento Facial", descricao: "Restauração de volume e contorno facial com ácido hialurônico", duracao: 45, valor: 800.00, ativo: true, categoria: "Injetável" },
  { id: 4, nome: "Drenagem Linfática", descricao: "Redução de inchaço e retenção hídrica", duracao: 50, valor: 120.00, ativo: true, categoria: "Corporal" },
  { id: 5, nome: "Harmonização Facial", descricao: "Equilíbrio e proporção dos traços faciais", duracao: 90, valor: 1200.00, ativo: true, categoria: "Facial" },
  { id: 6, nome: "Peeling Químico", descricao: "Renovação celular intensa e uniformização do tom da pele", duracao: 40, valor: 250.00, ativo: true, categoria: "Facial" },
  { id: 7, nome: "Massagem Relaxante", descricao: "Alívio de tensões musculares e estresse", duracao: 60, valor: 100.00, ativo: true, categoria: "Corporal" },
  { id: 8, nome: "Depilação a Laser", descricao: "Remoção definitiva de pelos com laser de diodo", duracao: 30, valor: 300.00, ativo: true, categoria: "Depilação" },
  { id: 9, nome: "Microagulhamento", descricao: "Estimulação do colágeno e rejuvenescimento", duracao: 60, valor: 350.00, ativo: false, categoria: "Facial" },
  { id: 10, nome: "Radiofrequência", descricao: "Firmeza e elasticidade da pele por calor controlado", duracao: 45, valor: 200.00, ativo: true, categoria: "Corporal" },
];

export const MOCK_PROFISSIONAIS = [
  { id: 1, nome: "Dra. Fernanda Costa", especialidade: "Estética Facial", coren: "PE 488.389", telefone: "(81) 99999-0004", email: "fernanda@clinica.com", ativo: true },
  { id: 2, nome: "Dra. Amanda Silveira", especialidade: "Corporal e Drenagem", coren: "PE 521.100", telefone: "(81) 99999-0005", email: "amanda@clinica.com", ativo: true },
  { id: 3, nome: "Dra. Larissa Moura", especialidade: "Injetáveis", coren: "PE 493.210", telefone: "(81) 99999-0006", email: "larissa@clinica.com", ativo: true },
];

const hoje = new Date().toISOString().split("T")[0];

export const MOCK_AGENDAMENTOS_HOJE = [
  { id: 101, hrAgendamento: "08:00", procedimento: "Limpeza de Pele", valorProcedimento: 150, status: "FINALIZADO", nomeCliente: "Juliana Souza", telefoneCliente: "(81) 98888-1234", emailCliente: "juliana@email.com", nomeProfissional: "Dra. Fernanda Costa" },
  { id: 102, hrAgendamento: "09:00", procedimento: "Botox", valorProcedimento: 450, status: "FINALIZADO", nomeCliente: "Mariana Santos", telefoneCliente: "(81) 97777-5678", emailCliente: "mariana@email.com", nomeProfissional: "Dra. Larissa Moura" },
  { id: 103, hrAgendamento: "10:00", procedimento: "Drenagem Linfática", valorProcedimento: 120, status: "EM_ANDAMENTO", nomeCliente: "Camila Rodrigues", telefoneCliente: "(81) 96666-9012", emailCliente: "camila@email.com", nomeProfissional: "Dra. Amanda Silveira" },
  { id: 104, hrAgendamento: "11:00", procedimento: "Peeling Químico", valorProcedimento: 250, status: "AGENDADO", nomeCliente: "Tatiane Ferreira", telefoneCliente: "(81) 95555-3456", emailCliente: "tatiane@email.com", nomeProfissional: "Dra. Fernanda Costa" },
  { id: 105, hrAgendamento: "14:00", procedimento: "Harmonização Facial", valorProcedimento: 1200, status: "AGENDADO", nomeCliente: "Patricia Alves", telefoneCliente: "(81) 94444-7890", emailCliente: "patricia@email.com", nomeProfissional: "Dra. Larissa Moura" },
  { id: 106, hrAgendamento: "15:00", procedimento: null, valorProcedimento: 0, status: "DISPONIVEL", nomeCliente: null, telefoneCliente: null, emailCliente: null, nomeProfissional: null },
  { id: 107, hrAgendamento: "16:00", procedimento: "Massagem Relaxante", valorProcedimento: 100, status: "AGENDADO", nomeCliente: "Gabriela Lima", telefoneCliente: "(81) 93333-2345", emailCliente: "gabriela@email.com", nomeProfissional: "Dra. Amanda Silveira" },
];

export const MOCK_AGENDA_HOJE = {
  id: 1,
  dtAgenda: hoje,
  totalVagas: 8,
  atendidos: 2,
  vagasDisponiveis: 3,
  vagasOcupadas: 5,
  itensAgenda: MOCK_AGENDAMENTOS_HOJE,
};

export const MOCK_DASHBOARD_STATS = {
  totalClientes: 8,
  agendamentosDia: 7,
  totalAgendamentosSemana: 28,
  faturamentoMes: 12450.00,
  faturamentoDia: 2120.00,
  ocupacao: 78,
  qtdProofissionais: 3,
  qtdRecepcionistas: 1,
};

export const MOCK_FINANCEIRO_STATS = {
  faturamentoDia: 2120.00,
  faturamentoMes: 12450.00,
  faturamentoAno: 98300.00,
  receitasPrevistas: 14000.00,
  despesasPrevistas: 3500.00,
  lucroEstimado: 10500.00,
  ticketMedio: 285.00,
  taxaOcupacao: 78,
  inadimplencia: 2.3,
};

export const MOCK_TRANSACOES: Array<{id: number; data: string; cliente: string; procedimento: string; valor: number; status: "PAGO"|"PENDENTE"|"CANCELADO"; tipo: "RECEITA"|"DESPESA"; formaPagamento: string}> = [
  { id: 1, data: "2026-05-26", cliente: "Juliana Souza", procedimento: "Limpeza de Pele", valor: 150, status: "PAGO", tipo: "RECEITA", formaPagamento: "Cartão de Crédito" },
  { id: 2, data: "2026-05-26", cliente: "Mariana Santos", procedimento: "Botox", valor: 450, status: "PAGO", tipo: "RECEITA", formaPagamento: "Pix" },
  { id: 3, data: "2026-05-25", cliente: "Patricia Alves", procedimento: "Harmonização Facial", valor: 1200, status: "PAGO", tipo: "RECEITA", formaPagamento: "Cartão de Débito" },
  { id: 4, data: "2026-05-25", cliente: "Tatiane Ferreira", procedimento: "Peeling Químico", valor: 250, status: "PENDENTE", tipo: "RECEITA", formaPagamento: "Dinheiro" },
  { id: 5, data: "2026-05-24", cliente: "Roberta Mendes", procedimento: "Drenagem Linfática", valor: 120, status: "PAGO", tipo: "RECEITA", formaPagamento: "Pix" },
  { id: 6, data: "2026-05-24", cliente: "Gabriela Lima", procedimento: "Limpeza de Pele", valor: 150, status: "CANCELADO", tipo: "RECEITA", formaPagamento: "Cartão de Crédito" },
  { id: 7, data: "2026-05-23", cliente: "Camila Rodrigues", procedimento: "Drenagem Linfática", valor: 120, status: "PAGO", tipo: "RECEITA", formaPagamento: "Pix" },
  { id: 8, data: "2026-05-22", cliente: "Fernanda Costa", procedimento: "Botox", valor: 450, status: "PAGO", tipo: "RECEITA", formaPagamento: "Cartão de Crédito" },
];

export const MOCK_USUARIOS = [
  { id: 1, username: "admin", role: "ADMIN", ativo: true, pessoa: { nome: "Nayane Pimentel", email: "admin@clinica.com", telefone: "(81) 99999-0001" } },
  { id: 2, username: "recepcao", role: "RECEPCAO", ativo: true, pessoa: { nome: "Ana Lima", email: "recepcao@clinica.com", telefone: "(81) 99999-0002" } },
  { id: 3, username: "financeiro", role: "FINANCEIRO", ativo: true, pessoa: { nome: "Carlos Mendes", email: "financeiro@clinica.com", telefone: "(81) 99999-0003" } },
  { id: 4, username: "prof1", role: "PROFISSIONAL", ativo: true, pessoa: { nome: "Dra. Fernanda Costa", email: "fernanda@clinica.com", telefone: "(81) 99999-0004" } },
  { id: 5, username: "prof2", role: "PROFISSIONAL", ativo: true, pessoa: { nome: "Dra. Amanda Silveira", email: "amanda@clinica.com", telefone: "(81) 99999-0005" } },
  { id: 6, username: "prof3", role: "PROFISSIONAL", ativo: false, pessoa: { nome: "Dra. Larissa Moura", email: "larissa@clinica.com", telefone: "(81) 99999-0006" } },
];

// Simula delay de rede (ms)
export const mockDelay = (ms = 400) => new Promise(res => setTimeout(res, ms));
