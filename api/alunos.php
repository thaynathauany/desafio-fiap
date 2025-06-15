<?php

require_once 'db_connect.php';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$conn = connectDB();

switch ($method) {
    case 'GET':
        handleGetAluno($conn);
        break;
    case 'POST':
        handlePostAluno($conn);
        break;
    case 'PUT':
        handlePutAluno($conn);
        break;
    case 'DELETE':
        handleDeleteAluno($conn);
        break;
    default:
        http_response_code(405);
        echo json_encode(["message" => "Método não permitido"]);
        break;
}

$conn->close();

function handleGetAluno($conn)
{
    if (isset($_GET['all']) && $_GET['all'] === 'true') {
        $result = $conn->query("SELECT * FROM Aluno ORDER BY nome");
        $alunos = [];
        while ($row = $result->fetch_assoc()) {
            $alunos[] = $row;
        }
        echo json_encode(["data" => $alunos]);
        exit;
    }

    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $stmt = $conn->prepare("SELECT id, nome, data_nascimento, cpf, email, created_at, updated_at FROM Aluno WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            echo json_encode($result->fetch_assoc());
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Aluno not found"]);
        }
        $stmt->close();
        return;
    }

    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $perPage = isset($_GET['per_page']) ? max(1, intval($_GET['per_page'])) : 10;
    $offset = ($page - 1) * $perPage;

    if (isset($_GET['nome'])) {
        $nome = '%' . $_GET['nome'] . '%';
        $stmt = $conn->prepare("SELECT COUNT(*) as total FROM Aluno WHERE nome LIKE ?");
        $stmt->bind_param("s", $nome);
        $stmt->execute();
        $totalResult = $stmt->get_result()->fetch_assoc()['total'];
        $stmt->close();

        $stmt = $conn->prepare("SELECT id, nome, data_nascimento, cpf, email, created_at, updated_at FROM Aluno WHERE nome LIKE ? ORDER BY nome ASC LIMIT ? OFFSET ?");
        $stmt->bind_param("sii", $nome, $perPage, $offset);
        $stmt->execute();
        $result = $stmt->get_result();
        $alunos = [];
        while ($row = $result->fetch_assoc()) {
            $alunos[] = $row;
        }

        echo json_encode([
            "data" => $alunos,
            "pagination" => [
                "page" => $page,
                "per_page" => $perPage,
                "total" => $totalResult,
                "last_page" => ceil($totalResult / $perPage)
            ]
        ]);
        $stmt->close();
        return;
    }

    $totalResult = $conn->query("SELECT COUNT(*) as total FROM Aluno")->fetch_assoc()['total'];
    $stmt = $conn->prepare("SELECT id, nome, data_nascimento, cpf, email, created_at, updated_at FROM Aluno ORDER BY nome ASC LIMIT ? OFFSET ?");
    $stmt->bind_param("ii", $perPage, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
    $alunos = [];
    while ($row = $result->fetch_assoc()) {
        $alunos[] = $row;
    }

    echo json_encode([
        "data" => $alunos,
        "pagination" => [
            "page" => $page,
            "per_page" => $perPage,
            "total" => $totalResult,
            "last_page" => ceil($totalResult / $perPage)
        ]
    ]);
    $stmt->close();
}

function handlePostAluno($conn)
{
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['nome'], $data['data_nascimento'], $data['cpf'], $data['email'], $data['senha'])) {
        http_response_code(400);
        echo json_encode(["message" => "Todos os campos obrigatórios devem ser preenchidos"]);
        return;
    }

    $nome = $data['nome'];
    $data_nascimento = $data['data_nascimento'];
    $cpf = $data['cpf'];
    $email = $data['email'];
    $senha = $data['senha'];

    if (strlen(trim($nome)) < 3) {
        http_response_code(422);
        echo json_encode(["message" => "O nome do aluno deve ter no mínimo 3 caracteres."]);
        return;
    }

    $senha = $data['senha'];
    if (
        strlen($senha) < 8 ||
        !preg_match('/[A-Z]/', $senha) ||
        !preg_match('/[a-z]/', $senha) ||
        !preg_match('/[0-9]/', $senha) ||
        !preg_match('/[\W_]/', $senha)
    ) {
        http_response_code(422);
        echo json_encode(["message" => "A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos."]);
        return;
    }

    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO Aluno (nome, data_nascimento, cpf, email, senha) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $nome, $data_nascimento, $cpf, $email, $senhaHash);

    try {
        $stmt->execute();
        http_response_code(201);
        echo json_encode(["message" => "Aluno criado com sucesso", "id" => $stmt->insert_id]);
    } catch (mysqli_sql_exception $e) {
        if (str_contains($e->getMessage(), 'Usuário duplicado')) {
            http_response_code(400);
            echo json_encode(["message" => "CPF ou Email já cadastrado."]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Erro ao criar aluno: " . $e->getMessage()]);
        }
    }

    $stmt->close();
}

