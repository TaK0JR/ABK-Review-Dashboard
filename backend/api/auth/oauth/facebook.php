<?php
require_once '../../config/database.php';
require_once '../../config/env.php';
require_once '../../includes/auth.php';
require_once '../../includes/encryption.php';

session_start();

// Vérifier l'authentification
if (!isset($_SESSION['user_id'])) {
    header('Location: /login?redirect=' . urlencode($_SERVER['REQUEST_URI']));
    exit;
}

$userId = $_SESSION['user_id'];

// Configuration Facebook OAuth
define('FACEBOOK_APP_ID', $_ENV['FACEBOOK_APP_ID'] ?? '');
define('FACEBOOK_APP_SECRET', $_ENV['FACEBOOK_APP_SECRET'] ?? '');
define('FACEBOOK_REDIRECT_URI', $_ENV['APP_URL'] . '/api/oauth/facebook-callback.php');

// Gestion du callback Facebook
if (isset($_GET['code'])) {
    handleFacebookCallback();
    exit;
}

// Rediriger vers Facebook pour l'autorisation
$_SESSION['oauth_state'] = bin2hex(random_bytes(16));

$params = [
    'client_id' => FACEBOOK_APP_ID,
    'redirect_uri' => FACEBOOK_REDIRECT_URI,
    'state' => $_SESSION['oauth_state'],
    'scope' => 'pages_show_list,pages_read_engagement,pages_manage_metadata,pages_read_user_content'
];

$authUrl = 'https://www.facebook.com/v18.0/dialog/oauth?' . http_build_query($params);
header('Location: ' . $authUrl);
exit;

/**
 * Gérer le callback de Facebook
 */
function handleFacebookCallback() {
    global $pdo, $userId;
    
    // Vérifier le state
    if (!isset($_GET['state']) || $_GET['state'] !== $_SESSION['oauth_state']) {
        header('Location: /connections?error=invalid_state');
        exit;
    }
    
    try {
        // Échanger le code contre un token
        $tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
        $params = [
            'client_id' => FACEBOOK_APP_ID,
            'client_secret' => FACEBOOK_APP_SECRET,
            'redirect_uri' => FACEBOOK_REDIRECT_URI,
            'code' => $_GET['code']
        ];
        
        $ch = curl_init($tokenUrl . '?' . http_build_query($params));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);
        
        $tokens = json_decode($response, true);
        
        if (!isset($tokens['access_token'])) {
            throw new Exception('Token non reçu: ' . ($tokens['error']['message'] ?? 'Erreur inconnue'));
        }
        
        // Récupérer le profil utilisateur
        $profileUrl = 'https://graph.facebook.com/v18.0/me?fields=id,name,email';
        $ch = curl_init($profileUrl . '&access_token=' . $tokens['access_token']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $profileResponse = curl_exec($ch);
        curl_close($ch);
        
        $profile = json_decode($profileResponse, true);
        
        // Récupérer les pages Facebook
        $pagesUrl = 'https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,fan_count';
        $ch = curl_init($pagesUrl . '&access_token=' . $tokens['access_token']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $pagesResponse = curl_exec($ch);
        curl_close($ch);
        
        $pagesData = json_decode($pagesResponse, true);
        
        // Si l'utilisateur a des pages, on stocke chaque page comme une connexion
        if (!empty($pagesData['data'])) {
            foreach ($pagesData['data'] as $page) {
                saveFacebookConnection($page, $profile);
            }
        } else {
            // Sinon, on sauvegarde le profil personnel
            $connectionData = [
                'id' => $profile['id'],
                'name' => $profile['name'] ?? 'Profil Facebook',
                'access_token' => $tokens['access_token']
            ];
            saveFacebookConnection($connectionData, $profile);
        }
        
        header('Location: /connections?success=facebook_connected');
        
    } catch (Exception $e) {
        error_log('Erreur Facebook OAuth: ' . $e->getMessage());
        header('Location: /connections?error=connection_failed');
    }
    
    unset($_SESSION['oauth_state']);
}

/**
 * Sauvegarder une connexion Facebook
 */
function saveFacebookConnection($pageData, $userProfile) {
    global $pdo, $userId;
    
    $accountName = $pageData['name'];
    $accountId = $pageData['id'];
    $accessToken = encrypt($pageData['access_token']);
    
    // Données supplémentaires
    $accountData = [
        'page_id' => $pageData['id'],
        'page_name' => $pageData['name'],
        'fan_count' => $pageData['fan_count'] ?? null,
        'user_name' => $userProfile['name'] ?? null,
        'user_id' => $userProfile['id'] ?? null
    ];
    
    // Facebook tokens n'expirent pas pour les pages
    $expiresAt = date('Y-m-d H:i:s', strtotime('+60 days'));
    
    // Vérifier si la connexion existe
    $checkSql = "SELECT id FROM platform_connections 
                 WHERE user_id = ? AND platform = 'facebook' AND account_id = ?";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([$userId, $accountId]);
    $existing = $checkStmt->fetch();
    
    if ($existing) {
        // Mettre à jour
        $updateSql = "UPDATE platform_connections 
                      SET account_name = ?, access_token = ?, token_expires_at = ?,
                          account_data = ?, is_active = 1, updated_at = CURRENT_TIMESTAMP
                      WHERE id = ?";
        $updateStmt = $pdo->prepare($updateSql);
        $updateStmt->execute([
            $accountName, $accessToken, $expiresAt, 
            json_encode($accountData), $existing['id']
        ]);
    } else {
        // Créer
        $insertSql = "INSERT INTO platform_connections 
                      (user_id, platform, account_name, account_id, access_token, 
                       token_expires_at, account_data, is_active)
                      VALUES (?, 'facebook', ?, ?, ?, ?, ?, 1)";
        $insertStmt = $pdo->prepare($insertSql);
        $insertStmt->execute([
            $userId, $accountName, $accountId, $accessToken, 
            $expiresAt, json_encode($accountData)
        ]);
    }
}