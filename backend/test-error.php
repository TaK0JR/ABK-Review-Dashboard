<?php
// Activer l'affichage des erreurs
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== TEST DE CONNEXION ===\n\n";

// Test 1: Charger la config
echo "1. Chargement de la config...\n";
try {
    require_once __DIR__ . '/config/database.php';
    echo "✓ Config chargée\n";
    echo "  - DB_HOST: " . DB_HOST . "\n";
    echo "  - DB_PORT: " . (defined('DB_PORT') ? DB_PORT : 'non défini') . "\n";
    echo "  - DB_NAME: " . DB_NAME . "\n";
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n";
}

// Test 2: Créer une connexion
echo "\n2. Test de connexion à la base...\n";
try {
    $database = new Database();
    $conn = $database->getConnection();
    echo "✓ Connexion réussie\n";
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n";
}

// Test 3: Charger Auth
echo "\n3. Chargement de Auth...\n";
try {
    require_once __DIR__ . '/includes/auth.php';
    echo "✓ Auth chargé\n";
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n";
}

// Test 4: Créer une instance Auth
echo "\n4. Création d'une instance Auth...\n";
try {
    $auth = new Auth();
    echo "✓ Auth instancié\n";
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}

// Test 5: Générer un JWT
echo "\n5. Test génération JWT...\n";
try {
    $user = [
        'id' => 1,
        'email' => 'test@example.com',
        'is_admin' => false
    ];
    $token = $auth->generateJWT($user);
    echo "✓ Token généré: " . substr($token, 0, 50) . "...\n";
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n";
}