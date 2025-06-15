<?php

require_once 'db_connect.php';

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
        handleGetTurma($conn);
        break;
    case 'POST':
        handlePostTurma($conn);
        break;
    case 'PUT':
        handlePutTurma($conn);
        break;
    case 'DELETE':
        handleDeleteTurma($conn);
        break;
    default:
        http_response_code(405);
        echo json_encode(["message" => "Método não permitido"]);
        break;
}

$conn->close();

function handleGetTurma($conn)
{
    $nome = isset($_GET['nome']) ? '%' . $conn->real_escape_string($_GET['nome']) . '%' : null;
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = 10;
    $offset = ($page - 1) * $limit;

    $query = "
    SELECT 
        t.id,
        t.nome,
        t.descricao,
        t.created_at,
        t.updated_at,
        COUNT(m.id) AS total_alunos
    FROM Turma t
    LEFT JOIN Matricula m ON m.turma_id = t.id
    ";

    $countQuery = "SELECT COUNT(*) as total FROM Turma";
    $where = "";
    $params = [];
    $types = "";

    if ($nome) {
        $where = " WHERE nome LIKE ?";
        $params[] = $nome;
        $types .= "s";
    }

    $order = " ORDER BY nome ASC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";
    $group = " GROUP BY t.id ";
    $stmt = $conn->prepare($query . $where . $group . " " . $order);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $turmas = [];
    while ($row = $result->fetch_assoc()) {
        $turmas[] = $row;
    }

    if (isset($_GET['all']) && $_GET['all'] === 'true') {
        $result = $conn->query("
        SELECT 
            t.id,
            t.nome,
            t.descricao,
            t.created_at,
            t.updated_at,
            COUNT(m.id) AS total_alunos
        FROM Turma t
        LEFT JOIN Matricula m ON m.turma_id = t.id
        GROUP BY t.id
        ORDER BY t.nome
    ");

        $turmas = [];
        while ($row = $result->fetch_assoc()) {
            $turmas[] = $row;
        }
        echo json_encode(["data" => $turmas]);
        exit;
    }

    if ($where) {
        $countStmt = $conn->prepare($countQuery . $where);
        $countStmt->bind_param("s", $nome);
        $countStmt->execute();
        $countResult = $countStmt->get_result()->fetch_assoc();
        $countStmt->close();
    } else {
        $countResult = $conn->query($countQuery)->fetch_assoc();
    }

    echo json_encode([
        "data" => $turmas,
        "total" => intval($countResult['total']),
        "per_page" => $limit,
        "current_page" => $page
    ]);

    $stmt->close();
}

function handlePostTurma($conn)
{
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['nome'])) {
        http_response_code(400);
        echo json_encode(["message" => "Campo nome é obrigatório"]);
        return;
    }

    $nome = $data['nome'];
    $descricao = $data['descricao'] ?? null;

    $stmt = $conn->prepare("INSERT INTO Turma (nome, descricao) VALUES (?, ?)");
    $stmt->bind_param("ss", $nome, $descricao);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "Turma criada com sucesso", "id" => $stmt->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erro ao criar turma: " . $stmt->error]);
    }
    $stmt->close();
}

function handlePutTurma($conn)
{
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["message" => "ID da turma é obrigatório para edição"]);
        return;
    }
    $id = intval($_GET['id']);

    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data)) {
        http_response_code(400);
        echo json_encode(["message" => "Nenhum dado enviado para atualizar"]);
        return;
    }

    if (isset($data['nome']) && strlen(trim($data['nome'])) < 3) {
        http_response_code(400);
        echo json_encode(["message" => "O nome da turma deve ter pelo menos 3 letras"]);
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
    if (isset($data['descricao'])) {
        $set_clauses[] = "descricao = ?";
        $params[] = $data['descricao'];
        $types .= "s";
    }

    if (empty($set_clauses)) {
        http_response_code(400);
        echo json_encode(["message" => "Nenhum campo válido para atualizar"]);
        return;
    }

    $sql = "UPDATE Turma SET " . implode(", ", $set_clauses) . " WHERE id = ?";
    $params[] = $id;
    $types .= "i";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            http_response_code(200);
            echo json_encode(["message" => "Turma atualizada com sucesso"]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Turma não encontrada ou nada foi alterado"]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erro ao atualizar turma: " . $stmt->error]);
    }
    $stmt->close();
}

function handleDeleteTurma($conn)
{
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["message" => "ID da turma é obrigatório para exclusão"]);
        return;
    }
    $id = intval($_GET['id']);

    $stmt = $conn->prepare("DELETE FROM Turma WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            http_response_code(200);
            echo json_encode(["message" => "Turma excluída com sucesso"]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Turma não encontrada"]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erro ao excluir turma: " . $stmt->error]);
    }
    $stmt->close();
}
