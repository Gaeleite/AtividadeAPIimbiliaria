INSERT INTO clientes (nome_cliente, cpf, telefone, email, dt_nascimento) VALUES
('DEMO - Ana Souza', '900.000.000-01', '(98) 99111-0001', 'ana.souza@example.com', '1988-04-12'),
('DEMO - Bruno Lima', '900.000.000-02', '(98) 99222-0002', 'bruno.lima@example.com', '1992-09-23'),
('DEMO - Carla Mendes', '900.000.000-03', '(98) 99333-0003', 'carla.mendes@example.com', '1979-01-08'),
('DEMO - Diego Costa', '900.000.000-04', '(98) 99444-0004', 'diego.costa@example.com', '1995-11-30'),
('DEMO - Elisa Rocha', '900.000.000-05', '(98) 99555-0005', 'elisa.rocha@example.com', '1984-06-17'),
('DEMO - Felipe Alves', '900.000.000-06', '(98) 99666-0006', 'felipe.alves@example.com', '1990-02-25'),
('DEMO - Giovana Reis', '900.000.000-07', '(98) 99777-0007', 'giovana.reis@example.com', '1986-08-14'),
('DEMO - Hugo Martins', '900.000.000-08', '(98) 99888-0008', 'hugo.martins@example.com', '1975-12-05'),
('DEMO - Isabela Nunes', '900.000.000-09', '(98) 99911-0009', 'isabela.nunes@example.com', '1998-03-19'),
('DEMO - João Teixeira', '900.000.000-10', '(98) 99000-0010', 'joao.teixeira@example.com', NULL);

INSERT INTO imoveis (tipo_imovel, endereco, cep, dormitorios, banheiros, suites, metragem, valor_aluguel_sug, obs) VALUES
('Apartamento', 'DEMO 01 - Rua das Palmeiras, 120, Centro, São Luís', '65010-100', 2, 1, 0, 68, 1800.00, 'Próximo a comércio e transporte público.'),
('Casa', 'DEMO 02 - Avenida dos Holandeses, 450, Calhau, São Luís', '65071-380', 3, 2, 1, 145, 4200.00, 'Quintal amplo e duas vagas de garagem.'),
('Kitnet', 'DEMO 03 - Rua do Sol, 35, Centro, São Luís', '65020-590', 1, 1, 0, 32, 950.00, NULL),
('Sala comercial', 'DEMO 04 - Avenida Jerônimo de Albuquerque, 800, Cohafuma, São Luís', '65074-220', 0, 1, 0, 54, 2100.00, 'Edifício com elevador e portaria.'),
('Casa em condomínio', 'DEMO 05 - Alameda dos Ipês, 18, Araçagi, São José de Ribamar', '65110-000', 4, 3, 2, 210, 6800.00, 'Condomínio com piscina e área de lazer.'),
('Apartamento', 'DEMO 06 - Rua das Acácias, 77, Renascença, São Luís', '65075-400', 2, 2, 1, 82, 0.00, 'Valor zero para demonstrar o limite permitido.'),
('Terreno', 'DEMO 07 - Rua Projetada, 0, Turu, São Luís', '65066-620', 0, 0, 0, 360, NULL, 'Terreno sem valor sugerido de aluguel.'),
('Casa', 'DEMO 08 - Rua da Mangueira, 215, Anil, São Luís', '65046-120', 3, 2, 0, 118, 2600.00, NULL),
('Apartamento', 'DEMO 09 - Avenida Litorânea, 1500, Ponta d''Areia, São Luís', '65077-630', 3, 2, 1, 105, 5300.00, 'Vista para o mar.'),
('Sala comercial', 'DEMO 10 - Rua Grande, 510, Centro, São Luís', '65020-250', NULL, NULL, NULL, NULL, 1500.00, 'Campos de metragem e cômodos não se aplicam.');

INSERT INTO locacao (id_imovel, id_inquilino, ativo, data_inicio, data_fim, dia_vencimento, percentual_taxa, valor_aluguel, obs)
SELECT imoveis.id, clientes.id, dados.ativo, dados.data_inicio, dados.data_fim, dados.dia_vencimento, dados.percentual_taxa, dados.valor_aluguel, dados.obs
FROM (VALUES
    ('DEMO 01 - Rua das Palmeiras, 120, Centro, São Luís', '900.000.000-01', TRUE,  DATE '2025-02-01', NULL,         5,  8.00, 1800.00, 'Contrato ativo; vencimento no início do mês.'),
    ('DEMO 02 - Avenida dos Holandeses, 450, Calhau, São Luís', '900.000.000-02', TRUE,  DATE '2025-06-15', NULL,        10, 10.00, 4000.00, 'Contrato ativo com taxa de administração de 10%.'),
    ('DEMO 03 - Rua do Sol, 35, Centro, São Luís', '900.000.000-03', FALSE, DATE '2024-01-10', DATE '2025-01-10',  15,  8.00,  900.00, 'Contrato encerrado.'),
    ('DEMO 04 - Avenida Jerônimo de Albuquerque, 800, Cohafuma, São Luís', '900.000.000-04', TRUE,  DATE '2026-01-01', NULL,        20,  7.50, 2100.00, NULL),
    ('DEMO 05 - Alameda dos Ipês, 18, Araçagi, São José de Ribamar', '900.000.000-05', FALSE, DATE '2023-05-01', DATE '2024-04-30',  8,  9.00, 6500.00, 'Locação encerrada após um ano.'),
    ('DEMO 06 - Rua das Acácias, 77, Renascença, São Luís', '900.000.000-06', TRUE,  DATE '2026-09-01', NULL,        25,  0.00,    0.00, 'Demonstra valores iguais a zero.'),
    ('DEMO 07 - Rua Projetada, 0, Turu, São Luís', '900.000.000-07', FALSE, DATE '2022-03-01', DATE '2023-02-28', NULL, NULL, NULL, 'Contrato antigo com dados financeiros opcionais vazios.'),
    ('DEMO 08 - Rua da Mangueira, 215, Anil, São Luís', '900.000.000-08', TRUE,  DATE '2025-11-20', NULL,        30,  8.50, 2500.00, 'Vencimento no fim do mês.'),
    ('DEMO 09 - Avenida Litorânea, 1500, Ponta d''Areia, São Luís', '900.000.000-09', FALSE, DATE '2024-08-01', DATE '2025-07-31',  5,  8.00, 5000.00, 'Contrato de apartamento encerrado.'),
    ('DEMO 10 - Rua Grande, 510, Centro, São Luís', '900.000.000-10', NULL,  DATE '2026-07-01', NULL,        NULL, NULL, NULL, 'Status e dados de cobrança não informados.')
) AS dados(endereco, cpf, ativo, data_inicio, data_fim, dia_vencimento, percentual_taxa, valor_aluguel, obs)
JOIN imoveis ON imoveis.endereco = dados.endereco
JOIN clientes ON clientes.cpf = dados.cpf;