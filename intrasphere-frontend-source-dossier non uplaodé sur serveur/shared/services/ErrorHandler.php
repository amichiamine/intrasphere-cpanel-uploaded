<?php
/**
 * Gestionnaire d'erreurs universel PHP
 * Compatible avec error-handler.ts
 */

class ErrorInfo {
    public string $code;
    public string $message;
    public $details;
    public DateTime $timestamp;
    public ?string $userId;
    public ?string $endpoint;
    public ?string $userAgent;
    
    public function __construct(
        string $code, 
        string $message, 
        $details = null,
        ?string $userId = null,
        ?string $endpoint = null,
        ?string $userAgent = null
    ) {
        $this->code = $code;
        $this->message = $message;
        $this->details = $details;
        $this->timestamp = new DateTime();
        $this->userId = $userId;
        $this->endpoint = $endpoint;
        $this->userAgent = $userAgent;
    }
    
    public function toArray(): array {
        return [
            'code' => $this->code,
            'message' => $this->message,
            'details' => $this->details,
            'timestamp' => $this->timestamp->format('c'),
            'userId' => $this->userId,
            'endpoint' => $this->endpoint,
            'userAgent' => $this->userAgent
        ];
    }
}

class ErrorHandler {
    private static array $logs = [];
    private static int $maxLogs = 1000;
    
    /**
     * Journaliser une erreur
     */
    public static function logError(
        $error, 
        array $context = []
    ): void {
        $code = is_string($error) ? 'CUSTOM_ERROR' : get_class($error);
        $message = is_string($error) ? $error : $error->getMessage();
        
        $errorInfo = new ErrorInfo(
            $code,
            $message,
            $context,
            $context['userId'] ?? null,
            $context['endpoint'] ?? null,
            $context['userAgent'] ?? null
        );
        
        // Ajouter au journal avec limitation de taille
        self::$logs[] = $errorInfo;
        if (count(self::$logs) > self::$maxLogs) {
            self::$logs = array_slice(self::$logs, -self::$maxLogs);
        }
        
        // Log en console en développement
        if ($_ENV['ENVIRONMENT'] === 'development' || !isset($_ENV['ENVIRONMENT'])) {
            error_log("[ERROR] {$code}: {$message} " . json_encode($context));
        }
    }
    
    /**
     * Gérer une erreur de validation
     */
    public static function handleValidationError(array $errors, array $context = []): array {
        self::logError("Erreur de validation", array_merge(['errors' => $errors], $context));
        return ApiResponse::validationError($errors);
    }
    
    /**
     * Gérer une erreur d'authentification
     */
    public static function handleAuthError(string $message = "Authentification requise", array $context = []): array {
        self::logError($message, $context);
        return ApiResponse::authRequired($message);
    }
    
    /**
     * Gérer une erreur de permissions
     */
    public static function handlePermissionError(string $message = "Permissions insuffisantes", array $context = []): array {
        self::logError($message, $context);
        return ApiResponse::forbidden($message);
    }
    
    /**
     * Gérer une erreur de ressource non trouvée
     */
    public static function handleNotFoundError(string $resource = "Ressource", array $context = []): array {
        $message = "{$resource} non trouvée";
        self::logError($message, $context);
        return ApiResponse::notFound($message);
    }
    
    /**
     * Gérer une erreur serveur générale
     */
    public static function handleServerError($error, array $context = []): array {
        $message = is_string($error) ? $error : $error->getMessage();
        self::logError($error, $context);
        
        // En production, ne pas exposer les détails
        $publicMessage = ($_ENV['ENVIRONMENT'] ?? 'development') === 'production' 
            ? "Erreur serveur interne" 
            : $message;
        
        return ApiResponse::serverError($publicMessage);
    }
    
    /**
     * Gérer les erreurs de base de données
     */
    public static function handleDatabaseError(Exception $error, array $context = []): array {
        self::logError("Erreur base de données: " . $error->getMessage(), array_merge([
            'stack' => $error->getTraceAsString()
        ], $context));
        
        $publicMessage = ($_ENV['ENVIRONMENT'] ?? 'development') === 'production'
            ? "Erreur de base de données"
            : "Erreur BD: " . $error->getMessage();
        
        return ApiResponse::serverError($publicMessage, "DATABASE_ERROR");
    }
    
    /**
     * Gérer les erreurs de limite de taux
     */
    public static function handleRateLimitError(?int $retryAfter = null, array $context = []): array {
        self::logError("Limite de taux dépassée", array_merge(['retryAfter' => $retryAfter], $context));
        return ApiResponse::tooManyRequests("Trop de requêtes", $retryAfter);
    }
    
