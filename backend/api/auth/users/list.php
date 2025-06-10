<?php
/**
 * API Endpoint - Lister les utilisateurs (Admin uniquement)
 * GET /api/users/list
 */

require_once '../../config/database.php';
require_once '../../includes/cors.php';
require_once '../../includes/auth.php';

// Vérifier la méthode
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit();
}

// Authentification admin requise
$auth = new Auth();
$currentUser = $auth->requireAdmin();

try {
    // Connexion à la base de données
    $database = new Database();
    $conn = $database->getConnection();
    
    // Paramètres de pagination
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = ($page - 1) * $limit;
    
    // Paramètres de recherche
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    
    // Compter le total d'utilisateurs
    $countQuery = "SELECT COUNT(*) as total FROM users";
    if ($search) {
        $countQuery .= " WHERE email LIKE :search OR full_name LIKE :search OR company_name LIKE :search";
    }
    
    $countStmt = $conn->prepare($countQuery);
    if ($search) {
        $searchParam = "%$search%";
        $countStmt->bindParam(':search', $searchParam);
    }
    $countStmt->execute();
    $total = $countStmt->fetch()['total'];
    
    // Récupérer les utilisateurs
    $query = "SELECT id, email, full_name, company_name, is_admin, created_at, updated_at 
              FROM users";
    
    if ($search) {
        $query .= " WHERE email LIKE :search OR full_name LIKE :search OR company_name LIKE :search";
    }
    
    $query .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
    
    $stmt = $conn->prepare($query);
    if ($search) {
        $stmt->bindParam(':search', $searchParam);
    }
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $users = $stmt->fetchAll();
    
    // Convertir is_admin en boolean
    foreach ($users as &$user) {
        $user['is_admin'] = (bool)$user['is_admin'];
    }
    
    // Calculer la pagination
    $totalPages = ceil($total / $limit);
    
    // Réponse
    echo json_encode([
        'success' => true,
        'data' => $users,
        'pagination' => [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => $totalPages
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Erreur liste utilisateurs: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Erreur lors de la récupération des utilisateurs'
    ]);
}