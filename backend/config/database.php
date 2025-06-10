<?php
/**
 * Configuration de la base de données MySQL
 * ABK Review Application
 */

// Charger la configuration selon l'environnement
if (file_exists(__DIR__ . '/config.prod.php')) {
    require_once __DIR__ . '/config.prod.php';
} else {
    // Configuration de développement par défaut
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'abk_review');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('JWT_SECRET', 'votre_cle_secrete_a_changer_en_production');
    define('JWT_EXPIRATION', 3600 * 24);
    define('APP_URL', 'http://localhost');
    define('API_URL', APP_URL . '/backend/api');
    define('ENVIRONMENT', 'development');
    date_default_timezone_set('Europe/Paris');
}

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        $this->host = DB_HOST;
        $this->db_name = DB_NAME;
        $this->username = DB_USER;
        $this->password = DB_PASS;
    }

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

// Affichage des erreurs selon l'environnement
if (ENVIRONMENT === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/../logs/errors.log');
}