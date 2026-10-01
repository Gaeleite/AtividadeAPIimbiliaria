# API REST de Imobiliária

Projeto acadêmico do Lab 01 de Desenvolvimento Web II / IFMA. A aplicação oferece uma API REST para clientes, imóveis e locações, além de um painel web integrado para administrar esses registros.

## Tecnologias

- Java 17+
- Spring Boot 3.5.6
- Spring Web e Spring Data JPA
- Jakarta Bean Validation
- Flyway para versionar o schema do banco
- H2 em modo arquivo
- HTML, CSS e JavaScript no painel web

## Requisitos

- JDK 17 ou superior
- Maven 3.6.3 ou superior

Confira as ferramentas disponíveis:

```bash
java -version
mvn -version
```

## Executar

Na pasta raiz do projeto:

```bash
mvn spring-boot:run
```

A aplicação inicia em <http://localhost:8080>. A página inicial abre o painel Morada; os endpoints REST permanecem disponíveis na mesma origem.

Para compilar e executar os testes:

```bash
mvn test
```

O projeto ainda não contém testes automatizados próprios; esse comando valida a compilação e executa os testes presentes, se houver.

## Estrutura do projeto

```text
src/main/java/br/edu/ifma/imobiliaria/
├── ImobiliariaApiApplication.java  # inicialização do Spring Boot
├── controller/                     # rotas HTTP e códigos de resposta
├── exception/                      # formato e tratamento global de erros
├── model/                          # entidades JPA e validações
├── repository/                     # acesso ao banco com Spring Data
└── service/                        # operações de consulta e CRUD
src/main/resources/
├── application.properties          # configuração da aplicação e do H2
├── db/migration/                   # migrations Flyway
└── static/                         # painel web servido pelo Spring Boot
```

As requisições seguem o fluxo controller → service → repository → banco. Os controllers definem as rotas e respostas HTTP; os services delegam as operações aos repositories; estes usam Spring Data JPA para persistir as entidades. Os modelos também são usados como corpo JSON da API.

### Papel das classes

| Classe | Responsabilidade |
|---|---|
| `ImobiliariaApiApplication` | Ponto de entrada; inicia o Spring Boot. |
| `ClienteController`, `ImovelController`, `LocacaoController` | Mapeiam as rotas de cada recurso. Recebem e retornam JSON e delegam o CRUD ao service correspondente. |
| `ClienteService`, `ImovelService`, `LocacaoService` | Implementam listagem, busca por ID, criação, atualização e exclusão. A busca e exclusão verificam se o ID existe. |
| `ClienteRepository`, `ImovelRepository`, `LocacaoRepository` | Interfaces `JpaRepository` que fornecem operações de persistência sem implementação manual de SQL. |
| `Cliente`, `Imovel`, `Locacao` | Entidades JPA, mapeadas para as tabelas do H2; contêm campos, associações e, quando definido, validações Jakarta. |
| `GlobalExceptionHandler` | Intercepta erros de validação e `RuntimeException` em toda a API e os converte em respostas HTTP. |
| `ApiError` | Estrutura JSON padronizada para respostas de erro. |

`application.properties` define o nome da aplicação, a conexão com H2, a validação do schema por Hibernate, a execução do Flyway, a exibição de SQL e o console web do H2. A migration `V1__create_tables.sql` define as três tabelas, colunas e chaves estrangeiras.

## Banco de dados

O H2 persiste os dados em `./data/imobiliaria`, relativo à pasta em que o comando Maven é executado. A primeira inicialização executa `V1__create_tables.sql`, que cria as tabelas `clientes`, `imoveis` e `locacao`, seus IDs gerados e as chaves estrangeiras da locação.

O Hibernate está configurado com `ddl-auto=validate`: o schema é criado pelas migrations Flyway e, na inicialização, o Hibernate confere se as entidades correspondem a ele. O console H2 fica disponível em <http://localhost:8080/h2-console>, com estes dados:

| Campo | Valor |
|---|---|
| JDBC URL | `jdbc:h2:file:./data/imobiliaria` |
| Usuário | `sa` |
| Senha | em branco |

O arquivo do banco não é versionado; o `.gitignore` exclui `data/` e `target/`.

## Entidades e regras

### Cliente

| Campo | Regra |
|---|---|
| `id` | Gerado pelo banco. |
| `nomeCliente` | Obrigatório, não pode ser branco e aceita até 255 caracteres. |
| `cpf` | Obrigatório, não pode ser branco, aceita até 14 caracteres e é único. Não há validação do formato ou dos dígitos do CPF. |
| `telefone` | Obrigatório, não pode ser branco e aceita até 32 caracteres. |
| `email` | Obrigatório, não pode ser branco, deve ter formato de e-mail e aceita até 100 caracteres. |
| `dtNascimento` | Opcional; se informado, deve ser anterior à data atual. |

### Imóvel

| Campo | Regra |
|---|---|
| `id` | Gerado pelo banco. |
| `tipoImovel` | Obrigatório e não pode ser branco. |
| `endereco` | Obrigatório e não pode ser branco. |
| `cep` | Obrigatório e não pode ser branco. |
| `dormitorios`, `banheiros`, `suites`, `metragem` | Opcionais; quando informados, devem ser zero ou positivos. |
| `valorAluguelSug` | Opcional; quando informado, deve ser zero ou positivo. |
| `obs` | Observações opcionais. |

### Locação

