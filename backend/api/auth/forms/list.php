<?php
/**
 * API Endpoint - Lister les formulaires
 * GET /api/forms/list
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../includes/cors.php';
require_once __DIR__ . '/../../../includes/auth.php';

// Vérifier la méthode
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit();
}

// Authentification requise
$auth = new Auth();
$currentUser = $auth->authenticate();

try {
    // Connexion à la base de données
    $database = new Database();
    $conn = $database->getConnection();
    
    // Construire la requête selon les droits
    if ($currentUser['is_admin']) {
        // Admin : voir tous les formulaires
        $query = "SELECT f.*, u.email as user_email, u.full_name as user_name 
                  FROM forms f 
                  LEFT JOIN users u ON f.user_id = u.id 
                  ORDER BY f.created_at DESC";
        $stmt = $conn->prepare($query);
    } else {
        // Utilisateur normal : voir seulement ses formulaires
        $query = "SELECT * FROM forms 
                  WHERE user_id = :user_id 
                  ORDER BY created_at DESC";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':user_id', $currentUser['user_id'], PDO::PARAM_INT);
    }
    
    $stmt->execute();
    $forms = $stmt->fetchAll();
    
    // Décoder les JSON et compter les réponses
    foreach ($forms as &$form) {
        $form['questions'] = json_decode($form['questions'], true);
        $form['settings'] = json_decode($form['settings'], true);
        
        // Pour l'instant, on simule le nombre de réponses
        // TODO: Implémenter une table de réponses
        $form['responses_count'] = rand(0, 100);
    }
    
    echo json_encode([
        'success' => true,
        'forms' => $forms
    ]);
    
} catch (Exception $e) {
    error_log("Erreur liste formulaires: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Erreur lors de la récupération des formulaires'
    ]);
}