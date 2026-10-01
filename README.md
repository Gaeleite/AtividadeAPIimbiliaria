# API de Gestão Imobiliária

Projeto acadêmico do Lab 01 de Desenvolvimento Web II do IFMA. A aplicação permite cadastrar e administrar clientes, imóveis e contratos de locação por uma API REST. Também inclui o painel web **Morada**, integrado à API.

## Tecnologias

- Java 17 ou superior
- Spring Boot 3.5.6
- Spring Web e Spring Data JPA
- Jakarta Bean Validation
- Flyway para controlar as alterações no banco de dados
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

Abra um terminal na pasta do projeto e execute:

```bash
mvn spring-boot:run
```

Quando a inicialização terminar, acesse o painel em <http://localhost:8080>. A API usa o mesmo endereço. Por exemplo, a lista de clientes fica em <http://localhost:8080/clientes>.

Para compilar o projeto e executar os testes automatizados:

```bash
mvn test
```

Atualmente, o projeto não tem testes próprios em `src/test/java`; o comando compila a aplicação e executa os testes presentes, se houver.

## Estrutura do projeto

```text
src/main/
├── java/br/edu/ifma/imobiliaria/
│   ├── ImobiliariaApiApplication.java
│   ├── controller/                 # rotas HTTP e respostas
│   ├── exception/                  # tratamento e formato dos erros
│   ├── model/                      # entidades JPA e validações
│   ├── repository/                 # acesso aos dados
│   └── service/                    # operações de consulta e alteração
└── resources/
	├── application.properties      # configuração da aplicação e do H2
	├── db/migration/               # migrações do Flyway
	└── static/                     # painel web servido pelo Spring Boot
```

Uma requisição passa pelo controller, pelo service e pelo repository até chegar ao banco. Os controllers recebem as requisições e definem as respostas HTTP; os services coordenam as operações; os repositories usam Spring Data JPA para acessar os dados. Os modelos também são usados nos corpos JSON da API.

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

`application.properties` configura a conexão com o H2, a validação do banco pelo Hibernate, o Flyway, a exibição dos comandos SQL e o console do H2. A migração `V1__create_tables.sql` cria as tabelas e os relacionamentos do banco.

## Banco de dados

O H2 salva os dados em `./data/imobiliaria`, relativo à pasta de onde o comando de execução foi iniciado. Na primeira inicialização, o Flyway aplica `V1__create_tables.sql`, que cria as tabelas `clientes`, `imoveis` e `locacao` e as chaves estrangeiras da locação. Em seguida, aplica `V2__inserir_dados_de_demonstracao.sql`, que adiciona os registros de exemplo descritos abaixo.

O Hibernate está configurado com `ddl-auto=validate`: ele confere se as entidades correspondem às tabelas, mas não cria nem altera o banco. A estrutura é criada pelas migrações do Flyway. O console do H2 fica em <http://localhost:8080/h2-console>; conecte-se com estes dados:

| Campo | Valor |
|---|---|
| JDBC URL | `jdbc:h2:file:./data/imobiliaria` |
| Usuário | `sa` |
| Senha | Deixe em branco |

Os dados locais e os arquivos gerados pelo Maven não são enviados ao GitHub: `data/` e `target/` estão no `.gitignore`.

### Dados de demonstração

A migração V2 acrescenta 10 clientes, 10 imóveis e 10 locações fictícias, identificados pelo prefixo `DEMO`. Os exemplos cobrem locações ativas, encerradas e sem status informado, além de valores e campos opcionais preenchidos, zerados ou vazios. A migração não apaga os dados que já existirem no banco. Como o Flyway executa cada migração uma única vez por banco, esses registros entram automaticamente na primeira inicialização após a inclusão da V2.

## Entidades e regras

### Cliente

| Campo | Regra |
|---|---|
| `id` | Identificador gerado pelo banco. |
| `nomeCliente` | Obrigatório, não pode conter apenas espaços e aceita até 255 caracteres. |
| `cpf` | Obrigatório, não pode conter apenas espaços, aceita até 14 caracteres e não pode se repetir. O código não confere o formato nem os dígitos do CPF. |
| `telefone` | Obrigatório, não pode conter apenas espaços e aceita até 32 caracteres. |
| `email` | Obrigatório, deve ter formato de e-mail e aceita até 100 caracteres. |
| `dtNascimento` | Opcional; quando informado, deve ser uma data anterior à atual. |

