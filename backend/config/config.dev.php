<?php
// Configuration de développement avec base de production via tunnel SSH
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3307');  // Port du tunnel SSH
define('DB_NAME', 'dash-abk-review');
define('DB_USER', 'dash-abk-review');
define('DB_PASS', 'cyzBR8HiuNDR2d4PAxO9!');

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