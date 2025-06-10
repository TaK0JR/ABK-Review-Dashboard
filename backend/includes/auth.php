<?php
/**
 * Gestion de l'authentification JWT
 * ABK Review Application
 */

require_once __DIR__ . '/../config/database.php';

class Auth {
    private $db;
    private $secret_key;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->secret_key = JWT_SECRET;
    }
    
    /**
     * Générer un token JWT
     */
    public function generateJWT($user) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'is_admin' => $user['is_admin'],
            'exp' => time() + JWT_EXPIRATION
        ]);
        
        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $this->secret_key, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }
    
    /**
     * Vérifier et décoder un token JWT
     */
    public function verifyJWT($jwt) {
        try {
            $tokenParts = explode('.', $jwt);
            if (count($tokenParts) != 3) {
                return false;
            }
            
            $header = base64_decode($tokenParts[0]);
            $payload = base64_decode($tokenParts[1]);
            $signatureProvided = $tokenParts[2];
            
            $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
            $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
            
            $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $this->secret_key, true);
            $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
            
            if ($base64Signature !== $signatureProvided) {
                return false;
            }
            
            $payloadData = json_decode($payload, true);
            
            // Vérifier l'expiration
            if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
                return false;
            }
            
            return $payloadData;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Obtenir le token depuis les headers
     */
    public function getBearerToken() {
        $headers = $this->getAuthorizationHeader();
        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }
    
    /**
     * Obtenir le header Authorization
     */
    private function getAuthorizationHeader() {
        $headers = null;
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }
        return $headers;
    }
    
    /**
     * Middleware pour vérifier l'authentification
     */
    public function authenticate() {
        $jwt = $this->getBearerToken();
        
        if (!$jwt) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Token manquant'
            ]);
            exit();
        }
        
        $userData = $this->verifyJWT($jwt);
        
        if (!$userData) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Token invalide ou expiré'
            ]);
            exit();
        }
        
        return $userData;
    }
    
    /**
     * Middleware pour vérifier les droits admin
     */
    public function requireAdmin() {
        $userData = $this->authenticate();
        
        if (!$userData['is_admin']) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Accès refusé : droits administrateur requis'
            ]);
            exit();
        }
        
        return $userData;
    }
    
    /**
     * Hasher un mot de passe
     */
    public function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT);
    }
    
    /**
     * Vérifier un mot de passe
     */
    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
}