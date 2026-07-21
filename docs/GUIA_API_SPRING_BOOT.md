# Guia completo — API Spring Boot da Clínica Nayane Pimentel

Este documento inventaria **todas** as chamadas de API que o frontend já faz (ou está pronto
para fazer) hoje, módulo por módulo, com o DDL de todas as tabelas necessárias e o esqueleto
Java (entidade → repository → service → controller) para cada uma. O objetivo é você conseguir
implementar o backend Spring Boot copiando e ajustando, sem precisar reler o frontend.

> Para o módulo de **Prontuário** especificamente, existe um guia dedicado e mais detalhado em
> [`docs/GUIA_API_SPRING_BOOT_PRONTUARIO.md`](./GUIA_API_SPRING_BOOT_PRONTUARIO.md). Este arquivo
> traz um resumo dele na seção 10 e o DDL das tabelas está incluído no script único da seção 2,
> para que você tenha o banco completo em um único lugar.

## Como o frontend está organizado hoje

- `src/services/api.ts` — instância axios autenticada (`Authorization: Bearer <token>`), aponta para `http://localhost:8081`.
- `src/services/apiPublic.tsx` — instância axios pública (sem token), usada só na tela pública de agendamento.
- `src/services/apiWrapper.ts` — **é aqui que mora o mock atual**. Toda função tem um `if (USE_MOCK) { ...retorna mock... }` e, logo abaixo, comentada ou já escrita, a chamada real via `api.*`. Quando o backend estiver pronto, o processo é: implementar o endpoint no Spring, testar, e então mudar `export const USE_MOCK = true` para `false` no topo do arquivo — **uma linha só, para o sistema inteiro**. Não é necessário (e não devem ser) alterados os componentes de tela.
- `src/services/mockData.ts` — os dados mock em si (usuários de teste, clientes, procedimentos, agenda, financeiro, usuários do sistema).
- `src/services/prontuarioService.ts` — módulo à parte (prontuário/pacientes), com o mesmo espírito, mas cada função comenta a chamada real acima do bloco mock, função a função.
- Duas telas **não passam pelo `apiWrapper`** e chamam `api`/`apiPublic` diretamente, hoje contra o backend real (ou seja, hoje mesmo já quebram se o Spring não estiver no ar): `src/app/dashboard/agenda/gerar/page.tsx` e a página pública `src/app/agendamento/page.tsx`. Trate os endpoints que elas usam com a mesma prioridade dos demais.

## Convenções gerais do backend

- Autenticação: JWT via `Authorization: Bearer <token>`, obtido em `POST /auth/login`.
- Roles: `ADMIN`, `RECEPCAO`, `FINANCEIRO`, `PROFISSIONAL`, `USER` (cliente final).
- Erros: HTTP padrão — `401` token ausente/inválido, `403` sem permissão, `404` não encontrado, `400` validação. O frontend já trata `401`/`403` globalmente em `api.ts` (limpa o token e redireciona para `/login`).
- Datas: `LocalDate` (`yyyy-MM-dd`) para dia da agenda / nascimento, `LocalDateTime` (ISO) para timestamps.
- Valores monetários: `BigDecimal`.

---

## 1. Índice de endpoints por módulo

