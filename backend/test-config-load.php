<?php
echo "=== TEST CHARGEMENT CONFIG ===\n\n";

// 1. Vérifier l'existence des fichiers
echo "1. Vérification des fichiers:\n";
$configDir = __DIR__ . '/config/';
echo "- Répertoire config: " . (is_dir($configDir) ? "✓ existe" : "✗ n'existe pas") . "\n";
echo "- config.dev.php: " . (file_exists($configDir . 'config.dev.php') ? "✓ existe" : "✗ n'existe pas") . "\n";
echo "- config.prod.php: " . (file_exists($configDir . 'config.prod.php') ? "✓ existe" : "✗ n'existe pas") . "\n";
echo "- database.php: " . (file_exists($configDir . 'database.php') ? "✓ existe" : "✗ n'existe pas") . "\n";

// 2. Charger database.php et voir ce qui se passe
echo "\n2. Chargement de database.php:\n";
require_once __DIR__ . '/config/database.php';

// 3. Vérifier les constantes
echo "\n3. Constantes définies:\n";
$constants = [
    'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 
    'JWT_SECRET', 'ENVIRONMENT', 'APP_URL', 'API_URL'
];

foreach ($constants as $const) {
    echo "- $const: " . (defined($const) ? constant($const) : "NON DÉFINI") . "\n";
}

// 4. Test de connexion avec affichage détaillé
echo "\n4. Test de connexion MySQL:\n";
try {
    // Construire le DSN manuellement
    $dsn = "mysql:host=" . DB_HOST;
    if (defined('DB_PORT')) {
        $dsn .= ";port=" . DB_PORT;
    }
    $dsn .= ";dbname=" . DB_NAME . ";charset=utf8mb4";
    
    echo "DSN: $dsn\n";
    echo "User: " . DB_USER . "\n";
    
    $conn = new PDO($dsn, DB_USER, DB_PASS);
    echo "✓ Connexion réussie!\n";
    
    // Test simple
    $stmt = $conn->query("SELECT VERSION() as version");
    $result = $stmt->fetch();
    echo "MySQL Version: " . $result['version'] . "\n";
    
} catch (PDOException $e) {
    echo "✗ Erreur PDO: " . $e->getMessage() . "\n";
    echo "Code erreur: " . $e->getCode() . "\n";
}