# Sistema de Gestão de Alunos, Turmas e Matrículas

Este projeto é um desafio proposto pela Fiap para cadastro e gerenciamento de alunos, turmas e matrículas.

## Tecnologias utilizadas

- PHP 8.2
- MySQL
- React
- Docker + Docker Compose

## Instruções para execução

### 1. Subir containers

API e banco de dados rodam em container. 
Os containers estao definidos no `docker-compose.yml`.

Antes de rodar o comando, certifique-se que o docker esta iniciado.
Na raiz do projeto, onde esta o arquivo `docker-compose.yml`, rodar o seguinte comando:

```bash
docker compose up -d
```

Este comando irá iniciar os containers do banco de dados e da API.

---

### 2. Executar scripts de banco

Você pode usar ferramentas como DBeaver, TablePlus, Sequel Ace, MySQL Workbench ou o terminal para executar os scripts.

Para conectar no banco, utilize as seguintes credenciais:
- host: localhost
- user: root
- password: admin123

Acesse os arquivos a seguir e rode as queries no banco de dados MySQL:

- `db/scripts/create_db.sql` – Criação do banco de dados e das tabelas
- `db/scripts/seed.sql` – Dados iniciais para testes

---

### 3. Iniciar o frontend

Navegar ate a pasta do front-end e executar os comandos para instalacao e execucao do front-end.

```bash
cd frontend-desafio
npm install
npm start
```

Se o browser nao abrir automaticamente, abra o browser e navegue para `localhost:3000`.

---

## Login de acesso

- **E-mail**: `admin@fiap.com.br`
- **Senha**: `Admin@123`

## Validação de requisitos

Utilize o front-end para testar as regras de negócio descritas no desafio. 