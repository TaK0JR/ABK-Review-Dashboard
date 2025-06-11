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

// Instagram utilise Facebook Login pour l'authentification
// Les mêmes credentials Facebook sont utilisés
define('FACEBOOK_APP_ID', $_ENV['FACEBOOK_APP_ID'] ?? '');
define('FACEBOOK_APP_SECRET', $_ENV['FACEBOOK_APP_SECRET'] ?? '');
define('INSTAGRAM_REDIRECT_URI', $_ENV['APP_URL'] . '/api/oauth/instagram-callback.php');

// Gestion du callback
if (isset($_GET['code'])) {
    handleInstagramCallback();
    exit;
}

// Rediriger vers Facebook pour l'autorisation Instagram
$_SESSION['oauth_state'] = bin2hex(random_bytes(16));

$params = [
    'client_id' => FACEBOOK_APP_ID,
    'redirect_uri' => INSTAGRAM_REDIRECT_URI,
    'state' => $_SESSION['oauth_state'],
    'scope' => 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement,business_management'
];

$authUrl = 'https://www.facebook.com/v18.0/dialog/oauth?' . http_build_query($params);
header('Location: ' . $authUrl);
exit;

/**
 * Gérer le callback Instagram
 */
function handleInstagramCallback() {
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
            'redirect_uri' => INSTAGRAM_REDIRECT_URI,
            'code' => $_GET['code']
        ];
        
        $ch = curl_init($tokenUrl . '?' . http_build_query($params));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);
        
        $tokens = json_decode($response, true);
        
        if (!isset($tokens['access_token'])) {
            throw new Exception('Token non reçu');
        }
        
        // Récupérer les pages Facebook avec comptes Instagram liés
        $pagesUrl = 'https://graph.facebook.com/v18.0/me/accounts?fields=id,name,instagram_business_account,access_token';
        $ch = curl_init($pagesUrl . '&access_token=' . $tokens['access_token']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $pagesResponse = curl_exec($ch);
        curl_close($ch);
        
        $pages = json_decode($pagesResponse, true);
        
        if (empty($pages['data'])) {
            throw new Exception('Aucune page Facebook trouvée');
        }
        
        // Pour chaque page avec un compte Instagram
        foreach ($pages['data'] as $page) {
            if (!isset($page['instagram_business_account'])) {
                continue;
            }
            
            $instagramId = $page['instagram_business_account']['id'];
            $pageAccessToken = $page['access_token'];
            
            // Récupérer les infos du compte Instagram
            $instagramUrl = "https://graph.facebook.com/v18.0/{$instagramId}?fields=id,username,name,followers_count,media_count,profile_picture_url";
            $ch = curl_init($instagramUrl . '&access_token=' . $pageAccessToken);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $instagramResponse = curl_exec($ch);
            curl_close($ch);
            
            $instagramData = json_decode($instagramResponse, true);
            
            if (isset($instagramData['id'])) {
                saveInstagramConnection($instagramData, $pageAccessToken, $page);
            }
        }
        
        header('Location: /connections?success=instagram_connected');
        
    } catch (Exception $e) {
        error_log('Erreur Instagram OAuth: ' . $e->getMessage());
        header('Location: /connections?error=connection_failed&message=' . urlencode($e->getMessage()));
    }
    
    unset($_SESSION['oauth_state']);
}

/**
 * Sauvegarder une connexion Instagram
 */
function saveInstagramConnection($instagramData, $accessToken, $pageData) {
    global $pdo, $userId;
    
    $accountName = $instagramData['username'] ?? $instagramData['name'] ?? 'Compte Instagram';
    $accountId = $instagramData['id'];
    $encryptedToken = encrypt($accessToken);
    
    // Données du compte
    $accountData = [
        'instagram_id' => $instagramData['id'],
        'username' => $instagramData['username'] ?? null,
        'name' => $instagramData['name'] ?? null,
        'followers_count' => $instagramData['followers_count'] ?? 0,
        'media_count' => $instagramData['media_count'] ?? 0,
        'profile_picture' => $instagramData['profile_picture_url'] ?? null,
        'facebook_page_id' => $pageData['id'],
        'facebook_page_name' => $pageData['name']
    ];
    
    // Token Instagram via Facebook n'expire pas pour les pages
    $expiresAt = date('Y-m-d H:i:s', strtotime('+60 days'));
    
    // Vérifier si la connexion existe
    $checkSql = "SELECT id FROM platform_connections 
                 WHERE user_id = ? AND platform = 'instagram' AND account_id = ?";
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
            $accountName, $encryptedToken, $expiresAt, 
            json_encode($accountData), $existing['id']
        ]);
    } else {
        // Créer
        $insertSql = "INSERT INTO platform_connections 
                      (user_id, platform, account_name, account_id, access_token, 
                       token_expires_at, account_data, is_active)
                      VALUES (?, 'instagram', ?, ?, ?, ?, ?, 1)";
        $insertStmt = $pdo->prepare($insertSql);
        $insertStmt->execute([
            $userId, $accountName, $accountId, $encryptedToken, 
            $expiresAt, json_encode($accountData)
        ]);
    }
    
    // Logger l'activité
    $logSql = "INSERT INTO activity_logs (user_id, action, entity_type, details) 
               VALUES (?, 'connect', 'platform', ?)";
    $logStmt = $pdo->prepare($logSql);
    $logStmt->execute([
        $userId,
        json_encode(['platform' => 'instagram', 'account' => $accountName])
    ]);
}