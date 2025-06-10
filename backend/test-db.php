<?php
require_once __DIR__ . '/config/database.php';

echo "Test de connexion à la base de données\n";
echo "Configuration :\n";
echo "- Host: " . DB_HOST . "\n";
echo "- Port: " . (defined('DB_PORT') ? DB_PORT : 'non défini') . "\n";
echo "- Database: " . DB_NAME . "\n";
echo "- User: " . DB_USER . "\n";

try {
    $database = new Database();
    $conn = $database->getConnection();
    echo "\n✅ Connexion réussie !\n";
    
    // Test simple
    $stmt = $conn->query("SELECT 1");
    echo "✅ Requête test réussie\n";
    
} catch (Exception $e) {
    echo "\n❌ Erreur : " . $e->getMessage() . "\n";
}