| Módulo | Método | Rota | Usado em |
|---|---|---|---|
| Auth | POST | `/auth/login` | `apiWrapper.authLogin` |
| Auth | GET | `/auth/me` | `apiWrapper.authMe` |
| Dashboard | GET | `/dashboard/stats` | `apiWrapper.fetchDashboardStats` (admin) |
| Agenda | GET | `/agendas/AgendaHoje` | `apiWrapper.fetchAgendaHoje` / `fetchAgendamentosHoje` (recepção, profissional) |
| Agenda | GET | `/agendas/ListAll` | `dashboard/agenda/page.tsx` |
| Agenda | GET | `/agendas/{id}` | `dashboard/agenda/[id]/page.tsx` |
| Agenda | GET | `/agendas/AgendasMes` | `agendamento/page.tsx` (público) |
| Agenda | POST | `/agendas/gerar` | `dashboard/agenda/gerar/page.tsx` |
| Agenda | POST | `/agendas/agendar-slot` | `apiWrapper.agendarSlotAgenda` (interno) |
| Agenda | PUT | `/agendas/cancelar-slot/{itAgendaId}` | `apiWrapper.cancelarSlotAgenda` |
| Agenda (público) | POST | `/agendas/agendar` | `agendamento/page.tsx` |
| Atendimento | PUT | `/atendimento/iniciar-atendimento/{id}` | `apiWrapper.iniciarAtendimento`, `AtendimentoDetalhes.tsx` |
| Atendimento | PUT | `/atendimento/finalizar-atendimento/{id}` | `apiWrapper.finalizarAtendimento`, `AtendimentoDetalhes.tsx` |
| Atendimento | PUT | `/atendimento/cancelar/{id}` | `apiWrapper.cancelarAgendamento` |
| Pessoa (público) | GET | `/pessoa/cpf/{cpf}` | `agendamento/page.tsx` |
| Pessoa (público) | POST | `/pessoa` | `agendamento/page.tsx` |
| Clientes (admin) | GET | `/clientes` | `apiWrapper.fetchClientes` |
| Clientes (admin) | GET | `/clientes/cpf/{cpf}` | `apiWrapper.fetchClienteByCpf` |
| Clientes (admin) | POST | `/clientes` | `apiWrapper.criarCliente` |
| Clientes (admin) | PUT | `/clientes/{id}` | `apiWrapper.atualizarCliente` |
| Cliente (área logada) | GET | `/agendamentos/cliente/{id}` | ⚠️ ver nota abaixo — hoje 100% mock local |
| Procedimentos | GET | `/procedimentos` | `apiWrapper.fetchProcedimentos` |
| Procedimentos | POST | `/procedimentos` | `apiWrapper.criarProcedimento` |
| Procedimentos | PUT | `/procedimentos/{id}` | `apiWrapper.atualizarProcedimento` |
| Profissionais | GET | `/profissionais` | `apiWrapper.fetchProfissionais` |
| Financeiro | GET | `/financeiro/dashboard?periodo=` | `apiWrapper.fetchFinanceiroStats` |
| Usuários | GET | `/usuarios` | `apiWrapper.fetchUsuarios` |
| Usuários | POST | `/usuarios` | `apiWrapper.criarUsuario` |
| Usuários | PATCH | `/usuarios/{id}/toggle-ativo` | `apiWrapper.toggleUsuarioAtivo` |
| Prontuário | GET/POST | `/pacientes/**` | ver seção 10 e o guia dedicado |

> ⚠️ **Nota — `/clientes` vs `/pessoa`**: o frontend hoje tem duas rotas para basicamente o
> mesmo conceito — a tela pública de agendamento usa `/pessoa` (cadastro rápido por CPF) e a
> tela admin de gestão usa `/clientes` (CRUD completo). No backend, o mais simples é ter **uma
> única tabela/entidade `pessoa`** e expor os dois conjuntos de rotas sobre ela (`/pessoa/**`
> para o fluxo público, `/clientes/**` como alias administrativo que devolve os mesmos
> registros com campos extras como `totalAtendimentos`/`ultimaVisita`, calculados). Não crie
> duas tabelas separadas.
>
> ⚠️ **Nota — dashboard do cliente logado**: `src/app/dashboard/cliente/page.tsx` hoje importa
> `MOCK_AGT_CLIENTE` diretamente (dados fixos no componente), **sem passar pelo `apiWrapper`**.
> Quando for implementar, crie `GET /agendamentos/cliente/{id}` (retornando os mesmos campos de
> `ItemAgenda` filtrados pelo cliente) e adicione uma função `fetchAgendamentosCliente` no
> `apiWrapper.ts` — aí sim ligue o componente a ela. Isso não vai "acontecer sozinho" ao virar
> `USE_MOCK = false`, precisa desse passo extra.

---

## 2. DDL completo (todas as tabelas do projeto)