| Campo | Regra |
|---|---|
| `id` | Gerado pelo banco. |
| `imovel` | Obrigatório; referência ao imóvel por meio de um objeto com `id`. |
| `inquilino` | Obrigatório; referência ao cliente por meio de um objeto com `id`. |
| `ativo` | Indica se o contrato está ativo. O painel marca essa opção por padrão ao criar. |
| `dataInicio` | Data de início; a coluna do banco não aceita `NULL`. |
| `dataFim` | Data de encerramento opcional. |
| `diaVencimento` | Dia de vencimento opcional. |
| `percentualTaxa` | Taxa de administração opcional. |
| `valorAluguel` | Valor mensal opcional. |
| `obs` | Observações opcionais. |

Datas são enviadas no formato ISO `AAAA-MM-DD`; valores monetários e percentuais são números JSON. A validação Java de `Locacao` exige os relacionamentos, mas não anota `dataInicio` com `@NotNull`, apesar de a coluna SQL ser obrigatória. Preencha esse campo para evitar erro de persistência.

## API REST

As três coleções oferecem o mesmo CRUD:

| Método | Rota | Resposta de sucesso |
|---|---|---|
| `GET` | `/clientes`, `/imoveis` ou `/locacoes` | `200 OK` com a lista. |
| `GET` | `/clientes/{id}`, `/imoveis/{id}` ou `/locacoes/{id}` | `200 OK` com o registro. |
| `POST` | `/clientes`, `/imoveis` ou `/locacoes` | `201 Created`, corpo com o registro e cabeçalho `Location`. |
| `PUT` | `/clientes/{id}`, `/imoveis/{id}` ou `/locacoes/{id}` | `200 OK` com o registro atualizado. O ID da rota é usado no registro. |
| `DELETE` | `/clientes/{id}`, `/imoveis/{id}` ou `/locacoes/{id}` | `204 No Content`. |

### Exemplos de requisição

Criar um cliente:

```http
POST /clientes
Content-Type: application/json
```

```json
{
	"nomeCliente": "Marina Oliveira",
	"cpf": "123.456.789-00",
	"telefone": "(98) 99999-0000",
	"email": "marina@example.com",
	"dtNascimento": "1995-06-14"
}
```

Criar um imóvel:

```http
POST /imoveis
Content-Type: application/json
```

```json
{
	"tipoImovel": "Apartamento",
	"endereco": "Rua das Flores, 120, Centro, São Luís",
	"cep": "65000-000",
	"dormitorios": 2,
	"banheiros": 1,
	"suites": 1,
	"metragem": 75,
	"valorAluguelSug": 1800.00,
	"obs": "Próximo ao comércio"
}
```

Criar uma locação (substitua os IDs pelos registros existentes):

```http
POST /locacoes
Content-Type: application/json
```

```json
{
	"imovel": { "id": 1 },
	"inquilino": { "id": 1 },
	"ativo": true,
	"dataInicio": "2026-10-01",
	"dataFim": null,
	"diaVencimento": 10,
	"percentualTaxa": 8.5,
	"valorAluguel": 1800.00,
	"obs": null
}
```

As entidades são retornadas diretamente no JSON. Por isso, uma locação retornada pela API contém objetos `imovel` e `inquilino`; para criá-la, basta informar o `id` de cada objeto relacionado.

Exemplos com `curl`:

```bash
curl http://localhost:8080/clientes
curl http://localhost:8080/imoveis/1
curl -X DELETE http://localhost:8080/locacoes/1
```

## Erros e validação

`GlobalExceptionHandler` trata erros de Bean Validation e retorna um objeto `ApiError` com `timestamp`, `status`, `error`, `message` e `details`. Para campos inválidos, a resposta é `400 Bad Request`, com a mensagem `Dados inválidos.` e uma lista de detalhes no formato `campo: mensagem`.

O handler atual também converte qualquer `RuntimeException` em `404 Not Found`. Os services lançam esse tipo de exceção quando não encontram um registro; entretanto, outras falhas de runtime ou de integridade do banco também podem acabar apresentadas como `404`. Esse é o comportamento implementado atualmente.

## Painel web

O painel **Morada** está em `src/main/resources/static` e é servido pelo próprio Spring Boot:

- `index.html`: estrutura da página, navegação, indicadores, tabelas e diálogo de formulários.
- `styles.css`: identidade visual responsiva, estados de foco, animações e adaptação para telas menores.
- `app.js`: chamadas HTTP, renderização de dados, busca, filtros, formulários de CRUD e notificações.

O painel possui as telas de visão geral, imóveis, locações e clientes. A visão geral resume os totais cadastrados, contratos ativos, soma mensal dos aluguéis ativos e ocupação dos imóveis, além de mostrar até três locações recentes. As listas permitem busca e filtros por tipo de imóvel ou estado da locação. Os formulários criam e editam registros; a exclusão pede confirmação. Na locação, os menus de seleção usam clientes e imóveis já cadastrados.

Os dados são carregados dos três endpoints. O indicador de conexão muda para indisponível se uma das consultas falhar; o botão de atualizar repete o carregamento. O atalho `Ctrl+K` leva à busca. Fontes, ícones e fotografia do painel são obtidos de Google Fonts, unpkg/Lucide e Unsplash, respectivamente; sem conexão externa, os recursos visuais desses serviços podem não carregar.

## Licença

Este repositório não declara uma licença de uso. Consulte o responsável pelo projeto antes de redistribuir ou reutilizar o código.

GET    /locacoes
GET    /locacoes/{id}
POST   /locacoes
PUT    /locacoes/{id}
DELETE /locacoes/{id}
