# Guia rápido — API Spring Boot para o módulo de Prontuário

Este guia mostra como implementar, no seu backend Spring Boot, os endpoints que o
frontend já está preparado para consumir assim que existirem. O frontend hoje usa
dados mock em `src/mocks/prontuario.ts`, acessados através de
`src/services/prontuarioService.ts` — quando os endpoints abaixo existirem, a troca
é literalmente descomentar uma linha por função (ver seção final).

Segue as convenções que já aparecem no seu backend atual (a julgar pelo que o
frontend consome): autenticação via `POST /auth/login` devolvendo `{ token }`,
usuário atual em `GET /auth/me`, `Authorization: Bearer <token>` em toda chamada
autenticada, e um `Pessoa`/`Cliente` já existente (usado em `GET /pessoa/cpf/{cpf}`
e `POST /pessoa`).

## Índice de endpoints a implementar

| Método | Rota | Descrição |
|---|---|---|
| GET | `/pacientes` | Lista todos os pacientes |
| GET | `/pacientes/{id}` | Dados de um paciente |
| GET | `/pacientes/{id}/historico` | Histórico de procedimentos do paciente |
| GET | `/pacientes/{id}/evolucoes` | Evoluções clínicas do paciente |
| POST | `/pacientes/{id}/evolucoes` | Adiciona uma evolução clínica |
| GET | `/pacientes/{id}/anexos` | Anexos (fotos, documentos, exames) |

Todas exigem um usuário autenticado com role `ADMIN`, `RECEPCAO` ou `PROFISSIONAL`.

---

## 1. Entidades JPA

Se você já tem uma entidade `Pessoa` (usada em `/pessoa/cpf/{cpf}`), o `Paciente`
pode ser a própria `Pessoa` que já tem agendamentos — não é necessário duplicar
cadastro. As entidades novas são as clínicas: histórico, evolução e anexo.

```java
@Entity
@Table(name = "historico_procedimento")
public class HistoricoProcedimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "paciente_id")
    private Pessoa paciente;

    @ManyToOne
    @JoinColumn(name = "profissional_id")
    private Pessoa profissional;

    private String procedimento;
    private LocalDateTime data;
    private BigDecimal valor;

    @Column(length = 2000)
    private String observacoes;

    @Enumerated(EnumType.STRING)
    private StatusHistorico status; // FINALIZADO, CANCELADO

    // getters/setters
}
```

```java
@Entity
@Table(name = "evolucao")
public class Evolucao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "paciente_id")
    private Pessoa paciente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "autor_id")
    private Usuario autor; // quem escreveu (pega do usuário logado, não do body)

    private LocalDateTime data;

    @Column(length = 4000, nullable = false)
    private String texto;

    @ManyToOne
    @JoinColumn(name = "historico_procedimento_id")
    private HistoricoProcedimento procedimentoRelacionado; // opcional

    // getters/setters
}
```

```java
@Entity
@Table(name = "anexo")
public class Anexo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "paciente_id")
    private Pessoa paciente;

    private String nome;

    @Enumerated(EnumType.STRING)
    private TipoAnexo tipo; // IMAGEM, DOCUMENTO, EXAME

    private String url; // caminho no storage (S3, disco, etc.)

    private LocalDateTime criadoEm;

    // getters/setters
}
```

Se `Pessoa` ainda não tiver os campos `alergias` e `contraindicacoes` usados no
prontuário, adicione como listas simples (ou uma tabela separada se preferir
histórico de alterações):

```java
@ElementCollection
@CollectionTable(name = "pessoa_alergia", joinColumns = @JoinColumn(name = "pessoa_id"))
@Column(name = "descricao")
private List<String> alergias = new ArrayList<>();

@ElementCollection
@CollectionTable(name = "pessoa_contraindicacao", joinColumns = @JoinColumn(name = "pessoa_id"))
@Column(name = "descricao")
private List<String> contraindicacoes = new ArrayList<>();
```

---

## 2. DTOs

Mantenha os DTOs no mesmo formato que os `interface`s TypeScript do frontend
(`src/mocks/prontuario.ts`), assim não precisa mapear nada manualmente do lado
do cliente.

