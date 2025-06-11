<?php
require_once '../../../config/database.php';
require_once '../../../config/env.php';
require_once '../../../includes/auth.php';
require_once '../../../includes/encryption.php';

session_start();

// Vérifier l'authentification
if (!isset($_SESSION['user_id'])) {
    header('Location: /login?redirect=' . urlencode($_SERVER['REQUEST_URI']));
    exit;
}

$userId = $_SESSION['user_id'];

// Configuration Google OAuth
define('GOOGLE_CLIENT_ID', $_ENV['GOOGLE_CLIENT_ID'] ?? '');
define('GOOGLE_CLIENT_SECRET', $_ENV['GOOGLE_CLIENT_SECRET'] ?? '');
define('GOOGLE_REDIRECT_URI', $_ENV['APP_URL'] . '/api/oauth/google/callback.php');

// Étape 1 : Rediriger vers Google pour l'autorisation
if (!isset($_GET['code'])) {
    // Générer un state token pour la sécurité CSRF
    $_SESSION['oauth_state'] = bin2hex(random_bytes(16));
    
    $params = [
        'client_id' => GOOGLE_CLIENT_ID,
        'redirect_uri' => GOOGLE_REDIRECT_URI,
        'response_type' => 'code',
        'scope' => 'https://www.googleapis.com/auth/business.manage openid email profile',
        'access_type' => 'offline', // Pour obtenir un refresh token
        'prompt' => 'consent', // Force le consentement pour obtenir le refresh token
        'state' => $_SESSION['oauth_state']
    ];
    
    $authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
    header('Location: ' . $authUrl);
    exit;
}

// Si on arrive ici, c'est une erreur
header('Location: /connections?error=oauth_failed');
exit;