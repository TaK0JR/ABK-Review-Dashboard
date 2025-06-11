<?php
/**
 * Script pour générer les clés de chiffrement
 * À exécuter une seule fois lors de l'installation
 */

// Génère une clé de 32 caractères pour AES-256
$encryptionKey = bin2hex(random_bytes(16)); // 32 caractères hexadécimaux

// Génère un IV de 16 caractères
$encryptionIV = bin2hex(random_bytes(8)); // 16 caractères hexadécimaux

echo "=== CLÉS DE CHIFFREMENT GÉNÉRÉES ===\n\n";
echo "Copiez ces lignes dans votre fichier .env :\n\n";
echo "ENCRYPTION_KEY=" . $encryptionKey . "\n";
echo "ENCRYPTION_IV=" . $encryptionIV . "\n\n";
echo "⚠️  IMPORTANT : Ces clés sont uniques et sécurisées.\n";
echo "Ne les partagez JAMAIS et ne les commitez pas dans Git !\n";