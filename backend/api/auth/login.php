<?php
/**
 * API Endpoint - Login
 * POST /api/auth/login
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../error.log');


// IMPORTANT : Charger d'abord la config, puis CORS
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/auth.php';


error_log("Login.php - Includes chargés");


// Vérifier la méthode APRÈS avoir géré CORS
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit();
}


// Récupérer les données JSON
$data = json_decode(file_get_contents('php://input'), true);

// Validation des données
if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Email et mot de passe requis'
    ]);
    exit();
}

$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$password = $data['password'];

// Validation email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Email invalide'
    ]);
    exit();
}

try {
    // Connexion à la base de données
    $database = new Database();
    $conn = $database->getConnection();
    $auth = new Auth();
    
    // Cas spécial : compte démo
    if ($email === 'demo@abk-review.com' && $password === 'demo123') {
        $user = [
            'id' => 0,
            'email' => 'demo@abk-review.com',
            'full_name' => 'Compte Démo',
            'company_name' => 'ABK Review',
            'is_admin' => false
        ];
        
        $token = $auth->generateJWT($user);
        
        echo json_encode([
            'success' => true,
            'message' => 'Connexion réussie (mode démo)',
            'token' => $token,
            'user' => $user
        ]);
        exit();
    }
    
    // Rechercher l'utilisateur
    $query = "SELECT id, email, password, full_name, company_name, is_admin 
              FROM users 
              WHERE email = :email";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false, 
            'message' => 'Email ou mot de passe incorrect'
        ]);
        exit();
    }
    
    // Vérifier le mot de passe
    if (!$auth->verifyPassword($password, $user['password'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false, 
            'message' => 'Email ou mot de passe incorrect'
        ]);
        exit();
    }
    
    // Supprimer le mot de passe de la réponse
    unset($user['password']);
    
    // Convertir is_admin en boolean
    $user['is_admin'] = (bool)$user['is_admin'];
    
    // Générer le token JWT
    $token = $auth->generateJWT($user);
    
    // Réponse succès
    echo json_encode([
        'success' => true,
        'message' => 'Connexion réussie',
        'token' => $token,
        'user' => $user
    ]);
    
} catch (Exception $e) {
    error_log("Erreur login: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Erreur serveur'
    ]);
}