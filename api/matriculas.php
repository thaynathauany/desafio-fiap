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
        handleGetMatricula($conn);
        break;
    case 'POST':
        handlePostMatricula($conn);
        break;
    case 'DELETE':
        handleDeleteMatricula($conn);
        break;
    default:
        http_response_code(405);
        echo json_encode(["mensagem" => "Método não permitido"]);
        break;
}

$conn->close();

function handleGetMatricula($conn)
{
    if (isset($_GET['all']) && $_GET['all'] === 'true') {
        $result = $conn->query("SELECT * FROM Aluno ORDER BY nome");
        $alunos = [];
        while ($row = $result->fetch_assoc()) {
            $alunos[] = $row;
        }
        echo json_encode(["data" => $alunos]);
        return;
    }

    if (isset($_GET['all']) && $_GET['all'] === 'true') {
        $result = $conn->query("SELECT * FROM Turma ORDER BY nome");
        $turmas = [];
        while ($row = $result->fetch_assoc()) {
            $turmas[] = $row;
        }
        echo json_encode(["data" => $turmas]);
        exit;
    }

    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['per_page']) ? intval($_GET['per_page']) : 10;
    $offset = ($page - 1) * $limit;

    $search = isset($_GET['nome']) ? "%" . $conn->real_escape_string($_GET['nome']) . "%" : null;
    $turma_id = isset($_GET['turma_id']) ? intval($_GET['turma_id']) : null;

    $where = [];
    $params = [];
    $types = '';

    if ($search) {
        $where[] = "(a.nome LIKE ? OR t.nome LIKE ?)";
        $params[] = $search;
        $params[] = $search;
        $types .= 'ss';
    }

    if ($turma_id) {
        $where[] = "t.id = ?";
        $params[] = $turma_id;
        $types .= 'i';
    }

    $whereSQL = $where ? "WHERE " . implode(" AND ", $where) : "";

    $total = 0;

    $stmtTotal = $conn->prepare("
        SELECT COUNT(*) FROM Matricula m
        JOIN Aluno a ON m.aluno_id = a.id
        JOIN Turma t ON m.turma_id = t.id
        $whereSQL
    ");
    if ($types) $stmtTotal->bind_param($types, ...$params);
    $stmtTotal->execute();
    $stmtTotal->bind_result($total);
    $stmtTotal->fetch();
    $stmtTotal->close();

    $stmtData = $conn->prepare("
        SELECT
            m.id,
            m.data_matricula,
            a.id AS aluno_id,
            a.nome AS aluno_nome,
            t.id AS turma_id,
            t.nome AS turma_nome
        FROM Matricula m
        JOIN Aluno a ON m.aluno_id = a.id
        JOIN Turma t ON m.turma_id = t.id
        $whereSQL
        ORDER BY a.nome ASC
        LIMIT ? OFFSET ?
    ");

    $types .= 'ii';
    $params[] = $limit;
    $params[] = $offset;

    $stmtData->bind_param($types, ...$params);
    $stmtData->execute();
    $result = $stmtData->get_result();

    $matriculas = [];
    while ($row = $result->fetch_assoc()) {
        $matriculas[] = $row;
    }

    echo json_encode([
        "data" => $matriculas,
        "total" => $total,
        "current_page" => $page,
        "per_page" => $limit,
        "last_page" => ceil($total / $limit)
    ]);

    $stmtData->close();
}

function handlePostMatricula($conn)
{
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['aluno_id'], $data['turma_id'])) {
        http_response_code(400);
        echo json_encode(["mensagem" => "Campos obrigatórios: aluno_id e turma_id"]);
        return;
    }

    $aluno_id = intval($data['aluno_id']);
    $turma_id = intval($data['turma_id']);

    try {
        $stmt = $conn->prepare("INSERT INTO Matricula (aluno_id, turma_id) VALUES (?, ?)");
        $stmt->bind_param("ii", $aluno_id, $turma_id);
        $stmt->execute();

        http_response_code(201);
        echo json_encode(["mensagem" => "Matrícula realizada com sucesso", "id" => $stmt->insert_id]);
        $stmt->close();
    } catch (mysqli_sql_exception $e) {
        if ($e->getCode() == 1062) {
            http_response_code(400);
            echo json_encode(["mensagem" => "Este aluno já está matriculado nessa turma."]);
        } else {
            http_response_code(500);
            echo json_encode(["mensagem" => "Erro ao criar matrícula: " . $e->getMessage()]);
        }
    }
}

function handleDeleteMatricula($conn)
{
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["mensagem" => "ID da matrícula é obrigatório para exclusão"]);
        return;
    }

    $id = intval($_GET['id']);

    $stmt = $conn->prepare("DELETE FROM Matricula WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            http_response_code(200);
            echo json_encode(["mensagem" => "Matrícula excluída com sucesso"]);
        } else {
            http_response_code(404);
            echo json_encode(["mensagem" => "Matrícula não encontrada"]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["mensagem" => "Erro ao excluir matrícula: " . $stmt->error]);
    }

    $stmt->close();
}
