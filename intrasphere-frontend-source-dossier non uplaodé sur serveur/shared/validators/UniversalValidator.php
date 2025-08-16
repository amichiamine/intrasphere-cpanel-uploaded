<?php
/**
 * Validateur universel PHP
 * Compatible avec universal-validator.ts
 */

class ValidationResult {
    public bool $isValid;
    public array $errors;
    public $data;
    
    public function __construct(bool $isValid, array $errors = [], $data = null) {
        $this->isValid = $isValid;
        $this->errors = $errors;
        $this->data = $data;
    }
}

class UniversalValidator {
    
    /**
     * Valider un email
     */
    public static function validateEmail(string $email): ValidationResult {
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new ValidationResult(true, [], $email);
        }
        
        return new ValidationResult(false, ["Format d'email invalide"]);
    }
    
    /**
     * Valider un mot de passe
     */
    public static function validatePassword(string $password, int $minLength = 8): ValidationResult {
        $errors = [];
        
        if (strlen($password) < $minLength) {
            $errors[] = "Le mot de passe doit contenir au moins {$minLength} caractères";
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = "Le mot de passe doit contenir au moins une majuscule";
        }
        
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = "Le mot de passe doit contenir au moins une minuscule";
        }
        
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = "Le mot de passe doit contenir au moins un chiffre";
        }
        
        if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password)) {
            $errors[] = "Le mot de passe doit contenir au moins un caractère spécial";
        }
        
        return new ValidationResult(
            empty($errors),
            $errors,
            empty($errors) ? $password : null
        );
    }
    
    /**
     * Valider un nom d'utilisateur
     */
    public static function validateUsername(string $username): ValidationResult {
        $errors = [];
        
        if (strlen($username) < 3) {
            $errors[] = "Le nom d'utilisateur doit contenir au moins 3 caractères";
        }
        
        if (strlen($username) > 20) {
            $errors[] = "Le nom d'utilisateur ne peut pas dépasser 20 caractères";
        }
        
        if (!preg_match('/^[a-zA-Z0-9._-]+$/', $username)) {
            $errors[] = "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores";
        }
        
        if (preg_match('/^[._-]/', $username) || preg_match('/[._-]$/', $username)) {
            $errors[] = "Le nom d'utilisateur ne peut pas commencer ou finir par un caractère spécial";
        }
        
        return new ValidationResult(
            empty($errors),
            $errors,
            empty($errors) ? $username : null
        );
    }
    
    /**
     * Valider un numéro de téléphone français
     */
    public static function validatePhoneNumber(string $phone): ValidationResult {
        // Supprimer les espaces et caractères spéciaux
        $cleanPhone = preg_replace('/[\s.-]/', '', $phone);
        
        // Formats acceptés: 0123456789, +33123456789, 33123456789
        $phoneRegex = '/^(\+33|33|0)[1-9](\d{8})$/';
        
        if (preg_match($phoneRegex, $cleanPhone)) {
            return new ValidationResult(true, [], $cleanPhone);
        }
        
        return new ValidationResult(
            false, 
            ["Format de téléphone invalide (ex: 01 23 45 67 89)"]
        );
    }
    
    /**
     * Valider une URL
     */
    public static function validateUrl(string $url, bool $requireHttps = false): ValidationResult {
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return new ValidationResult(false, ["Format d'URL invalide"]);
        }
        
        if ($requireHttps && !str_starts_with($url, 'https://')) {
            return new ValidationResult(false, ["L'URL doit utiliser HTTPS"]);
        }
        
        if (!str_starts_with($url, 'http://') && !str_starts_with($url, 'https://')) {
            return new ValidationResult(false, ["L'URL doit utiliser HTTP ou HTTPS"]);
        }
        
        return new ValidationResult(true, [], $url);
    }
    
    /**
     * Valider une date
     */
    public static function validateDate(string $date, string $format = "Y-m-d"): ValidationResult {
        $dateTime = DateTime::createFromFormat($format, $date);
        
        if (!$dateTime || $dateTime->format($format) !== $date) {
            return new ValidationResult(
                false, 
                ["Format de date invalide (attendu: {$format})"]
            );
        }
        
        return new ValidationResult(true, [], $dateTime);
    }
    
    /**
     * Valider une longueur de texte
     */
    public static function validateTextLength(
        string $text, 
        int $minLength = 0, 
        int $maxLength = 1000,
        string $fieldName = "Le champ"
    ): ValidationResult {
        $errors = [];
        
        if (strlen($text) < $minLength) {
            $errors[] = "{$fieldName} doit contenir au moins {$minLength} caractères";
        }
        
        if (strlen($text) > $maxLength) {
            $errors[] = "{$fieldName} ne peut pas dépasser {$maxLength} caractères";
        }
        
        return new ValidationResult(
            empty($errors),
            $errors,
            empty($errors) ? $text : null
        );
    }
    
    /**
     * Valider un fichier uploadé
     */
    public static function validateUploadedFile(
        array $file, 
        array $allowedTypes = [], 
        int $maxSizeBytes = 10485760 // 10MB
    ): ValidationResult {
        $errors = [];
        
        // Vérifier les erreurs d'upload
        if ($file['error'] !== UPLOAD_ERR_OK) {
            switch ($file['error']) {
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    $errors[] = "Le fichier est trop volumineux";
                    break;
                case UPLOAD_ERR_PARTIAL:
                    $errors[] = "Le fichier n'a été que partiellement uploadé";
                    break;
                case UPLOAD_ERR_NO_FILE:
                    $errors[] = "Aucun fichier n'a été uploadé";
                    break;
                default:
                    $errors[] = "Erreur d'upload du fichier";
            }
        }
        
        // Vérifier le type de fichier
        if (!empty($allowedTypes) && !in_array($file['type'], $allowedTypes)) {
            $errors[] = "Type de fichier non autorisé. Types acceptés: " . implode(', ', $allowedTypes);
        }
        
        // Vérifier la taille
        if ($file['size'] > $maxSizeBytes) {
            $maxSizeMB = $maxSizeBytes / 1024 / 1024;
            $errors[] = "La taille du fichier ne peut pas dépasser {$maxSizeMB}MB";
        }
        
        return new ValidationResult(
            empty($errors),
            $errors,
            empty($errors) ? $file : null
        );
    }
    
    /**
     * Valider plusieurs champs en une fois
     */
    public static function validateMultiple(array $validations): ValidationResult {
        $allErrors = [];
        $isValid = true;
        
        foreach ($validations as $validation) {
            if ($validation instanceof ValidationResult) {
                $result = $validation;
            } elseif (is_callable($validation)) {
                $result = $validation();
            } else {
                continue;
            }
            
            if (!$result->isValid) {
                $isValid = false;
                $allErrors = array_merge($allErrors, $result->errors);
            }
        }
        
        return new ValidationResult($isValid, $allErrors);
    }
    
    /**
     * Nettoyer et valider une entrée utilisateur
     */
    public static function sanitizeAndValidate(
        string $input,
        int $maxLength = 1000,
        bool $allowHtml = false
    ): ValidationResult {
        $sanitized = trim($input);
        
        if (!$allowHtml) {
            // Échapper les caractères HTML
            $sanitized = htmlspecialchars($sanitized, ENT_QUOTES, 'UTF-8');
        }
        
        if (strlen($sanitized) > $maxLength) {
            return new ValidationResult(
                false,
                ["Le texte ne peut pas dépasser {$maxLength} caractères"]
            );
        }
        
        return new ValidationResult(true, [], $sanitized);
    }
    
    /**
     * Valider un tableau de données avec des règles
     */
    public static function validateArray(array $data, array $rules): ValidationResult {
        $errors = [];
        $validatedData = [];
        
        foreach ($rules as $field => $rule) {
            $value = $data[$field] ?? null;
            
            // Champ requis
            if (isset($rule['required']) && $rule['required'] && empty($value)) {
                $errors[] = "Le champ {$field} est requis";
                continue;
            }
            
            // Si pas de valeur et pas requis, passer
            if (empty($value) && !isset($rule['required'])) {
                continue;
            }
            
            // Validation email
            if (isset($rule['email']) && $rule['email']) {
                $result = self::validateEmail($value);
                if (!$result->isValid) {
                    $errors = array_merge($errors, $result->errors);
                    continue;
                }
            }
            
            // Validation longueur
            if (isset($rule['min_length']) || isset($rule['max_length'])) {
                $min = $rule['min_length'] ?? 0;
                $max = $rule['max_length'] ?? 1000;
                $result = self::validateTextLength($value, $min, $max, $field);
                if (!$result->isValid) {
                    $errors = array_merge($errors, $result->errors);
                    continue;
                }
            }
            
            // Validation pattern regex
            if (isset($rule['pattern'])) {
                if (!preg_match($rule['pattern'], $value)) {
                    $message = $rule['pattern_message'] ?? "Format invalide pour le champ {$field}";
                    $errors[] = $message;
                    continue;
                }
            }
            
            $validatedData[$field] = $value;
        }
        
        return new ValidationResult(
            empty($errors),
            $errors,
            empty($errors) ? $validatedData : null
        );
    }
}

