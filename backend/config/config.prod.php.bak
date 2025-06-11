<?php
/**
 * Configuration de production - ABK Review Dashboard
 * Serveur dédié OVH
 * 
 * ⚠️ IMPORTANT : NE JAMAIS COMMITER CE FICHIER SUR GIT
 */

// Base de données MySQL
define('DB_HOST', 'localhost');              // localhost car sur le même serveur
define('DB_NAME', 'dash-abk-review');        // Nom de la base
define('DB_USER', 'dash-abk-review');        // Utilisateur MySQL
define('DB_PASS', 'cyzBR8HiuNDR2d4PAxO9!'); // Mot de passe MySQL

// JWT et sécurité
// ⚠️ IMPORTANT : Changez cette clé secrète !
define('JWT_SECRET', 'aBk2024$Review#Dashboard!SecureKey@' . bin2hex(random_bytes(16)));
define('JWT_EXPIRATION', 3600 * 24); // 24 heures

// URLs - Configuration pour dashboard.abk-review.com
define('APP_URL', 'https://dashboard.abk-review.com');
define('API_URL', APP_URL . '/backend/api');

// Environnement
define('ENVIRONMENT', 'production');

// Configuration PHP pour la production
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Email pour les campagnes (à configurer plus tard)
define('SMTP_HOST', 'ssl0.ovh.net');     // SMTP OVH par défaut
define('SMTP_PORT', 465);                // Port SSL
define('SMTP_SECURE', 'ssl');            // Sécurité SSL
define('SMTP_USER', '');                 // À configurer
define('SMTP_PASS', '');                 // À configurer
define('SMTP_FROM', 'noreply@abk-review.com');
define('SMTP_FROM_NAME', 'ABK Review');

// Timezone
date_default_timezone_set('Europe/Paris');

// Limites et sécurité
define('MAX_LOGIN_ATTEMPTS', 5);         // Tentatives de connexion max
define('LOGIN_LOCKOUT_TIME', 900);       // 15 minutes de blocage
define('SESSION_LIFETIME', 86400);       // 24 heures
define('API_RATE_LIMIT', 100);          // Requêtes par minute

// Options de sécurité supplémentaires
define('SECURE_COOKIES', true);          // Cookies HTTPS uniquement
define('HASH_COST', 12);                // Coût du hash bcrypt