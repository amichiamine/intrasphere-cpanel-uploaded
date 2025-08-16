<?php
// IntraSphere PHP Backend - Point d'entrée API CORRIGÉ

// Headers CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Gestion requêtes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Charger les variables d'environnement
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $_ENV[trim($name)] = trim($value);
        }
    }
}

// 2. Charger les classes essentielles - NOMS CORRECTS
require_once __DIR__ . '/../api/Config/Router.php';
require_once __DIR__ . '/../api/Config/Response.php';
require_once __DIR__ . '/../api/Config/database.php';  // Vérifier le nom exact

// 3. Initialiser le routeur
$router = new Router();

// 4. Route de santé SIMPLE
$router->get('/api/health', function() {
    Response::success([
        'status' => 'ok',
        'adapter' => 'php', 
        'version' => '1.0.0',
        'timestamp' => time()
    ]);
});

// 5. Routes authentification
$router->get('/api/auth/me', 'AuthController@me');
$router->get('/api/stats', 'AuthController@stats');
$router->get('/api/announcements', 'AnnouncementController@index');

// 6. Dispatch
try {
    $router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    Response::error('Internal server error', 500);
}
?>