```sql
-- ── PESSOA (clientes / pacientes / base de profissionais e usuários) ──────────
CREATE TABLE pessoa (
    id                BIGSERIAL PRIMARY KEY,
    nome              VARCHAR(150) NOT NULL,
    cpf               VARCHAR(11) NOT NULL UNIQUE,
    email             VARCHAR(150),
    telefone          VARCHAR(20),
    data_nascimento   DATE,
    endereco          VARCHAR(300),
    criado_em         TIMESTAMP NOT NULL DEFAULT now()
);

-- ── USUARIO (login do sistema) ─────────────────────────────────────────────
CREATE TABLE usuario (
    id            BIGSERIAL PRIMARY KEY,
    pessoa_id     BIGINT NOT NULL REFERENCES pessoa(id),
    username      VARCHAR(50) NOT NULL UNIQUE,
    senha_hash    VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL, -- ADMIN, RECEPCAO, FINANCEIRO, PROFISSIONAL, USER
    ativo         BOOLEAN NOT NULL DEFAULT true,
    criado_em     TIMESTAMP NOT NULL DEFAULT now()
);

-- ── PROFISSIONAL (dados extras de quem atende, ligado a um usuário) ───────
CREATE TABLE profissional (
    id             BIGSERIAL PRIMARY KEY,
    usuario_id     BIGINT NOT NULL UNIQUE REFERENCES usuario(id),
    especialidade  VARCHAR(150),
    coren          VARCHAR(30),
    ativo          BOOLEAN NOT NULL DEFAULT true
);

-- ── PROCEDIMENTO (catálogo de tratamentos) ─────────────────────────────────
CREATE TABLE procedimento (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(150) NOT NULL,
    descricao   VARCHAR(500),
    duracao     INT NOT NULL,           -- minutos
    valor       NUMERIC(10,2) NOT NULL,
    categoria   VARCHAR(30) NOT NULL,   -- Facial, Corporal, Injetável, Depilação, Outros
    ativo       BOOLEAN NOT NULL DEFAULT true
);

-- ── AGENDA (um dia de atendimento) e ITEM_AGENDA (cada horário/slot) ───────
CREATE TABLE agenda (
    id           BIGSERIAL PRIMARY KEY,
    dt_agenda    DATE NOT NULL UNIQUE,
    total_vagas  INT NOT NULL DEFAULT 0
);

CREATE TABLE item_agenda (
    id                   BIGSERIAL PRIMARY KEY,
    agenda_id            BIGINT NOT NULL REFERENCES agenda(id),
    hr_agendamento       TIME NOT NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'DISPONIVEL',
                         -- DISPONIVEL, AGENDADO, EM_ANDAMENTO, FINALIZADO, CANCELADO
    cliente_id           BIGINT REFERENCES pessoa(id),
    profissional_id      BIGINT REFERENCES profissional(id),
    procedimento_id      BIGINT REFERENCES procedimento(id),
    valor_procedimento   NUMERIC(10,2),
    observacoes          VARCHAR(2000),
    dt_hora_inicio        TIMESTAMP,
    dt_hora_fim           TIMESTAMP,
    UNIQUE (agenda_id, hr_agendamento)
);

-- ── FINANCEIRO (transações — receitas e despesas) ─────────────────────────
CREATE TABLE transacao (
    id                BIGSERIAL PRIMARY KEY,
    data              DATE NOT NULL,
    item_agenda_id    BIGINT REFERENCES item_agenda(id), -- null quando for despesa avulsa
    cliente_id        BIGINT REFERENCES pessoa(id),
    descricao         VARCHAR(255),           -- nome do procedimento ou da despesa
    valor             NUMERIC(10,2) NOT NULL,
    tipo              VARCHAR(10) NOT NULL,   -- RECEITA, DESPESA
    status            VARCHAR(15) NOT NULL,   -- PAGO, PENDENTE, CANCELADO
    forma_pagamento   VARCHAR(30)
);

-- ── PRONTUÁRIO (ver também docs/GUIA_API_SPRING_BOOT_PRONTUARIO.md) ───────
CREATE TABLE pessoa_alergia (
    pessoa_id   BIGINT NOT NULL REFERENCES pessoa(id),
    descricao   VARCHAR(255) NOT NULL
);

CREATE TABLE pessoa_contraindicacao (
    pessoa_id   BIGINT NOT NULL REFERENCES pessoa(id),
    descricao   VARCHAR(255) NOT NULL
);

CREATE TABLE historico_procedimento (
    id                BIGSERIAL PRIMARY KEY,
    paciente_id       BIGINT NOT NULL REFERENCES pessoa(id),
    profissional_id   BIGINT REFERENCES profissional(id),
    procedimento      VARCHAR(255) NOT NULL,
    data              TIMESTAMP NOT NULL,
    valor             NUMERIC(10,2) NOT NULL DEFAULT 0,
    observacoes       VARCHAR(2000),
    status            VARCHAR(20) NOT NULL DEFAULT 'FINALIZADO' -- FINALIZADO, CANCELADO
);

CREATE TABLE evolucao (
    id                            BIGSERIAL PRIMARY KEY,
    paciente_id                   BIGINT NOT NULL REFERENCES pessoa(id),
    autor_id                      BIGINT NOT NULL REFERENCES usuario(id),
    data                          TIMESTAMP NOT NULL,
    texto                         VARCHAR(4000) NOT NULL,
    historico_procedimento_id     BIGINT REFERENCES historico_procedimento(id)
);

CREATE TABLE anexo (
    id           BIGSERIAL PRIMARY KEY,
    paciente_id  BIGINT NOT NULL REFERENCES pessoa(id),
    nome         VARCHAR(255) NOT NULL,
    tipo         VARCHAR(20) NOT NULL, -- IMAGEM, DOCUMENTO, EXAME
    url          VARCHAR(500) NOT NULL,
    criado_em    TIMESTAMP NOT NULL DEFAULT now()
);
```

