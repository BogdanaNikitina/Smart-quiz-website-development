<?php
// Настройки подключения к БД (для Open Server Panel)
$host = 'localhost';      // или '127.0.0.1'
$user = 'root';           // пользователь БД (по умолчанию root)
$password = '';           // пароль (в Open Server по умолчанию пустой)
$database = 'quiz_design';

// Подключение
$conn = new mysqli($host, $user, $password, $database);

// Проверка подключения
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Ошибка подключения к базе данных: ' . $conn->connect_error
    ]));
}

// Установка кодировки
$conn->set_charset("utf8mb4");

// Получение данных из POST-запроса
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode([
        'success' => false,
        'message' => 'Некорректные данные'
    ]);
    exit;
}

// Экранирование и подготовка данных
$room_type = isset($input['room_type']) ? $conn->real_escape_string($input['room_type']) : null;
$zones = isset($input['zones']) ? $conn->real_escape_string(json_encode($input['zones'], JSON_UNESCAPED_UNICODE)) : null;
$area = isset($input['area']) ? intval($input['area']) : null;
$style = isset($input['style']) ? $conn->real_escape_string($input['style']) : null;
$budget = isset($input['budget']) ? $conn->real_escape_string($input['budget']) : null;
$name = isset($input['name']) ? $conn->real_escape_string($input['name']) : null;
$phone = isset($input['phone']) ? $conn->real_escape_string($input['phone']) : null;
$email = isset($input['email']) ? $conn->real_escape_string($input['email']) : null;
$comment = isset($input['comment']) ? $conn->real_escape_string($input['comment']) : null;
$page_url = isset($input['page_url']) ? $conn->real_escape_string($input['page_url']) : null;
$utm_source = isset($input['utm_source']) ? $conn->real_escape_string($input['utm_source']) : null;

// Получение IP-адреса пользователя
$ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? null;

// Получение User-Agent
$user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? $conn->real_escape_string($_SERVER['HTTP_USER_AGENT']) : null;

// Проверка обязательного поля телефон
if (empty($phone)) {
    echo json_encode([
        'success' => false,
        'message' => 'Номер телефона обязателен для заполнения'
    ]);
    exit;
}

// SQL-запрос
$sql = "INSERT INTO `quiz_results` (
    `room_type`, `zones`, `area`, `style`, `budget`, 
    `name`, `phone`, `email`, `comment`, 
    `page_url`, `utm_source`, `ip_address`, `user_agent`
) VALUES (
    '$room_type', '$zones', $area, '$style', '$budget',
    '$name', '$phone', '$email', '$comment',
    '$page_url', '$utm_source', '$ip_address', '$user_agent'
)";

if ($conn->query($sql) === TRUE) {
    $insert_id = $conn->insert_id;
    echo json_encode([
        'success' => true,
        'message' => 'Заявка успешно сохранена',
        'id' => $insert_id
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка при сохранении: ' . $conn->error
    ]);
}

$conn->close();
?>