<?php
// IntraSphere PHP Backend – Point d’entrée API

// 1. Charger les variables d’environnement
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

// 2. Charger les classes essentielles
require_once __DIR__ . '/../api/Config/Router.php';
require_once __DIR__ . '/../api/Config/Response.php';
require_once __DIR__ . '/../api/Config/database.php';

// 3. Initialiser le routeur
$router = new Router();

// 4. Définir toutes les routes (copie du contenu de api/routes.php)
// Route de santé
$router->get('/api/health', function() {
    Response::success([
        'status'    => 'ok',
        'adapter'   => 'php',
        'version'   => '1.0.0',
        'timestamp' => time()
    ]);
});

// Authentification
$router->post('/api/auth/login',    'AuthController@login');
$router->post('/api/auth/register', 'AuthController@register');
$router->get( '/api/auth/me',       'AuthController@me');
$router->post('/api/auth/logout',   'AuthController@logout');
$router->get( '/api/stats',         'AuthController@stats');

// Utilisateurs
$router->get(   '/api/users',               'UserController@index');
$router->get(   '/api/users/{id}',          'UserController@show');
$router->post(  '/api/users',               'UserController@store');
$router->patch( '/api/users/{id}',          'UserController@update');
$router->delete('/api/users/{id}',          'UserController@delete');
$router->put(   '/api/users/{id}/status',   'UserController@updateStatus');
$router->put(   '/api/users/{id}/password', 'UserController@changePassword');

// Annonces
$router->get(   '/api/announcements',       'AnnouncementController@index');
$router->get(   '/api/announcements/{id}',  'AnnouncementController@show');
$router->post(  '/api/announcements',       'AnnouncementController@store');
$router->put(   '/api/announcements/{id}',  'AnnouncementController@update');
$router->delete('/api/announcements/{id}',  'AnnouncementController@delete');

// Documents
$router->get(   '/api/documents',           'DocumentController@index');
$router->get(   '/api/documents/{id}',      'DocumentController@show');
$router->post(  '/api/documents',           'DocumentController@store');
$router->patch( '/api/documents/{id}',      'DocumentController@update');
$router->delete('/api/documents/{id}',      'DocumentController@delete');

// Catégories
$router->get(   '/api/categories',              'CategoryController@index');
$router->get(   '/api/categories/{id}',         'CategoryController@show');
$router->post(  '/api/categories',              'CategoryController@store');
$router->patch( '/api/categories/{id}',         'CategoryController@update');
$router->delete('/api/categories/{id}',         'CategoryController@delete');
$router->get(   '/api/categories/{id}/content', 'CategoryController@getContent');

// Contenus (CMS)
$router->get(   '/api/contents',                    'ContentController@index');
$router->get(   '/api/contents/{id}',               'ContentController@show');
$router->post(  '/api/contents',                    'ContentController@store');
$router->patch( '/api/contents/{id}',               'ContentController@update');
$router->delete('/api/contents/{id}',               'ContentController@delete');
$router->post(  '/api/contents/{id}/publish',       'ContentController@publish');
$router->post(  '/api/contents/{id}/unpublish',     'ContentController@unpublish');
$router->get(   '/api/contents/slug/{slug}',        'ContentController@getBySlug');

// Événements
$router->get(   '/api/events',                  'EventController@index');
$router->get(   '/api/events/{id}',             'EventController@show');
$router->post(  '/api/events',                  'EventController@store');
$router->put(   '/api/events/{id}',             'EventController@update');
$router->delete('/api/events/{id}',             'EventController@delete');
$router->post(  '/api/events/{id}/register',    'EventController@register');

// Messages
$router->get(   '/api/messages',                'MessageController@index');
$router->get(   '/api/messages/sent',           'MessageController@sent');
$router->get(   '/api/messages/{id}',           'MessageController@show');
$router->post(  '/api/messages',                'MessageController@store');
$router->put(   '/api/messages/{id}/read',      'MessageController@markAsRead');
$router->delete('/api/messages/{id}',           'MessageController@delete');
$router->get(   '/api/messages/unread/count',   'MessageController@unreadCount');

// Réclamations
$router->get(   '/api/complaints',              'ComplaintController@index');
$router->get(   '/api/complaints/{id}',         'ComplaintController@show');
$router->post(  '/api/complaints',              'ComplaintController@store');
$router->patch( '/api/complaints/{id}',         'ComplaintController@update');
$router->put(   '/api/complaints/{id}/assign',  'ComplaintController@assign');
$router->put(   '/api/complaints/{id}/status',  'ComplaintController@updateStatus');
$router->delete('/api/complaints/{id}',         'ComplaintController@delete');

// Forum
$router->get(   '/api/forum/categories',        'ForumController@categories');
$router->get(   '/api/forum/categories/{id}',   'ForumController@categoryDetails');
$router->post(  '/api/forum/categories',        'ForumController@storeCategory');
$router->get(   '/api/forum/topics',            'ForumController@topics');
$router->get(   '/api/forum/topics/{id}',       'ForumController@topicDetails');
$router->get(   '/api/forum/topics/{id}/posts', 'ForumController@topicPosts');
$router->post(  '/api/forum/topics',            'ForumController@storeTopic');
$router->post(  '/api/forum/posts',             'ForumController@storePost');
$router->put(   '/api/forum/posts/{id}',        'ForumController@updatePost');
$router->delete('/api/forum/posts/{id}',        'ForumController@deletePost');
$router->post(  '/api/forum/posts/{id}/like',   'ForumController@likePost');

// Upload
$router->post('/api/upload',          'UploadController@upload');
$router->post('/api/upload/avatar',   'UploadController@uploadAvatar');
$router->post('/api/upload/document', 'UploadController@uploadDocument');
$router->get( '/api/files/{filename}', 'UploadController@getFile');
$router->delete('/api/files/{filename}', 'UploadController@deleteFile');

// 5. Dispatch de la requête
try {
    $router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}