Índices recomendados (consultas mais frequentes são por data de agenda e por CPF):

```sql
CREATE INDEX idx_item_agenda_agenda ON item_agenda(agenda_id);
CREATE INDEX idx_pessoa_cpf ON pessoa(cpf);
CREATE INDEX idx_transacao_data ON transacao(data);
CREATE INDEX idx_historico_paciente ON historico_procedimento(paciente_id);
CREATE INDEX idx_evolucao_paciente ON evolucao(paciente_id);
```

---

## 3. Auth (`/auth/login`, `/auth/me`)

```java
public record LoginRequest(@NotBlank String username, @NotBlank String password) {}
public record LoginResponse(String token) {}

public record PessoaResumo(String nome, String email, String telefone) {}
public record UsuarioLogadoResponse(Long id, String username, String role, PessoaResumo pessoa) {}
```

```java
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        Usuario usuario = usuarioRepository.findByUsername(req.username())
            .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));
        return new LoginResponse(jwtService.gerarToken(usuario));
    }

    @GetMapping("/me")
    public UsuarioLogadoResponse me(@AuthenticationPrincipal Usuario usuario) {
        return new UsuarioLogadoResponse(
            usuario.getId(), usuario.getUsername(), usuario.getRole(),
            new PessoaResumo(usuario.getPessoa().getNome(), usuario.getPessoa().getEmail(), usuario.getPessoa().getTelefone())
        );
    }
}
```

`senha_hash` deve ser gravado com `BCryptPasswordEncoder`. O front só usa `token` de `login` e o
objeto de `me` (`id`, `username`, `role`, `pessoa.{nome,email,telefone}`) — não adicione campos
obrigatórios além desses sem checar onde quebraria (`Header.tsx`, `Sidebar.tsx`, `AuthContext.tsx`
usam exatamente esse formato).

---

## 4. Pessoa / Clientes

```java
public record PessoaRequest(
    @NotBlank String nome, @NotBlank @CPF String cpf, @Email String email,
    String telefone, LocalDate dataNascimento, String endereco
) {}

public record ClienteResponse(
    Long id, String nome, String email, String telefone, String cpf,
    LocalDate dataNascimento, String endereco,
    Integer totalAtendimentos, LocalDate ultimaVisita
) {}
```

```java
@RestController
@RequiredArgsConstructor
public class PessoaController {

    private final PessoaService service;

    // fluxo público de agendamento
    @GetMapping("/pessoa/cpf/{cpf}")
    public ClienteResponse buscarPorCpf(@PathVariable String cpf) {
        return service.buscarPorCpfOuFalhar(cpf); // 404 se não encontrado
    }

    @PostMapping("/pessoa")
    public ClienteResponse cadastrar(@Valid @RequestBody PessoaRequest req) {
        return service.criar(req);
    }

    // gestão administrativa (mesma tabela, rota diferente)
    @GetMapping("/clientes")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPCAO')")
    public List<ClienteResponse> listar() { return service.listarTodos(); }

    @GetMapping("/clientes/cpf/{cpf}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPCAO')")
    public ClienteResponse buscarAdmin(@PathVariable String cpf) { return service.buscarPorCpfOuFalhar(cpf); }

    @PostMapping("/clientes")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPCAO')")
    public ClienteResponse criar(@Valid @RequestBody PessoaRequest req) { return service.criar(req); }

    @PutMapping("/clientes/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPCAO')")
    public ClienteResponse atualizar(@PathVariable Long id, @Valid @RequestBody PessoaRequest req) {
        return service.atualizar(id, req);
    }
}
```

