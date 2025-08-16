<?php
/**
 * AuthMiddleware pour IntraSphere
 * Gestion de l'authentification
 */

class AuthMiddleware {

    public static function handle() {
        if (!isset($_SESSION['user_id'])) {
            Response::unauthorized('Authentication required');
            return false;
        }
        return true;
    }

    public static function requireRole($requiredRole) {
        if (!self::handle()) {
            return false;
        }

        $currentUser = self::getCurrentUser();
        if (!$currentUser) {
            Response::unauthorized('User not found');
            return false;
        }

        $roleHierarchy = [
            'employee'  => 1,
            'moderator' => 2,
            'admin'     => 3
        ];

        $userLevel     = $roleHierarchy[$currentUser['role']] ?? 0;
        $requiredLevel = $roleHierarchy[$requiredRole]     ?? 99;

        if ($userLevel < $requiredLevel) {
            Response::forbidden('Insufficient permissions');
            return false;
        }
        return true;
    }

    public static function getCurrentUser() {
        if (!isset($_SESSION['user_id'])) {
            return null;
        }
        $userModel = new User();
        return $userModel->findById($_SESSION['user_id']);
    }

    public static function login($user) {
        $_SESSION['user_id']  = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role']     = $user['role'];

        // Mettre à jour last_login
        $userModel = new User();
        $userModel->update($user['id'], ['last_login' => date('Y-m-d H:i:s')]);

        return true;
    }

    public static function logout() {
        session_destroy();
        return true;
    }
}