```java
public record PacienteResponse(
    Long id,
    String nome,
    String cpf,
    String email,
    String telefone,
    LocalDate dataNascimento,
    String endereco,
    List<String> alergias,
    List<String> contraindicacoes,
    LocalDateTime criadoEm
) {}

public record HistoricoProcedimentoResponse(
    Long id,
    Long pacienteId,
    String procedimento,
    String profissional,
    LocalDateTime data,
    BigDecimal valor,
    String observacoes,
    String status
) {}

public record EvolucaoResponse(
    Long id,
    Long pacienteId,
    String autor,
    LocalDateTime data,
    String texto,
    Long procedimentoRelacionadoId
) {}

public record EvolucaoRequest(
    @NotBlank String texto,
    Long procedimentoRelacionadoId // opcional
) {}

public record AnexoResponse(
    Long id,
    Long pacienteId,
    String nome,
    String tipo,
    String url,
    LocalDateTime criadoEm
) {}
```

---

## 3. Repositories

```java
public interface HistoricoProcedimentoRepository extends JpaRepository<HistoricoProcedimento, Long> {
    List<HistoricoProcedimento> findByPacienteIdOrderByDataDesc(Long pacienteId);
}

public interface EvolucaoRepository extends JpaRepository<Evolucao, Long> {
    List<Evolucao> findByPacienteIdOrderByDataDesc(Long pacienteId);
}

public interface AnexoRepository extends JpaRepository<Anexo, Long> {
    List<Anexo> findByPacienteIdOrderByCriadoEmDesc(Long pacienteId);
}
```

Se `Pessoa` já tem um `PessoaRepository`, reaproveite — não crie um
`PacienteRepository` separado.

---

## 4. Service

Regra de negócio principal: validar que o paciente existe, e que quem grava a
evolução é o usuário autenticado (nunca confiar em um "autor" vindo do body).

```java
@Service
@RequiredArgsConstructor
public class ProntuarioService {

    private final PessoaRepository pessoaRepository;
    private final HistoricoProcedimentoRepository historicoRepository;
    private final EvolucaoRepository evolucaoRepository;
    private final AnexoRepository anexoRepository;

    public List<PacienteResponse> listarPacientes() {
        return pessoaRepository.findAll().stream()
            .map(this::toPacienteResponse)
            .toList();
    }

    public PacienteResponse buscarPaciente(Long id) {
        Pessoa pessoa = pessoaRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Paciente não encontrado"));
        return toPacienteResponse(pessoa);
    }

    public List<HistoricoProcedimentoResponse> listarHistorico(Long pacienteId) {
        return historicoRepository.findByPacienteIdOrderByDataDesc(pacienteId).stream()
            .map(this::toHistoricoResponse)
            .toList();
    }

    public List<EvolucaoResponse> listarEvolucoes(Long pacienteId) {
        return evolucaoRepository.findByPacienteIdOrderByDataDesc(pacienteId).stream()
            .map(this::toEvolucaoResponse)
            .toList();
    }

    public EvolucaoResponse adicionarEvolucao(Long pacienteId, EvolucaoRequest request, Usuario usuarioLogado) {
        Pessoa paciente = pessoaRepository.findById(pacienteId)
            .orElseThrow(() -> new EntityNotFoundException("Paciente não encontrado"));

        Evolucao evolucao = new Evolucao();
        evolucao.setPaciente(paciente);
        evolucao.setAutor(usuarioLogado);
        evolucao.setData(LocalDateTime.now());
        evolucao.setTexto(request.texto());

        if (request.procedimentoRelacionadoId() != null) {
            historicoRepository.findById(request.procedimentoRelacionadoId())
                .ifPresent(evolucao::setProcedimentoRelacionado);
        }

        return toEvolucaoResponse(evolucaoRepository.save(evolucao));
    }

    public List<AnexoResponse> listarAnexos(Long pacienteId) {
        return anexoRepository.findByPacienteIdOrderByCriadoEmDesc(pacienteId).stream()
            .map(this::toAnexoResponse)
            .toList();
    }

    // métodos toXxxResponse(...) fazem o mapeamento entidade -> DTO
}
```

---

## 5. Controller