### Imóvel

| Campo | Regra |
|---|---|
| `id` | Identificador gerado pelo banco. |
| `tipoImovel`, `endereco`, `cep` | Obrigatórios e não podem conter apenas espaços. |
| `dormitorios`, `banheiros`, `suites`, `metragem` | Opcionais; quando informados, devem ser maiores ou iguais a zero. |
| `valorAluguelSug` | Opcional; quando informado, deve ser maior ou igual a zero. |
| `obs` | Observações opcionais. |

### Locação

| Campo | Regra |
|---|---|
| `id` | Identificador gerado pelo banco. |
| `imovel` | Obrigatório; aponta para um imóvel existente. |
| `inquilino` | Obrigatório; aponta para um cliente existente. |
| `ativo` | Indica se a locação está ativa. O painel marca essa opção ao abrir um novo cadastro. |
| `dataInicio` | Data de início obrigatória no banco. Preencha esse campo ao criar uma locação. |
| `dataFim` | Data de término opcional. |
| `diaVencimento` | Dia do vencimento, opcional. |
| `percentualTaxa` | Percentual da taxa, opcional. |
| `valorAluguel` | Valor mensal, opcional. |
| `obs` | Observações opcionais. |

As datas usam o formato `AAAA-MM-DD`. Valores monetários e percentuais são números JSON. Os campos `imovel` e `inquilino` são enviados como objetos com o ID do registro relacionado. Embora o banco exija `dataInicio`, o modelo Java não tem uma validação `@NotNull` nesse campo; deixar a data vazia pode causar um erro ao salvar.

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

`GlobalExceptionHandler` trata erros de validação e retorna um objeto `ApiError` com `timestamp`, `status`, `error`, `message` e `details`. Para campos inválidos, a resposta é `400 Bad Request`, com a mensagem `Dados inválidos.` e uma lista de detalhes no formato `campo: mensagem`.

O tratamento atual também responde com `404 Not Found` para qualquer `RuntimeException`. Os services lançam essa exceção quando não encontram um registro; outras falhas durante a execução ou relacionadas à integridade do banco também podem acabar apresentadas como `404`.

## Painel web

O painel **Morada** está em `src/main/resources/static` e é servido pelo Spring Boot:

- `index.html`: estrutura da página, navegação, indicadores, tabelas e diálogo de formulários.
- `styles.css`: identidade visual responsiva, estados de foco, animações e adaptação para telas menores.
- `app.js`: chamadas HTTP, renderização de dados, busca, filtros, formulários de CRUD e notificações.

O painel tem telas de visão geral, imóveis, locações e clientes. A visão geral mostra os totais cadastrados, as locações ativas, a soma mensal dos aluguéis ativos e a ocupação dos imóveis. Também exibe até três locações recentes. Nas listas, é possível pesquisar e filtrar por tipo de imóvel ou situação da locação. Os formulários criam e editam registros; a exclusão pede confirmação. Para cadastrar uma locação, selecione um cliente e um imóvel já cadastrados.

Os dados são carregados dos três recursos da API. O indicador mostra quando a API está indisponível se uma das consultas falhar; o botão de atualização carrega os dados novamente. O atalho `Ctrl+K` leva à busca. As fontes, os ícones e a fotografia vêm do Google Fonts, do unpkg/Lucide e do Unsplash. Esses elementos visuais dependem de conexão com a internet; as funções da API são servidas localmente pelo Spring Boot.

## Licença

Este repositório não declara uma licença de uso. Consulte a pessoa responsável pelo projeto antes de redistribuir ou reutilizar o código.

## Repositório

Código-fonte: <https://github.com/Gaeleite/AtividadeAPIimbiliaria>

Este projeto faz parte do Lab 01 de Desenvolvimento Web II do IFMA.

