# Lab 01 - API REST de Imobiliária

Implementação do Lab 01 de Desenvolvimento Web II / IFMA.

## Recursos
- Clientes: GET, GET /{id}, POST, PUT, DELETE
- Imóveis: GET, GET /{id}, POST, PUT, DELETE
- Locações: GET, GET /{id}, POST, PUT, DELETE
- Bean Validation
- @RestControllerAdvice / @ExceptionHandler
- Flyway migrations
- Spring Data JPA
- H2

## Executar
mvn spring-boot:run

Base H2: jdbc:h2:file:./data/imobiliaria
Console: http://localhost:8080/h2-console

## Endpoints
GET    /clientes
GET    /clientes/{id}
POST   /clientes
PUT    /clientes/{id}
DELETE /clientes/{id}

GET    /imoveis
GET    /imoveis/{id}
POST   /imoveis
PUT    /imoveis/{id}
DELETE /imoveis/{id}

GET    /locacoes
GET    /locacoes/{id}
POST   /locacoes
PUT    /locacoes/{id}
DELETE /locacoes/{id}
