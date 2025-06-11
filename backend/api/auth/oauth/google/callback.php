<?php
require_once '../../../config/database.php';
require_once '../../../config/env.php';
require_once '../../../includes/auth.php';
require_once '../../../includes/encryption.php';

session_start();

// Vérifier l'authentification
if (!isset($_SESSION['user_id'])) {
    header('Location: /login');
    exit;
}

$userId = $_SESSION['user_id'];

// Configuration Google OAuth
define('GOOGLE_CLIENT_ID', $_ENV['GOOGLE_CLIENT_ID'] ?? '');
define('GOOGLE_CLIENT_SECRET', $_ENV['GOOGLE_CLIENT_SECRET'] ?? '');
define('GOOGLE_REDIRECT_URI', $_ENV['APP_URL'] . '/api/oauth/google/callback.php');

// Vérifier le state token (protection CSRF)
if (!isset($_GET['state']) || $_GET['state'] !== $_SESSION['oauth_state']) {
    header('Location: /connections?error=invalid_state');
    exit;
}

// Vérifier si on a reçu un code d'autorisation
if (!isset($_GET['code'])) {
    header('Location: /connections?error=no_code');
    exit;
}

try {
    // Étape 2 : Échanger le code contre des tokens
    $tokenUrl = 'https://oauth2.googleapis.com/token';
    $postData = [
        'code' => $_GET['code'],
        'client_id' => GOOGLE_CLIENT_ID,
        'client_secret' => GOOGLE_CLIENT_SECRET,
        'redirect_uri' => GOOGLE_REDIRECT_URI,
        'grant_type' => 'authorization_code'
    ];
    
    $ch = curl_init($tokenUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('Erreur lors de l\'échange du code: ' . $response);
    }
    
    $tokens = json_decode($response, true);
    
    if (!isset($tokens['access_token'])) {
        throw new Exception('Token d\'accès non reçu');
    }
    
    // Étape 3 : Récupérer les informations du profil Google
    $profileUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
    $ch = curl_init($profileUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $tokens['access_token']
    ]);
    
    $profileResponse = curl_exec($ch);
    $profileData = json_decode($profileResponse, true);
    curl_close($ch);
    
    // Étape 4 : Récupérer les comptes Google Business
    $businessUrl = 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts';
    $ch = curl_init($businessUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $tokens['access_token']
    ]);
    
    $businessResponse = curl_exec($ch);
    $businessData = json_decode($businessResponse, true);
    curl_close($ch);
    
    // Préparer les données du compte
    $accountName = $profileData['name'] ?? $profileData['email'] ?? 'Compte Google';
    $accountId = $profileData['id'] ?? uniqid('google_');
    
    // Données supplémentaires à stocker
    $accountData = [
        'email' => $profileData['email'] ?? null,
        'name' => $profileData['name'] ?? null,
        'picture' => $profileData['picture'] ?? null,
        'business_accounts' => $businessData['accounts'] ?? []
    ];
    
    // Calculer la date d'expiration
    $expiresAt = date('Y-m-d H:i:s', time() + ($tokens['expires_in'] ?? 3600));
    
    // Chiffrer les tokens
    $encryptedAccessToken = encrypt($tokens['access_token']);
    $encryptedRefreshToken = isset($tokens['refresh_token']) ? encrypt($tokens['refresh_token']) : null;
    
    // Étape 5 : Sauvegarder la connexion dans la base de données
    global $pdo;
    
    // Vérifier si cette connexion existe déjà
    $checkSql = "SELECT id FROM platform_connections 
                 WHERE user_id = ? AND platform = 'google_business' AND account_id = ?";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([$userId, $accountId]);
    $existingConnection = $checkStmt->fetch();
    
    if ($existingConnection) {
        // Mettre à jour la connexion existante
        $updateSql = "UPDATE platform_connections 
                      SET account_name = ?, 
                          access_token = ?, 
                          refresh_token = COALESCE(?, refresh_token),
                          token_expires_at = ?,
                          account_data = ?,
                          is_active = 1,
                          last_error = NULL,
                          updated_at = CURRENT_TIMESTAMP
                      WHERE id = ?";
        
        $updateStmt = $pdo->prepare($updateSql);
        $updateStmt->execute([
            $accountName,
            $encryptedAccessToken,
            $encryptedRefreshToken,
            $expiresAt,
            json_encode($accountData),
            $existingConnection['id']
        ]);
    } else {
        // Créer une nouvelle connexion
        $insertSql = "INSERT INTO platform_connections 
                      (user_id, platform, account_name, account_id, access_token, 
                       refresh_token, token_expires_at, account_data, is_active)
                      VALUES (?, 'google_business', ?, ?, ?, ?, ?, ?, 1)";
        
        $insertStmt = $pdo->prepare($insertSql);
        $insertStmt->execute([
            $userId,
            $accountName,
            $accountId,
            $encryptedAccessToken,
            $encryptedRefreshToken,
            $expiresAt,
            json_encode($accountData)
        ]);
    }
    
    // Logger l'activité
    $logSql = "INSERT INTO activity_logs (user_id, action, entity_type, details) 
               VALUES (?, 'connect', 'platform', ?)";
    $logStmt = $pdo->prepare($logSql);
    $logStmt->execute([
        $userId,
        json_encode(['platform' => 'google_business', 'account' => $accountName])
    ]);
    
    // Rediriger avec succès
    header('Location: /connections?success=google_connected');
    
} catch (Exception $e) {
    error_log('Erreur Google OAuth: ' . $e->getMessage());
    header('Location: /connections?error=connection_failed&message=' . urlencode($e->getMessage()));
}

// Nettoyer la session
unset($_SESSION['oauth_state']);