`totalAtendimentos` e `ultimaVisita` (usados só na tela `/dashboard/clientes`) são calculados,
não gravados — no service, agregue de `item_agenda`/`historico_procedimento`:

```java
Integer totalAtendimentos = itemAgendaRepository.countByClienteIdAndStatus(pessoa.getId(), "FINALIZADO");
LocalDate ultimaVisita = itemAgendaRepository.findUltimaVisita(pessoa.getId()); // MAX(agenda.dtAgenda)
```

---

## 5. Procedimentos

```java
public record ProcedimentoRequest(
    @NotBlank String nome, String descricao, @Min(5) int duracao,
    @NotNull BigDecimal valor, @NotBlank String categoria, boolean ativo
) {}
public record ProcedimentoResponse(Long id, String nome, String descricao, int duracao, BigDecimal valor, String categoria, boolean ativo) {}
```

```java
@RestController
@RequestMapping("/procedimentos")
@RequiredArgsConstructor
public class ProcedimentoController {

    private final ProcedimentoRepository repository;

    @GetMapping
    public List<ProcedimentoResponse> listar() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ProcedimentoResponse criar(@Valid @RequestBody ProcedimentoRequest req) {
        return toResponse(repository.save(toEntity(req, new Procedimento())));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProcedimentoResponse atualizar(@PathVariable Long id, @Valid @RequestBody ProcedimentoRequest req) {
        Procedimento p = repository.findById(id).orElseThrow(() -> new EntityNotFoundException());
        return toResponse(repository.save(toEntity(req, p)));
    }

    // toEntity/toResponse: mapeamento direto campo a campo
}
```

O toggle de ativo/inativo na tela de procedimentos hoje é feito reenviando o objeto inteiro via
`PUT /procedimentos/{id}` com `ativo` invertido (não existe uma rota de toggle dedicada, ao
contrário de usuários) — implemente o `PUT` de forma idempotente para isso funcionar direto.

---

## 6. Profissionais

Somente leitura no frontend hoje (usado para preencher combos/atribuição de atendimento).

```java
public record ProfissionalResponse(Long id, String nome, String especialidade, String coren, String telefone, String email, boolean ativo) {}

@RestController
@RequestMapping("/profissionais")
@RequiredArgsConstructor
public class ProfissionalController {

    private final ProfissionalRepository repository;

    @GetMapping
    public List<ProfissionalResponse> listar() {
        return repository.findAll().stream()
            .map(p -> new ProfissionalResponse(
                p.getId(), p.getUsuario().getPessoa().getNome(), p.getEspecialidade(), p.getCoren(),
                p.getUsuario().getPessoa().getTelefone(), p.getUsuario().getPessoa().getEmail(), p.isAtivo()))
            .toList();
    }
}
```

---

## 7. Usuários do sistema

```java
public record UsuarioRequest(
    @NotBlank String nome, @Email String email, String telefone,
    @NotBlank String username, @NotBlank String password, @NotBlank String role
) {}
public record UsuarioResponse(Long id, String username, String role, boolean ativo, PessoaResumo pessoa) {}
```

```java
@RestController
@RequestMapping("/usuarios")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService service;

    @GetMapping
    public List<UsuarioResponse> listar() { return service.listar(); }

    @PostMapping
    public UsuarioResponse criar(@Valid @RequestBody UsuarioRequest req) { return service.criar(req); }

    @PatchMapping("/{id}/toggle-ativo")
    public void toggleAtivo(@PathVariable Long id) { service.toggleAtivo(id); }
}
```

`UsuarioService.criar` deve: criar/reaproveitar a `Pessoa` (nome/email/telefone), criar o
`Usuario` com `senha_hash = passwordEncoder.encode(password)`, e se `role == "PROFISSIONAL"`
criar também o registro em `profissional`.

---

## 8. Agenda e Atendimento

Este é o módulo com mais rotas porque a tela pública (`/agendamento`) e o dashboard interno
usam caminhos ligeiramente diferentes para o mesmo conceito de "reservar um horário". Documento
os dois exatamente como estão implementados hoje no front — decida no backend se quer unificá-los
por trás de um único service (recomendado) mesmo mantendo as duas rotas.