/**
 * Règles de validation prédéfinies
 */
class ValidationRules {
    public static array $user = [
        'username' => [
            'required' => true,
            'min_length' => 3,
            'max_length' => 20,
            'pattern' => '/^[a-zA-Z0-9._-]+$/',
            'pattern_message' => 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores'
        ],
        'email' => [
            'required' => true,
            'email' => true
        ],
        'password' => [
            'required' => true,
            'min_length' => 8
        ],
        'name' => [
            'required' => true,
            'min_length' => 2,
            'max_length' => 100
        ]
    ];
    
    public static array $announcement = [
        'title' => [
            'required' => true,
            'min_length' => 5,
            'max_length' => 200
        ],
        'content' => [
            'required' => true,
            'min_length' => 10,
            'max_length' => 5000
        ],
        'type' => [
            'required' => true,
            'pattern' => '/^(info|warning|success|error)$/',
            'pattern_message' => 'Type d\'annonce invalide'
        ]
    ];
    
    public static array $document = [
        'title' => [
            'required' => true,
            'min_length' => 3,
            'max_length' => 200
        ],
        'description' => [
            'max_length' => 1000
        ],
        'category' => [
            'required' => true,
            'pattern' => '/^(regulation|policy|guide|procedure)$/',
            'pattern_message' => 'Catégorie de document invalide'
        ]
    ];
}