<?php
class Router {
    private $routes = [];
    
    public function get($path, $handler) {
        $this->routes['GET'][$path] = $handler;
    }
    
    public function post($path, $handler) {
        $this->routes['POST'][$path] = $handler;
    }
    
    public function put($path, $handler) {
        $this->routes['PUT'][$path] = $handler;
    }
    
    public function patch($path, $handler) {
        $this->routes['PATCH'][$path] = $handler;
    }
    
    public function delete($path, $handler) {
        $this->routes['DELETE'][$path] = $handler;
    }
    
    public function dispatch($method, $uri) {
        // Nettoyer l'URI
        $uri = str_replace('/intrasphere', '', $uri);
        $uri = parse_url($uri, PHP_URL_PATH);
        $uri = rtrim($uri, '/') ?: '/';
        
        // Chercher la route exacte
        if (isset($this->routes[$method][$uri])) {
            $handler = $this->routes[$method][$uri];
            
            if (is_callable($handler)) {
                $handler();
            } else {
                list($controller, $action) = explode('@', $handler);
                // Appeler le contrôleur
                $instance = new $controller();
                $instance->$action();
            }
            return;
        }
        
        // Route non trouvée
        Response::error('Route not found', 404);
    }
}
