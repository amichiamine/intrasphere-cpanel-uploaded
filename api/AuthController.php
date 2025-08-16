<?php
/**
 * Contrôleur d'authentification
 */

class AuthController {
    private $authService;

    public function __construct() {
        $this->authService = new AuthService();
    }

    // POST /api/auth/login
    public function login($params, $input) {
        $token = $this->authService->login($input['username'] ?? '', $input['password'] ?? '');
        if (!$token) {
            Response::unauthorized('Invalid credentials');
        }
        Response::success(['token' => $token], 'Login successful');
    }

    // POST /api/auth/register
    public function register($params, $input) {
        try {
            $user = $this->authService->register($input);
            Response::success($user, 'Registration successful', 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    // GET /api/auth/me
    public function me($params, $input) {
        AuthMiddleware::handle();
        $user = AuthMiddleware::getCurrentUser();
        unset($user['password']);
        Response::success($user);
    }

    // POST /api/auth/logout
    public function logout($params, $input) {
        AuthMiddleware::logout();
        Response::success(null, 'Logout successful');
    }

    // GET /api/stats
    public function stats($params, $input) {
        AuthMiddleware::handle();
        $userModel = new User();
        $announcementModel = new Announcement();
        $stats = [
            'users' => $userModel->count(),
            'announcements' => $announcementModel->count(),
            'timestamp' => time()
        ];
        Response::success($stats);
    }
}