<?php
/**
 * Configuration de la base de données MySQL
 * ABK Review Application
 */

class Database {
    private $host = "localhost";
    private $db_name = "abk_review";
    private $username = "root"; // À modifier selon votre configuration
    private $password = ""; // À modifier selon votre configuration
    private $conn;

    /**
     * Obtenir la connexion à la base de données
     */
    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            $this->conn = new PDO($dsn, $this->username, $this->password);
            
            // Configuration PDO
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
            
        } catch(PDOException $exception) {
            error_log("Erreur de connexion : " . $exception->getMessage());
            throw new Exception("Erreur de connexion à la base de données");
        }

        return $this->conn;
    }

    /**
     * Fermer la connexion
     */
    public function closeConnection() {
        $this->conn = null;
    }
}

// Configuration globale
define('JWT_SECRET', 'votre_cle_secrete_a_changer_en_production'); // À changer !
define('JWT_EXPIRATION', 3600 * 24); // 24 heures
define('APP_URL', 'http://localhost'); // À adapter selon votre environnement
define('API_URL', APP_URL . '/backend/api');

// Configuration d'environnement
define('ENVIRONMENT', 'development'); // 'development' ou 'production'

// Affichage des erreurs selon l'environnement
if (ENVIRONMENT === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Timezone
date_default_timezone_set('Europe/Paris');