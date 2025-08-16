<?php
/**
 * SecurityMiddleware pour IntraSphere
 * En-têtes de sécurité
 */

class SecurityMiddleware {
    public static function handle() {
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
    }
}