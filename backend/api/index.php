<?php
/**
 * Point d'entrée principal de l'API
 * Redirige vers la documentation ou retourne les infos de base
 */

require_once __DIR__ . '/../config/database.php';

// ENSUITE charger CORS
require_once __DIR__ . '/../includes/cors.php';

// Informations de l'API
$apiInfo = [
    'name' => 'ABK Review API',
    'version' => '1.0.0',
    'endpoints' => [
        'auth' => [
            'POST /api/auth/login' => 'Connexion utilisateur',
            'POST /api/auth/logout' => 'Déconnexion (à implémenter)',
            'POST /api/auth/refresh' => 'Rafraîchir le token (à implémenter)'
        ],
        'users' => [
            'GET /api/users/list' => 'Liste des utilisateurs (Admin)',
            'POST /api/users/create' => 'Créer un utilisateur (Admin)',
            'PUT /api/users/update' => 'Modifier un utilisateur (à implémenter)',
            'DELETE /api/users/delete' => 'Supprimer un utilisateur (à implémenter)'
        ],
        'forms' => [
            'GET /api/forms/list' => 'Liste des formulaires',
            'POST /api/forms/create' => 'Créer un formulaire',
            'GET /api/forms/get' => 'Obtenir un formulaire (à implémenter)',
            'PUT /api/forms/update' => 'Modifier un formulaire (à implémenter)',
            'DELETE /api/forms/delete' => 'Supprimer un formulaire (à implémenter)'
        ],
        'campaigns' => [
            'À implémenter...'
        ],
        'gifts' => [
            'À implémenter...'
        ],
        'clients' => [
            'À implémenter...'
        ]
    ],
    'authentication' => 'Bearer Token (JWT)',
    'documentation' => 'https://abk-review.com/api/docs'
];

// Retourner les informations
echo json_encode($apiInfo, JSON_PRETTY_PRINT);