```java
public record ItemAgendaResponse(
    Long id, String hrAgendamento, String procedimento, BigDecimal valorProcedimento,
    String status, String nomeCliente, String telefoneCliente, String emailCliente, String nomeProfissional
) {}

public record AgendaResponse(
    Long id, LocalDate dtAgenda, Integer totalVagas, Integer atendidos,
    Integer vagasDisponiveis, Integer vagasOcupadas, List<ItemAgendaResponse> itensAgenda
) {}

public record GerarAgendaRequest(
    @NotNull LocalDate dataInicial, @NotNull LocalDate dataFinal,
    @Min(1) int quantidadeVagas, @NotNull LocalTime horaInicial
) {}
```

```java
@RestController
@RequestMapping("/agendas")
@RequiredArgsConstructor
public class AgendaController {

    private final AgendaService service;

    @GetMapping("/AgendaHoje")
    public AgendaResponse agendaHoje() { return service.buscarPorData(LocalDate.now()); }

    @GetMapping("/AgendasMes")
    public List<AgendaResponse> agendasDoMes() { return service.listarMesAtual(); } // rota pública

    @GetMapping("/ListAll")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPCAO')")
    public List<AgendaResponse> listarTodas() { return service.listarTodas(); }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPCAO','PROFISSIONAL')")
    public AgendaResponse buscarPorId(@PathVariable Long id) { return service.buscarPorId(id); }

    @PostMapping("/gerar")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPCAO')")
    public String gerar(@Valid @RequestBody GerarAgendaRequest req) {
        service.gerarAgendas(req);
        return "Agendas geradas com sucesso!";
    }

    // ── Reserva de horário: rota pública usada em /agendamento ──
    public record AgendarPublicoRequest(
        Long itAgenda, Long agendaId, Long clienteId, String procedimento,
        BigDecimal valorProcedimento, Long profissionalId
    ) {}

    @PostMapping("/agendar")
    public void agendarPublico(@Valid @RequestBody AgendarPublicoRequest req) {
        service.reservarSlot(req.itAgenda(), req.clienteId(), req.procedimento(), req.valorProcedimento(), req.profissionalId());
    }

    // ── Reserva de horário: rota interna usada pelo dashboard ──
    public record AgendarSlotRequest(@NotNull Long itAgendaId, @NotNull Long clienteId, @NotNull Long procedimentoId) {}

    @PostMapping("/agendar-slot")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPCAO')")
    public void agendarSlot(@Valid @RequestBody AgendarSlotRequest req) {
        service.reservarSlotPorProcedimento(req.itAgendaId(), req.clienteId(), req.procedimentoId());
    }

    @PutMapping("/cancelar-slot/{itAgendaId}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPCAO')")
    public void cancelarSlot(@PathVariable Long itAgendaId) { service.cancelarSlot(itAgendaId); }
}
```

```java
@RestController
@RequestMapping("/atendimento")
@RequiredArgsConstructor
public class AtendimentoController {

    private final AgendaService service; // opera sobre item_agenda

    public record ObservacoesRequest(String observacoes) {}
    public record FinalizarRequest(String observacoes, LocalDateTime dataHoraFim) {}
    public record CancelarRequest(String motivo) {}

    @PutMapping("/iniciar-atendimento/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPCAO','PROFISSIONAL')")
    public void iniciar(@PathVariable Long id, @RequestBody(required = false) ObservacoesRequest req) {
        service.iniciarAtendimento(id, req != null ? req.observacoes() : null);
    }

    @PutMapping("/finalizar-atendimento/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPCAO','PROFISSIONAL')")
    public void finalizar(@PathVariable Long id, @RequestBody FinalizarRequest req) {
        service.finalizarAtendimento(id, req.observacoes(), req.dataHoraFim());
    }

    @PutMapping("/cancelar/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPCAO')")
    public void cancelar(@PathVariable Long id, @RequestBody CancelarRequest req) {
        service.cancelarAtendimento(id, req.motivo());
    }
}
```

`AgendaResponse.atendidos`/`vagasDisponiveis`/`vagasOcupadas` são contagens sobre
`item_agenda.status` daquela agenda (`FINALIZADO`, `DISPONIVEL`, o resto respectivamente) —
calcule no service, não grave como coluna redundante.

---

## 9. Financeiro e Dashboard (agregações)

Sem tabela própria — leem de `transacao` e `item_agenda`.

