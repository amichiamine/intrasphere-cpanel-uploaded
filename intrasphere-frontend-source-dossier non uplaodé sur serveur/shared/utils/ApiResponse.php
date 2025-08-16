<?php
/**
 * Utilitaire de réponse API unifié pour PHP
 * Compatible avec api-response.ts
 */

class ApiResponse {
    
    /**
     * Créer une réponse de succès
     */
    public static function success($data = null, string $message = null, array $meta = []): array {
        return [
            'success' => true,
            'data' => $data,
            'message' => $message,
            'meta' => array_merge($meta, [
                'timestamp' => date('c'),
                'version' => '1.0'
            ])
        ];
    }
    
    /**
     * Créer une réponse d'erreur
     */
    public static function error(string $message, string $error = null, array $errors = []): array {
        return [
            'success' => false,
            'error' => $error ?: $message,
            'message' => $message,
            'errors' => $errors,
            'meta' => [
                'timestamp' => date('c'),
                'version' => '1.0'
            ]
        ];
    }
    
    /**
     * Créer une réponse paginée
     */
    public static function paginated(
        array $data, 
        int $total, 
        int $page, 
        int $perPage,
        string $message = null
    ): array {
        $hasMore = ($page * $perPage) < $total;
        
        return [
            'success' => true,
            'data' => $data,
            'message' => $message,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'perPage' => $perPage,
                'hasMore' => $hasMore,
                'timestamp' => date('c'),
                'version' => '1.0'
            ]
        ];
    }
    
    /**
     * Créer une réponse de validation échouée
     */
    public static function validationError(array $errors, string $message = "Validation échouée"): array {
        return [
            'success' => false,
            'message' => $message,
            'error' => 'VALIDATION_FAILED',
            'errors' => $errors,
            'meta' => [
                'timestamp' => date('c'),
                'version' => '1.0'
            ]
        ];
    }
    
    /**
     * Créer une réponse d'authentification requise
     */
    public static function authRequired(string $message = "Authentification requise"): array {
        return [
            'success' => false,
            'message' => $message,
            'error' => 'AUTH_REQUIRED',
            'meta' => [
                'timestamp' => date('c'),
                'version' => '1.0'
            ]
        ];
    }
    
    /**
     * Créer une réponse de permissions insuffisantes
     */
    public static function forbidden(string $message = "Permissions insuffisantes"): array {
        return [
            'success' => false,
            'message' => $message,
            'error' => 'FORBIDDEN',
            'meta' => [
                'timestamp' => date('c'),
                'version' => '1.0'
            ]
        ];
    }
    
    /**
     * Créer une réponse de ressource non trouvée
     */
    public static function notFound(string $message = "Ressource non trouvée"): array {
        return [
            'success' => false,
            'message' => $message,
            'error' => 'NOT_FOUND',
            'meta' => [
                'timestamp' => date('c'),
                'version' => '1.0'
            ]
        ];
    }
    
    /**
     * Créer une réponse d'erreur serveur
     */
    public static function serverError(string $message = "Erreur serveur interne", string $error = null): array {
        return [
            'success' => false,
            'message' => $message,
            'error' => $error ?: 'INTERNAL_ERROR',
            'meta' => [
                'timestamp' => date('c'),
                'version' => '1.0'
            ]
        ];
    }
    
    /**
     * Créer une réponse de trop de requêtes
     */
    public static function tooManyRequests(string $message = "Trop de requêtes", int $retryAfter = null): array {
        $meta = [
            'timestamp' => date('c'),
            'version' => '1.0'
        ];
        
        if ($retryAfter !== null) {
            $meta['retryAfter'] = $retryAfter;
        }
        
        return [
            'success' => false,
            'message' => $message,
            'error' => 'TOO_MANY_REQUESTS',
            'meta' => $meta
        ];
    }
    
    /**
     * Envoyer une réponse JSON avec les headers appropriés
     */
    public static function send(array $response, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-cache, must-revalidate');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
    
    /**
     * Envoyer une réponse de succès
     */
    public static function sendSuccess($data = null, string $message = null, int $statusCode = 200): void {
        self::send(self::success($data, $message), $statusCode);
    }
    
    /**
     * Envoyer une réponse d'erreur
     */
    public static function sendError(string $message, int $statusCode = 400, string $error = null): void {
        self::send(self::error($message, $error), $statusCode);
    }
    
    /**
     * Envoyer une réponse paginée
     */
    public static function sendPaginated(
        array $data, 
        int $total, 
        int $page, 
        int $perPage,
        string $message = null,
        int $statusCode = 200
    ): void {
        self::send(self::paginated($data, $total, $page, $perPage, $message), $statusCode);
    }
}

/**
 * Constantes pour les codes de statut HTTP
 */
class HttpStatus {
    const OK = 200;
    const CREATED = 201;
    const NO_CONTENT = 204;
    const BAD_REQUEST = 400;
    const UNAUTHORIZED = 401;
    const FORBIDDEN = 403;
    const NOT_FOUND = 404;
    const CONFLICT = 409;
    const UNPROCESSABLE_ENTITY = 422;
    const TOO_MANY_REQUESTS = 429;
    const INTERNAL_SERVER_ERROR = 500;
}