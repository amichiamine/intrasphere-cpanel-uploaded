<?php
/**
 * AuthService pour IntraSphere
 * Gestion de l'authentification et tokens JWT
 */

require_once __DIR__ . '/../Models/User.php';

class AuthService {
    private $userModel;
    private $secret;

    public function __construct() {
        $this->userModel = new User();
        $this->secret = $_ENV['JWT_SECRET'] ?? 'votre_secret';
    }

    public function login($username, $password) {
        $user = $this->userModel->findByUsername($username);
        if (!$user || !password_verify($password, $user['password'])) {
            return null;
        }
        // JWT payload
        $payload = [
            'sub' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role'],
            'iat' => time(),
            'exp' => time() + ($_ENV['SESSION_LIFETIME'] ?? 3600)
        ];
        return $this->encodeJWT($payload);
    }

    public function register($data) {
        if ($this->userModel->findByUsername($data['username'])) {
            throw new Exception('Username already taken');
        }
        if (!empty($data['email']) && $this->userModel->findByEmail($data['email'])) {
            throw new Exception('Email already used');
        }
        $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT, [
            'cost' => $_ENV['BCRYPT_ROUNDS'] ?? 12
        ]);
        $data['role'] = $data['role'] ?? 'employee';
        $userId = $this->userModel->create($data);
        return $this->userModel->findById($userId);
    }

    private function encodeJWT($payload) {
        $header = base64_encode(json_encode(['alg'=>'HS256','typ'=>'JWT']));
        $body   = base64_encode(json_encode($payload));
        $sig    = hash_hmac('sha256', "$header.$body", $this->secret, true);
        $sig    = base64_encode($sig);
        return "$header.$body.$sig";
    }

    public function decodeJWT($token) {
        list($header, $body, $sig) = explode('.', $token);
        $validSig = base64_encode(hash_hmac('sha256', "$header.$body", $this->secret, true));
        if (!hash_equals($validSig, $sig)) {
            return null;
        }
        return json_decode(base64_decode($body), true);
    }
}