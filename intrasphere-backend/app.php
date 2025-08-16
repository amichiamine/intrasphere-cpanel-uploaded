<?php
/**
 * Configuration principale IntraSphere PHP
 */

return [
    'app_name'       => $_ENV['APP_NAME']       ?? 'IntraSphere',
    'app_env'        => $_ENV['APP_ENV']        ?? 'production',
    'app_debug'      => ($_ENV['APP_DEBUG']=='true'),
    'app_url'        => $_ENV['APP_URL']        ?? 'http://localhost',
    'db' => [
        'host'       => $_ENV['DB_HOST']        ?? 'localhost',
        'port'       => $_ENV['DB_PORT']        ?? '3306',
        'database'   => $_ENV['DB_DATABASE']    ?? 'intrasphere',
        'username'   => $_ENV['DB_USERNAME']    ?? 'root',
        'password'   => $_ENV['DB_PASSWORD']    ?? '',
        'charset'    => 'utf8mb4',
        'collation'  => 'utf8mb4_unicode_ci'
    ],
    'upload' => [
        'path' => __DIR__ . '/public/uploads',
        'max_size' => intval($_ENV['MAX_FILE_SIZE'] ?? 10485760),
        'extensions' => explode(',', $_ENV['ALLOWED_EXTENSIONS'] ?? 'jpg,jpeg,png,gif,pdf,doc,docx')
    ],
    'email' => [
        'host'     => $_ENV['MAIL_HOST']     ?? '',
        'port'     => $_ENV['MAIL_PORT']     ?? '',
        'username' => $_ENV['MAIL_USERNAME'] ?? '',
        'password' => $_ENV['MAIL_PASSWORD'] ?? '',
        'from'     => $_ENV['MAIL_FROM_ADDRESS'] ?? '',
        'from_name'=> $_ENV['MAIL_FROM_NAME'] ?? ''
    ]
];