function handlePutAluno($conn)
{
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["message" => "ID do aluno é obrigatório para atualização"]);
        return;
    }

    $id = intval($_GET['id']);
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['nome']) && strlen(trim($data['nome'])) < 3) {
        http_response_code(400);
        echo json_encode(["message" => "O nome do aluno deve ter pelo menos 3 caracteres."]);
        return;
    }

    if (isset($data['cpf'])) {
        $stmtCpf = $conn->prepare("SELECT id FROM Aluno WHERE cpf = ? AND id != ?");
        $stmtCpf->bind_param("si", $data['cpf'], $id);
        $stmtCpf->execute();
        $stmtCpf->store_result();
        if ($stmtCpf->num_rows > 0) {
            http_response_code(400);
            echo json_encode(["message" => "CPF já cadastrado por outro aluno."]);
            return;
        }
        $stmtCpf->close();
    }

    if (isset($data['email'])) {
        $stmtEmail = $conn->prepare("SELECT id FROM Aluno WHERE email = ? AND id != ?");
        $stmtEmail->bind_param("si", $data['email'], $id);
        $stmtEmail->execute();
        $stmtEmail->store_result();
        if ($stmtEmail->num_rows > 0) {
            http_response_code(400);
            echo json_encode(["message" => "Email já cadastrado por outro aluno."]);
            return;
        }
        $stmtEmail->close();
    }

    if (empty($data)) {
        http_response_code(400);
        echo json_encode(["message" => "Nenhum dado enviado para atualizar"]);
        return;
    }

    $set_clauses = [];
    $params = [];
    $types = "";

    if (isset($data['nome'])) {
        $set_clauses[] = "nome = ?";
        $params[] = $data['nome'];
        $types .= "s";
    }
    if (isset($data['data_nascimento'])) {
        $set_clauses[] = "data_nascimento = ?";
        $params[] = $data['data_nascimento'];
        $types .= "s";
    }
    if (isset($data['cpf'])) {
        $set_clauses[] = "cpf = ?";
        $params[] = $data['cpf'];
        $types .= "s";
    }
    if (isset($data['email'])) {
        $set_clauses[] = "email = ?";
        $params[] = $data['email'];
        $types .= "s";
    }
    if (isset($data['senha'])) {
        $set_clauses[] = "senha = ?";
        $params[] = password_hash($data['senha'], PASSWORD_DEFAULT);
        $types .= "s";
    }

    if (empty($set_clauses)) {
        http_response_code(400);
        echo json_encode(["message" => "Nenhum dado enviado para atualizar"]);
        return;
    }

    $sql = "UPDATE Aluno SET " . implode(", ", $set_clauses) . " WHERE id = ?";
    $params[] = $id;
    $types .= "i";

    try {
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            http_response_code(200);
            echo json_encode(["message" => "Aluno atualizado com sucesso"]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Aluno nao encontrado"]);
        }

        $stmt->close();
    } catch (mysqli_sql_exception $e) {
        if (str_contains($e->getMessage(), 'Usuário duplicado')) {
            http_response_code(400);
            echo json_encode(["message" => "CPF ou Email já cadastrado."]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Erro ao atualizar aluno: " . $e->getMessage()]);
        }
    }
}

function handleDeleteAluno($conn)
{
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["message" => "ID do aluno é obrigatório para exclusão"]);
        return;
    }

    $id = intval($_GET['id']);

    $stmt = $conn->prepare("DELETE FROM Aluno WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            http_response_code(200);
            echo json_encode(["message" => "Aluno excluído com sucesso"]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Aluno nao encontrado"]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erro ao excluir aluno: " . $stmt->error]);
    }

    $stmt->close();
}
