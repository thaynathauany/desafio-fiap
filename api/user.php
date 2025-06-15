<!-- BONUS -->

<?php
require_once __DIR__ . '/db_connect.php';
$conn = connectDB();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$conn = connectDB();

switch ($method) {
    case 'POST':
        handlePostUser($conn);
        break;
    default:
        http_response_code(405);
        echo json_encode(["message" => "Método não permitido"]);
        break;
}

function handlePostUser($conn)
{
    $data = json_decode(file_get_contents("php://input"), true);

    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    $email    = $data['email'] ?? '';
    $role     = $data['role'] ?? 'admin';

    if (!$username || !$password || !$email) {
        http_response_code(400);
        echo json_encode(["error" => "Todos os campos (username, password, email) são obrigatórios."]);
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO User (username, password, email, role) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $username, $hashedPassword, $email, $role);

    try {
        $stmt->execute();
        echo json_encode([
            "success" => true,
            "message" => "Usuário inserido com sucesso.",
            "user_id" => $stmt->insert_id
        ]);
    } catch (mysqli_sql_exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Erro ao inserir usuário: " . $e->getMessage()]);
    }
}
