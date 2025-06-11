<?php
require_once '../config/database.php';
require_once '../includes/auth.php';
require_once '../includes/encryption.php';

// Vérifier l'authentification
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Non autorisé']);
    exit;
}

$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '';

// Router simple
if ($method === 'GET' && $path === '') {
    // Récupérer toutes les connexions de l'utilisateur
    getPlatformConnections($userId);
} elseif ($method === 'POST' && preg_match('/^\/(\d+)\/sync$/', $path, $matches)) {
    // Synchroniser une connexion
    syncConnection($userId, (int)$matches[1]);
} elseif ($method === 'POST' && preg_match('/^\/(\d+)\/refresh-token$/', $path, $matches)) {
    // Rafraîchir le token
    refreshConnectionToken($userId, (int)$matches[1]);
} elseif ($method === 'DELETE' && preg_match('/^\/(\d+)$/', $path, $matches)) {
    // Supprimer une connexion
    deleteConnection($userId, (int)$matches[1]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint non trouvé']);
}

/**
 * Récupérer toutes les connexions de l'utilisateur
 */
function getPlatformConnections($userId) {
    global $pdo;
    
    try {
        $sql = "SELECT 
                    id,
                    user_id,
                    platform,
                    account_name,
                    account_id,
                    token_expires_at,
                    permissions,
                    account_data,
                    is_active,
                    last_sync_at,
                    last_error,
                    created_at,
                    updated_at
                FROM platform_connections
                WHERE user_id = ?
                ORDER BY created_at DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
        $connections = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Décoder les champs JSON
        foreach ($connections as &$connection) {
            $connection['permissions'] = json_decode($connection['permissions'], true);
            $connection['account_data'] = json_decode($connection['account_data'], true);
            // Convertir les booléens
            $connection['is_active'] = (bool)$connection['is_active'];
        }
        
        header('Content-Type: application/json');
        echo json_encode($connections);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur serveur']);
        error_log("Erreur getPlatformConnections: " . $e->getMessage());
    }
}

/**
 * Synchroniser les données d'une connexion
 */
function syncConnection($userId, $connectionId) {
    global $pdo;
    
    try {
        // Vérifier que la connexion appartient à l'utilisateur
        $sql = "SELECT * FROM platform_connections WHERE id = ? AND user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$connectionId, $userId]);
        $connection = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$connection) {
            http_response_code(404);
            echo json_encode(['error' => 'Connexion non trouvée']);
            return;
        }
        
        // Décrypter les tokens
        $accessToken = decrypt($connection['access_token']);
        
        // Log le début de la synchronisation
        $pdo->exec("CALL log_sync_activity($connectionId, 'reviews', 'started', 0, NULL)");
        
        try {
            // Appeler la fonction de synchronisation appropriée selon la plateforme
            switch ($connection['platform']) {
                case 'google_business':
                    $result = syncGoogleBusiness($connection, $accessToken);
                    break;
                case 'facebook':
                    $result = syncFacebook($connection, $accessToken);
                    break;
                case 'instagram':
                    $result = syncInstagram($connection, $accessToken);
                    break;
                default:
                    throw new Exception("Plateforme non supportée");
            }
            
            // Log le succès
            $itemsSynced = $result['items_synced'] ?? 0;
            $pdo->exec("CALL log_sync_activity($connectionId, 'reviews', 'success', $itemsSynced, NULL)");
            
            echo json_encode([
                'success' => true,
                'items_synced' => $itemsSynced,
                'message' => "Synchronisation réussie"
            ]);
            
        } catch (Exception $e) {
            // Log l'échec
            $errorMessage = $pdo->quote($e->getMessage());
            $pdo->exec("CALL log_sync_activity($connectionId, 'reviews', 'failed', 0, $errorMessage)");
            
            throw $e;
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
        error_log("Erreur syncConnection: " . $e->getMessage());
    }
}

/**
 * Rafraîchir le token d'une connexion
 */
function refreshConnectionToken($userId, $connectionId) {
    global $pdo;
    
    try {
        // Vérifier que la connexion appartient à l'utilisateur
        $sql = "SELECT * FROM platform_connections WHERE id = ? AND user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$connectionId, $userId]);
        $connection = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$connection) {
            http_response_code(404);
            echo json_encode(['error' => 'Connexion non trouvée']);
            return;
        }
        
        // Décrypter le refresh token
        $refreshToken = decrypt($connection['refresh_token']);
        
        // Rafraîchir le token selon la plateforme
        switch ($connection['platform']) {
            case 'google_business':
                $newTokens = refreshGoogleToken($refreshToken);
                break;
            case 'facebook':
                $newTokens = refreshFacebookToken($refreshToken);
                break;
            default:
                throw new Exception("Rafraîchissement non supporté pour cette plateforme");
        }
        
        // Chiffrer les nouveaux tokens
        $encryptedAccessToken = encrypt($newTokens['access_token']);
        $encryptedRefreshToken = isset($newTokens['refresh_token']) ? 
            encrypt($newTokens['refresh_token']) : $connection['refresh_token'];
        
        // Calculer la date d'expiration
        $expiresAt = date('Y-m-d H:i:s', time() + $newTokens['expires_in']);
        
        // Appeler la procédure stockée pour mettre à jour les tokens
        $sql = "CALL refresh_platform_token(?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $connectionId,
            $encryptedAccessToken,
            $encryptedRefreshToken,
            $expiresAt
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Token renouvelé avec succès',
            'expires_at' => $expiresAt
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
        error_log("Erreur refreshConnectionToken: " . $e->getMessage());
    }
}

/**
 * Supprimer une connexion
 */
function deleteConnection($userId, $connectionId) {
    global $pdo;
    
    try {
        // Vérifier et supprimer la connexion
        $sql = "DELETE FROM platform_connections WHERE id = ? AND user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$connectionId, $userId]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Connexion non trouvée']);
            return;
        }
        
        echo json_encode(['success' => true, 'message' => 'Connexion supprimée']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de la suppression']);
        error_log("Erreur deleteConnection: " . $e->getMessage());
    }
}

// Fonctions de synchronisation spécifiques aux plateformes
function syncGoogleBusiness($connection, $accessToken) {
    // TODO: Implémenter la synchronisation Google Business
    // Exemple simplifié
    return ['items_synced' => 5];
}

function syncFacebook($connection, $accessToken) {
    // TODO: Implémenter la synchronisation Facebook
    return ['items_synced' => 3];
}

function syncInstagram($connection, $accessToken) {
    // TODO: Implémenter la synchronisation Instagram
    return ['items_synced' => 2];
}

function refreshGoogleToken($refreshToken) {
    // TODO: Implémenter le rafraîchissement Google
    return [
        'access_token' => 'new_access_token',
        'refresh_token' => 'new_refresh_token',
        'expires_in' => 3600
    ];
}

function refreshFacebookToken($refreshToken) {
    // TODO: Implémenter le rafraîchissement Facebook
    return [
        'access_token' => 'new_access_token',
        'expires_in' => 5184000 // 60 jours
    ];
}