<?php
/**
 * Routeur pour le serveur PHP intégré
 * Gère les requêtes OPTIONS et route vers les bons endpoints
 */

// Si c'est un fichier statique existant, le servir directement
if (file_exists(__DIR__ . $_SERVER['REQUEST_URI']) && 
    is_file(__DIR__ . $_SERVER['REQUEST_URI'])) {
    return false;
}

// Parser l'URL
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Routes de l'API
$routes = [
    '/api/' => '/api/index.php',
    '/api/auth/login' => '/api/auth/login.php',
    '/api/auth/logout' => '/api/auth/logout.php',
    '/api/auth/forms/list' => '/api/auth/forms/list.php',
    '/api/auth/forms/create' => '/api/auth/forms/create.php',
    '/api/auth/forms/update' => '/api/auth/forms/update.php',
    '/api/auth/forms/delete' => '/api/auth/forms/delete.php',
    '/api/auth/users/list' => '/api/auth/users/list.php',
    '/api/auth/users/create' => '/api/auth/users/create.php',
    '/api/auth/users/update' => '/api/auth/users/update.php',
    '/api/auth/users/delete' => '/api/auth/users/delete.php',
];

// Trouver la route correspondante
foreach ($routes as $route => $file) {
    if ($uri === $route) {
        $_SERVER['SCRIPT_NAME'] = $file;
        require __DIR__ . $file;
        return true;
    }
}

// Si aucune route ne correspond, retourner 404
http_response_code(404);
echo json_encode(['error' => 'Endpoint not found']);