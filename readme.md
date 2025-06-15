# Sistema de Gestão de Alunos, Turmas e Matrículas

Este projeto é um desafio proposto pela Fiap para cadastro e gerenciamento de alunos, turmas e matrículas.

## Tecnologias utilizadas

- PHP 8.2
- MySQL
- React
- Docker + Docker Compose

## Instruções para execução

### 1. Subir containers

```bash
docker compose up
```

Este comando irá iniciar os containers do banco de dados e da API.

---

### 2. Executar scripts de banco

Acesse os arquivos a seguir e rode as queries no banco de dados MySQL:

- `db/scripts/create_db.sql` – Criação das tabelas
- `db/scripts/seed.sql` – Dados iniciais para testes

Você pode usar ferramentas como DBeaver, TablePlus, Sequel Ace ou o terminal para executar os scripts.

---

### 3. Iniciar o frontend

```bash
cd frontend-desafio
npm install
npm start
```
---

## Login de acesso

- **E-mail**: `admin@fiap.com.br`
- **Senha**: `Admin@123`

## Validação de requisitos

Utilize o front-end para testar as regras de negócio descritas no desafio. 