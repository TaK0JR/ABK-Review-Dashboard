<?php
// Configuration de développement avec Laragon
define('DB_HOST', 'localhost');
define('DB_PORT', '3306'); // Port par défaut de MySQL dans Laragon
define('DB_NAME', 'abk_review_local');
define('DB_USER', 'root');
define('DB_PASS', ''); // Pas de mot de passe par défaut dans Laragon

// JWT et sécurité (dev)
define('JWT_SECRET', 'dev_secret_key_2024_abk_review_local');
define('JWT_EXPIRATION', 3600 * 24);

// URLs locales
define('APP_URL', 'http://localhost:5173');
define('API_URL', 'http://localhost:8000');

// Environnement
define('ENVIRONMENT', 'development');

// Timezone
date_default_timezone_set('Europe/Paris');