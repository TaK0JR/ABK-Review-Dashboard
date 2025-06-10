<?php
echo "Test de configuration\n";
echo "Répertoire actuel : " . __DIR__ . "\n";
echo "Fichier config.dev.php existe ? " . (file_exists(__DIR__ . '/config/config.dev.php') ? 'OUI' : 'NON') . "\n";

// Charger la config
require_once __DIR__ . '/config/database.php';

echo "ENVIRONMENT : " . (defined('ENVIRONMENT') ? ENVIRONMENT : 'NON DÉFINI') . "\n";
echo "DB_HOST : " . (defined('DB_HOST') ? DB_HOST : 'NON DÉFINI') . "\n";
echo "DB_PORT : " . (defined('DB_PORT') ? DB_PORT : 'NON DÉFINI') . "\n";