```java
@RestController
@RequestMapping("/pacientes")
@RequiredArgsConstructor
public class ProntuarioController {

    private final ProntuarioService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCAO', 'PROFISSIONAL')")
    public List<PacienteResponse> listar() {
        return service.listarPacientes();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCAO', 'PROFISSIONAL')")
    public PacienteResponse buscar(@PathVariable Long id) {
        return service.buscarPaciente(id);
    }

    @GetMapping("/{id}/historico")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCAO', 'PROFISSIONAL')")
    public List<HistoricoProcedimentoResponse> historico(@PathVariable Long id) {
        return service.listarHistorico(id);
    }

    @GetMapping("/{id}/evolucoes")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCAO', 'PROFISSIONAL')")
    public List<EvolucaoResponse> evolucoes(@PathVariable Long id) {
        return service.listarEvolucoes(id);
    }

    @PostMapping("/{id}/evolucoes")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFISSIONAL')")
    public EvolucaoResponse adicionarEvolucao(
        @PathVariable Long id,
        @Valid @RequestBody EvolucaoRequest request,
        @AuthenticationPrincipal Usuario usuarioLogado
    ) {
        return service.adicionarEvolucao(id, request, usuarioLogado);
    }

    @GetMapping("/{id}/anexos")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCAO', 'PROFISSIONAL')")
    public List<AnexoResponse> anexos(@PathVariable Long id) {
        return service.listarAnexos(id);
    }
}
```

`@AuthenticationPrincipal Usuario usuarioLogado` pressupõe que seu
`UserDetailsService`/filtro JWT já popula o principal com a entidade `Usuario`
(ou algo que dê para resolver para ela). Se o seu setup atual devolve só um
`UserDetails` genérico, injete `Authentication` e busque o `Usuario` pelo
`username`/e-mail dentro do service.

---

## 6. Segurança (contrato que o frontend já espera)

O frontend (`src/services/api.ts`) já manda `Authorization: Bearer <token>` em
toda chamada e, ao receber `401`/`403`, apaga o token e redireciona para
`/login`. Isso significa que o seu filtro JWT deve:

1. Validar o token em cada request autenticada.
2. Devolver `401` se o token for inválido/expirado (não `500`).
3. Devolver `403` se o usuário autenticado não tiver a role exigida pelo
   `@PreAuthorize` do endpoint.

Contrato mínimo esperado dos dois endpoints que sustentam toda a autenticação
(`AuthContext.js` do frontend depende exatamente disso):

- `POST /auth/login` — recebe `{ username, password }`, devolve `{ token }`.
- `GET /auth/me` — com o Bearer token, devolve o usuário logado, incluindo pelo
  menos `{ id, nome (ou pessoa.nome), role }`.

---

## 7. Migração de banco (exemplo Flyway)

```sql
CREATE TABLE historico_procedimento (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL REFERENCES pessoa(id),
    profissional_id BIGINT REFERENCES pessoa(id),
    procedimento VARCHAR(255) NOT NULL,
    data TIMESTAMP NOT NULL,
    valor NUMERIC(10,2) NOT NULL DEFAULT 0,
    observacoes VARCHAR(2000),
    status VARCHAR(20) NOT NULL DEFAULT 'FINALIZADO'
);

CREATE TABLE evolucao (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL REFERENCES pessoa(id),
    autor_id BIGINT NOT NULL REFERENCES usuario(id),
    data TIMESTAMP NOT NULL,
    texto VARCHAR(4000) NOT NULL,
    historico_procedimento_id BIGINT REFERENCES historico_procedimento(id)
);

CREATE TABLE anexo (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL REFERENCES pessoa(id),
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    url VARCHAR(500) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE pessoa_alergia (
    pessoa_id BIGINT NOT NULL REFERENCES pessoa(id),
    descricao VARCHAR(255) NOT NULL
);

CREATE TABLE pessoa_contraindicacao (
    pessoa_id BIGINT NOT NULL REFERENCES pessoa(id),
    descricao VARCHAR(255) NOT NULL
);
```

Ajuste nomes de tabelas/FKs conforme o schema real do seu `Pessoa`/`Usuario`.

---

## 8. Checklist — o que trocar no frontend quando a API estiver pronta

Tudo está isolado em **`src/services/prontuarioService.ts`**. Para cada função,
descomente a linha "API real" e apague o corpo mock — nenhum componente
(`src/app/dashboard/pacientes/**`) precisa mudar:

- [ ] `listarPacientes()` → `GET /pacientes`
- [ ] `buscarPaciente(id)` → `GET /pacientes/{id}`
- [ ] `listarHistorico(pacienteId)` → `GET /pacientes/{id}/historico`
- [ ] `listarEvolucoes(pacienteId)` → `GET /pacientes/{id}/evolucoes`
- [ ] `adicionarEvolucao(pacienteId, texto, autor)` → `POST /pacientes/{id}/evolucoes` com `{ texto }` (o `autor` deixa de ser passado pelo front — o backend usa o usuário do token)
- [ ] `listarAnexos(pacienteId)` → `GET /pacientes/{id}/anexos`

Depois disso, pode apagar `src/mocks/prontuario.ts` (ou manter só para testes).
