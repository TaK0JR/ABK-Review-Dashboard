<?php
/**
 * Configuration CORS pour l'API
 * Permet les requêtes cross-origin depuis le frontend React
 */

// Domaines autorisés
$allowed_origins = [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',  // Alternative dev
    'http://localhost',       // Local
    'https://dashboard.abk-review.com', // Production
    'https://www.dashboard.abk-review.com' // WWW production
];

// Récupérer l'origine de la requête
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Récupérer l'origine de la requête
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Si pas d'origine (accès direct), on continue sans CORS
if (!empty($origin)) {
    // Vérifier si l'origine est autorisée
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    } else if (ENVIRONMENT === 'development') {
        // En développement, autoriser toutes les origines
        header("Access-Control-Allow-Origin: *");
    } else {
        // En production, rejeter les origines non autorisées
        http_response_code(403);
        exit('Origine non autorisée');
    }
    
    // Ajouter les autres headers CORS seulement si origine présente
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
}

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Headers de sécurité supplémentaires
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");

// Content-Type par défaut pour l'API
header("Content-Type: application/json; charset=UTF-8");