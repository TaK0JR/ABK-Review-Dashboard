<?php
/**
 * API Endpoint - Créer un formulaire
 * POST /api/forms/create
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

// Authentification requise
$auth = new Auth();
$currentUser = $auth->authenticate();

// Récupérer les données JSON
$data = json_decode(file_get_contents('php://input'), true);

// Validation des données requises
if (!isset($data['name']) || empty($data['name'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Le nom du formulaire est requis'
    ]);
    exit();
}

if (!isset($data['questions']) || !is_array($data['questions']) || empty($data['questions'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Au moins une question est requise'
    ]);
    exit();
}

if (count($data['questions']) > 3) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Maximum 3 questions autorisées'
    ]);
    exit();
}

// Validation des questions
$validTypes = ['note', 'smileys', 'text'];
foreach ($data['questions'] as $index => $question) {
    if (!isset($question['text']) || empty($question['text'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => "Le texte de la question " . ($index + 1) . " est requis"
        ]);
        exit();
    }
    
    if (!isset($question['type']) || !in_array($question['type'], $validTypes)) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => "Le type de la question " . ($index + 1) . " est invalide"
        ]);
        exit();
    }
    
    if (!isset($question['required'])) {
        $data['questions'][$index]['required'] = false;
    }
}

// Validation des settings
$defaultSettings = [
    'logoUrl' => 'https://example.com/default-logo.png',
    'bannerUrl' => 'https://example.com/default-banner.jpg',
    'primaryColor' => '#3366FF',
    'backgroundColor' => '#F7F9FC',
    'redirectLowScore' => 'https://facebook.com/default',
    'redirectHighScore' => 'https://google.com/default'
];

if (!isset($data['settings'])) {
    $data['settings'] = $defaultSettings;
} else {
    // Valider les couleurs
    if (isset($data['settings']['primaryColor']) && !preg_match('/^#[0-9A-Fa-f]{6}$/', $data['settings']['primaryColor'])) {
        $data['settings']['primaryColor'] = $defaultSettings['primaryColor'];
    }
    if (isset($data['settings']['backgroundColor']) && !preg_match('/^#[0-9A-Fa-f]{6}$/', $data['settings']['backgroundColor'])) {
        $data['settings']['backgroundColor'] = $defaultSettings['backgroundColor'];
    }
    
    // Valider les URLs
    if (isset($data['settings']['redirectLowScore']) && !filter_var($data['settings']['redirectLowScore'], FILTER_VALIDATE_URL)) {
        $data['settings']['redirectLowScore'] = $defaultSettings['redirectLowScore'];
    }
    if (isset($data['settings']['redirectHighScore']) && !filter_var($data['settings']['redirectHighScore'], FILTER_VALIDATE_URL)) {
        $data['settings']['redirectHighScore'] = $defaultSettings['redirectHighScore'];
    }
    
    // Compléter avec les valeurs par défaut
    $data['settings'] = array_merge($defaultSettings, $data['settings']);
}

try {
    // Connexion à la base de données
    $database = new Database();
    $conn = $database->getConnection();
    
    // Préparer les données
    $name = htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8');
    $description = isset($data['description']) ? htmlspecialchars($data['description'], ENT_QUOTES, 'UTF-8') : null;
    $questions = json_encode($data['questions']);
    $settings = json_encode($data['settings']);
    $userId = $currentUser['user_id'];
    
    // Insérer le formulaire
    $query = "INSERT INTO forms (user_id, name, description, questions, settings) 
              VALUES (:user_id, :name, :description, :questions, :settings)";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':questions', $questions);
    $stmt->bindParam(':settings', $settings);
    
    if ($stmt->execute()) {
        $formId = $conn->lastInsertId();
        
        // Récupérer le formulaire créé avec l'URL générée
        $selectQuery = "SELECT * FROM forms WHERE id = :id";
        $selectStmt = $conn->prepare($selectQuery);
        $selectStmt->bindParam(':id', $formId);
        $selectStmt->execute();
        $form = $selectStmt->fetch();
        
        // Décoder les JSON
        $form['questions'] = json_decode($form['questions'], true);
        $form['settings'] = json_decode($form['settings'], true);
        
        echo json_encode([
            'success' => true,
            'message' => 'Formulaire créé avec succès',
            'form' => $form
        ]);
    } else {
        throw new Exception("Erreur lors de la création du formulaire");
    }
    
} catch (Exception $e) {
    error_log("Erreur création formulaire: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Erreur lors de la création du formulaire'
    ]);
}