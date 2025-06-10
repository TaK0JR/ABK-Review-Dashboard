<?php
/**
 * API Endpoint - Créer un utilisateur (Admin uniquement)
 * POST /api/users/create
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../includes/cors.php';
require_once __DIR__ . '/../../../includes/auth.php';

// Vérifier la méthode
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit();
}

// Authentification admin requise
$auth = new Auth();
$currentUser = $auth->requireAdmin();

// Récupérer les données JSON
$data = json_decode(file_get_contents('php://input'), true);

// Validation des données
$required = ['email', 'password', 'full_name'];
foreach ($required as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => "Le champ $field est requis"
        ]);
        exit();
    }
}

// Sanitization
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$password = $data['password'];
$full_name = htmlspecialchars($data['full_name'], ENT_QUOTES, 'UTF-8');
$company_name = isset($data['company_name']) ? htmlspecialchars($data['company_name'], ENT_QUOTES, 'UTF-8') : null;
$is_admin = isset($data['is_admin']) ? (bool)$data['is_admin'] : false;

// Validation email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Email invalide'
    ]);
    exit();
}

// Validation mot de passe (min 6 caractères)
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Le mot de passe doit contenir au moins 6 caractères'
    ]);
    exit();
}

try {
    // Connexion à la base de données
    $database = new Database();
    $conn = $database->getConnection();
    
    // Vérifier si l'email existe déjà
    $checkQuery = "SELECT id FROM users WHERE email = :email";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':email', $email);
    $checkStmt->execute();
    
    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            'success' => false, 
            'message' => 'Cet email est déjà utilisé'
        ]);
        exit();
    }
    
    // Hasher le mot de passe
    $hashedPassword = $auth->hashPassword($password);
    
    // Insérer le nouvel utilisateur
    $query = "INSERT INTO users (email, password, full_name, company_name, is_admin) 
              VALUES (:email, :password, :full_name, :company_name, :is_admin)";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':full_name', $full_name);
    $stmt->bindParam(':company_name', $company_name);
    $stmt->bindParam(':is_admin', $is_admin, PDO::PARAM_BOOL);
    
    if ($stmt->execute()) {
        $userId = $conn->lastInsertId();
        
        // Log de l'action
        error_log("Nouvel utilisateur créé: ID=$userId, Email=$email, Admin=$is_admin par User={$currentUser['email']}");
        
        echo json_encode([
            'success' => true,
            'message' => 'Utilisateur créé avec succès',
            'user' => [
                'id' => $userId,
                'email' => $email,
                'full_name' => $full_name,
                'company_name' => $company_name,
                'is_admin' => $is_admin
            ]
        ]);
    } else {
        throw new Exception("Erreur lors de la création de l'utilisateur");
    }
    
} catch (Exception $e) {
    error_log("Erreur création utilisateur: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Erreur lors de la création de l\'utilisateur'
    ]);
}