USE `escola_db`;

-- Seed Aluno 
INSERT INTO `Aluno` (`nome`, `data_nascimento`, `cpf`, `email`, `senha`) VALUES
('João Silva', '2000-05-15', '111.222.333-44', 'joao.silva@example.com', 'senha123'),
('Maria Oliveira', '1999-11-20', '555.666.777-88', 'maria.oliveira@example.com', 'senha123'),
('Pedro Souza', '2001-03-10', '999.888.777-66', 'pedro.souza@example.com', 'senha123'),
('Ana Paula', '2002-08-25', '444.333.222-11', 'ana.paula@example.com', 'senha123');

-- Seed Turma 
INSERT INTO `Turma` (`nome`, `descricao`) VALUES
('Introdução à Programação', 'Curso básico de programação para iniciantes.'),
('Banco de Dados Relacionais', 'Estudo aprofundado de bancos de dados como MySQL.'),
('Desenvolvimento Web Frontend', 'Foco em HTML, CSS e JavaScript para o lado do cliente.'),
('Desenvolvimento Web Backend', 'Construção de APIs e lógica de servidor com Node.js/Python/PHP.');

-- Seed User 
INSERT INTO `User` (`username`, `password`, `email`, `role`) VALUES
('admin', '$2y$10$KFjaqMw3gjH9bk1fyXoNHui82957KMtEUR9s92EO11o.6FisbCd/G', 'admin@fiap.com.br', 'admin');

-- Seed Matricula
INSERT IGNORE INTO `Matricula` (`aluno_id`, `turma_id`) VALUES
((SELECT id FROM Aluno WHERE email = 'joao.silva@example.com'), (SELECT id FROM Turma WHERE nome = 'Introdução à Programação')),
((SELECT id FROM Aluno WHERE email = 'maria.oliveira@example.com'), (SELECT id FROM Turma WHERE nome = 'Introdução à Programação')),
((SELECT id FROM Aluno WHERE email = 'joao.silva@example.com'), (SELECT id FROM Turma WHERE nome = 'Banco de Dados Relacionais')),
((SELECT id FROM Aluno WHERE email = 'pedro.souza@example.com'), (SELECT id FROM Turma WHERE nome = 'Desenvolvimento Web Frontend')),
((SELECT id FROM Aluno WHERE email = 'maria.oliveira@example.com'), (SELECT id FROM Turma WHERE nome = 'Desenvolvimento Web Backend')),
((SELECT id FROM Aluno WHERE email = 'ana.paula@example.com'), (SELECT id FROM Turma WHERE nome = 'Introdução à Programação'));
