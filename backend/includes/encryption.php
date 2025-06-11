<?php
/**
 * Fonctions de chiffrement/déchiffrement pour sécuriser les tokens
 * Utilise AES-256-CBC pour un chiffrement fort
 */

// Clé et IV doivent être définis dans les variables d'environnement
define('ENCRYPTION_KEY', $_ENV['ENCRYPTION_KEY'] ?? 'your-32-character-encryption-key');
define('ENCRYPTION_IV', $_ENV['ENCRYPTION_IV'] ?? 'your-16-char-iv!');

/**
 * Chiffre une chaîne avec AES-256-CBC
 * 
 * @param string $data Les données à chiffrer
 * @return string Les données chiffrées en base64
 */
function encrypt($data) {
    if (empty($data)) {
        return '';
    }
    
    $encrypted = openssl_encrypt(
        $data,
        'AES-256-CBC',
        ENCRYPTION_KEY,
        0,
        ENCRYPTION_IV
    );
    
    if ($encrypted === false) {
        throw new Exception('Erreur lors du chiffrement');
    }
    
    return $encrypted;
}

/**
 * Déchiffre une chaîne chiffrée avec AES-256-CBC
 * 
 * @param string $encryptedData Les données chiffrées en base64
 * @return string Les données déchiffrées
 */
function decrypt($encryptedData) {
    if (empty($encryptedData)) {
        return '';
    }
    
    $decrypted = openssl_decrypt(
        $encryptedData,
        'AES-256-CBC',
        ENCRYPTION_KEY,
        0,
        ENCRYPTION_IV
    );
    
    if ($decrypted === false) {
        throw new Exception('Erreur lors du déchiffrement');
    }
    
    return $decrypted;
}

/**
 * Génère une clé de chiffrement sécurisée
 * À utiliser une seule fois lors de l'installation
 * 
 * @return array Un tableau contenant la clé et l'IV
 */
function generateEncryptionKeys() {
    return [
        'key' => bin2hex(random_bytes(16)), // 32 caractères hex
        'iv' => bin2hex(random_bytes(8))    // 16 caractères hex
    ];
}

/**
 * Vérifie que les clés de chiffrement sont correctement configurées
 * 
 * @return bool True si les clés sont valides
 */
function validateEncryptionConfig() {
    if (strlen(ENCRYPTION_KEY) !== 32) {
        error_log("ENCRYPTION_KEY doit faire exactement 32 caractères");
        return false;
    }
    
    if (strlen(ENCRYPTION_IV) !== 16) {
        error_log("ENCRYPTION_IV doit faire exactement 16 caractères");
        return false;
    }
    
    // Test de chiffrement/déchiffrement
    try {
        $testData = "test_encryption";
        $encrypted = encrypt($testData);
        $decrypted = decrypt($encrypted);
        
        if ($decrypted !== $testData) {
            error_log("Échec du test de chiffrement/déchiffrement");
            return false;
        }
    } catch (Exception $e) {
        error_log("Erreur de configuration du chiffrement: " . $e->getMessage());
        return false;
    }
    
    return true;
}

/**
 * Chiffre un tableau de données sensibles
 * 
 * @param array $data Tableau associatif de données
 * @param array $fieldsToEncrypt Liste des champs à chiffrer
 * @return array Le tableau avec les champs spécifiés chiffrés
 */
function encryptSensitiveFields($data, $fieldsToEncrypt = ['access_token', 'refresh_token']) {
    foreach ($fieldsToEncrypt as $field) {
        if (isset($data[$field]) && !empty($data[$field])) {
            $data[$field] = encrypt($data[$field]);
        }
    }
    return $data;
}

/**
 * Déchiffre un tableau de données sensibles
 * 
 * @param array $data Tableau associatif de données
 * @param array $fieldsToDecrypt Liste des champs à déchiffrer
 * @return array Le tableau avec les champs spécifiés déchiffrés
 */
function decryptSensitiveFields($data, $fieldsToDecrypt = ['access_token', 'refresh_token']) {
    foreach ($fieldsToDecrypt as $field) {
        if (isset($data[$field]) && !empty($data[$field])) {
            try {
                $data[$field] = decrypt($data[$field]);
            } catch (Exception $e) {
                // En cas d'erreur, on garde la valeur originale
                error_log("Erreur déchiffrement du champ $field: " . $e->getMessage());
            }
        }
    }
    return $data;
}