    /**
     * Gestionnaire d'erreur global PHP
     */
    public static function handlePhpError(int $errno, string $errstr, string $errfile, int $errline): bool {
        $context = [
            'file' => $errfile,
            'line' => $errline,
            'errno' => $errno
        ];
        
        switch ($errno) {
            case E_ERROR:
            case E_CORE_ERROR:
            case E_COMPILE_ERROR:
            case E_USER_ERROR:
                self::logError("Erreur PHP critique: $errstr", $context);
                break;
            
            case E_WARNING:
            case E_CORE_WARNING:
            case E_COMPILE_WARNING:
            case E_USER_WARNING:
                self::logError("Avertissement PHP: $errstr", $context);
                break;
            
            case E_NOTICE:
            case E_USER_NOTICE:
                if (($_ENV['ENVIRONMENT'] ?? 'development') === 'development') {
                    self::logError("Notice PHP: $errstr", $context);
                }
                break;
        }
        
        return false; // Laisser PHP gérer l'erreur normalement
    }
    
    /**
     * Gestionnaire d'exception non capturée
     */
    public static function handleUncaughtException(Throwable $exception): void {
        $context = [
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'stack' => $exception->getTraceAsString()
        ];
        
        self::logError("Exception non capturée: " . $exception->getMessage(), $context);
        
        // Envoyer une réponse d'erreur si possible
        if (!headers_sent()) {
            $response = self::handleServerError($exception);
            ApiResponse::send($response, HttpStatus::INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Récupérer les logs d'erreurs (pour admin uniquement)
     */
    public static function getErrorLogs(int $limit = 100): array {
        return array_map(
            fn(ErrorInfo $error) => $error->toArray(),
            array_slice(self::$logs, -$limit)
        );
    }
    
    /**
     * Vider les logs d'erreurs
     */
    public static function clearLogs(): void {
        self::$logs = [];
    }
    
    /**
     * Obtenir les statistiques d'erreurs
     */
    public static function getErrorStats(): array {
        $now = new DateTime();
        $last24h = (clone $now)->sub(new DateInterval('PT24H'));
        $lastHour = (clone $now)->sub(new DateInterval('PT1H'));
        
        $recent24h = array_filter(self::$logs, fn(ErrorInfo $log) => $log->timestamp > $last24h);
        $recentHour = array_filter(self::$logs, fn(ErrorInfo $log) => $log->timestamp > $lastHour);
        
        $errorsByCode = [];
        foreach (self::$logs as $log) {
            $errorsByCode[$log->code] = ($errorsByCode[$log->code] ?? 0) + 1;
        }
        
        arsort($errorsByCode);
        $mostCommonErrors = array_slice(
            array_map(
                fn($code, $count) => ['code' => $code, 'count' => $count],
                array_keys($errorsByCode),
                array_values($errorsByCode)
            ),
            0,
            5
        );
        
        return [
            'totalErrors' => count(self::$logs),
            'last24h' => count($recent24h),
            'lastHour' => count($recentHour),
            'errorsByCode' => $errorsByCode,
            'mostCommonErrors' => $mostCommonErrors
        ];
    }
    
    /**
     * Exécution sécurisée d'une opération
     */
    public static function safeExecute(callable $operation, array $context = []): array {
        try {
            $data = $operation();
            return ['success' => true, 'data' => $data];
        } catch (Exception $error) {
            self::logError($error, $context);
            return ['success' => false, 'error' => $error->getMessage()];
        }
    }
    
    /**
     * Initialiser les gestionnaires d'erreur globaux
     */
    public static function initialize(): void {
        // Gestionnaire d'erreurs PHP
        set_error_handler([self::class, 'handlePhpError']);
        
        // Gestionnaire d'exceptions non capturées
        set_exception_handler([self::class, 'handleUncaughtException']);
        
        // Gestionnaire d'arrêt fatal
        register_shutdown_function(function() {
            $error = error_get_last();
            if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
                self::logError("Erreur fatale PHP: " . $error['message'], [
                    'file' => $error['file'],
                    'line' => $error['line'],
                    'type' => $error['type']
                ]);
            }
        });
    }
}

/**
 * Codes d'erreur standardisés
 */
class ErrorCodes {
    const VALIDATION_FAILED = "VALIDATION_FAILED";
    const AUTH_REQUIRED = "AUTH_REQUIRED";
    const FORBIDDEN = "FORBIDDEN";
    const NOT_FOUND = "NOT_FOUND";
    const CONFLICT = "CONFLICT";
    const TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS";
    const DATABASE_ERROR = "DATABASE_ERROR";
    const NETWORK_ERROR = "NETWORK_ERROR";
    const FILE_ERROR = "FILE_ERROR";
    const INTERNAL_ERROR = "INTERNAL_ERROR";
}

// Initialiser automatiquement le gestionnaire d'erreurs
ErrorHandler::initialize();