```java
public record FinanceiroStatsResponse(
    BigDecimal faturamentoDia, BigDecimal faturamentoMes, BigDecimal faturamentoAno,
    BigDecimal receitasPrevistas, BigDecimal despesasPrevistas, BigDecimal lucroEstimado,
    BigDecimal ticketMedio, Integer taxaOcupacao, BigDecimal inadimplencia
) {}
public record TransacaoResponse(Long id, LocalDate data, String cliente, String procedimento, BigDecimal valor, String status, String tipo, String formaPagamento) {}
public record FinanceiroDashboardResponse(FinanceiroStatsResponse stats, List<TransacaoResponse> transacoesRecentes) {}

@GetMapping("/financeiro/dashboard")
@PreAuthorize("hasAnyRole('ADMIN','FINANCEIRO')")
public FinanceiroDashboardResponse dashboard(@RequestParam(defaultValue = "mes") String periodo) {
    return financeiroService.montarDashboard(periodo); // periodo: "dia" | "mes" | "ano"
}
```

```java
public record DashboardStatsResponse(
    Integer totalClientes, Integer agendamentosDia, Integer totalAgendamentosSemana,
    BigDecimal faturamentoMes, BigDecimal faturamentoDia, Integer ocupacao,
    Integer qtdProofissionais, Integer qtdRecepcionistas
) {}

@GetMapping("/dashboard/stats")
@PreAuthorize("hasRole('ADMIN')")
public DashboardStatsResponse stats() { return dashboardService.montarStats(); }
```

(sim, o campo é `qtdProofissionais` com esse typo — é o nome exato que `admin/page.tsx` já
espera; mantenha assim para não ter que tocar no frontend.)

---

## 10. Prontuário (resumo — detalhes completos no guia dedicado)

Rotas: `GET /pacientes`, `GET /pacientes/{id}`, `GET /pacientes/{id}/historico`,
`GET /pacientes/{id}/evolucoes`, `POST /pacientes/{id}/evolucoes`, `GET /pacientes/{id}/anexos`.

Tabelas: `historico_procedimento`, `evolucao`, `anexo`, `pessoa_alergia`, `pessoa_contraindicacao`
(DDL já incluído na seção 2). Entidades, DTOs, repository/service/controller completos e o
checklist de troca do mock estão em
[`docs/GUIA_API_SPRING_BOOT_PRONTUARIO.md`](./GUIA_API_SPRING_BOOT_PRONTUARIO.md).

---

## 11. Segurança (Spring Security + JWT)

```java
@Configuration
@EnableMethodSecurity // habilita @PreAuthorize
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/login", "/pessoa/**", "/agendas/AgendasMes", "/agendas/agendar").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
}
```

`JwtAuthFilter` deve popular o `SecurityContext` com um principal que dá para resolver para a
entidade `Usuario` (para os `@AuthenticationPrincipal Usuario usuario` usados nos controllers
acima). Se preferir manter `UserDetails` genérico, troque por buscar o `Usuario` pelo
`username` da `Authentication` dentro de cada service.

---

## 12. Checklist final

- [ ] Rodar o DDL da seção 2 (na ordem em que está — respeita as FKs).
- [ ] Implementar módulo por módulo (seções 3 a 9), testando cada endpoint isoladamente (Postman/Insomnia) antes de religar o front.
- [ ] Ligar `/auth/login` e `/auth/me` primeiro — tudo mais depende do JWT funcionar.
- [ ] Quando um módulo estiver pronto e testado: em `src/services/apiWrapper.ts`, mude `USE_MOCK` de `true` para `false` **uma única vez** — isso já religa auth, dashboard, agenda, atendimento, clientes, procedimentos, profissionais, financeiro e usuários de uma vez, porque todos compartilham a mesma flag.
- [ ] Se quiser religar módulos aos poucos em vez de tudo de uma vez, dá para condicionar por função em vez da flag global — troque `if (USE_MOCK)` por `if (USE_MOCK && !prontoDashboard)` etc., mas o mais simples é só terminar o backend inteiro antes de virar a chave.
- [ ] Prontuário (`src/services/prontuarioService.ts`) é independente do `USE_MOCK` — cada função tem seu próprio comentário "API real" para descomentar quando pronta (ver seção 10 / guia dedicado).
- [ ] Implementar `GET /agendamentos/cliente/{id}` e ligar `dashboard/cliente/page.tsx` nele (hoje é mock local direto no componente, não passa pelo wrapper — ver nota na seção 1).
- [ ] `dashboard/agenda/gerar/page.tsx` já chama a API real diretamente (não é mock) — implemente `POST /agendas/gerar` cedo, ou essa tela quebra mesmo em desenvolvimento.
