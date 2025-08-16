<?php
/**
 * Router IntraSphere - Version CORRIGÉE DÉFINITIVE
 * SANS DEBUG ECHO - STRUCTURE FIXÉE
 */

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
        // Nettoyer l'URI - SANS ECHO DEBUG
        $uri = str_replace('/intrasphere', '', $uri);
        $uri = parse_url($uri, PHP_URL_PATH);
        $uri = rtrim($uri, '/') ?: '/';

        // Log silencieux pour debugging
        error_log("Router: $method $uri");

        // Chercher la route exacte
        if (isset($this->routes[$method][$uri])) {
            $handler = $this->routes[$method][$uri];

            if (is_callable($handler)) {
                $handler();
            } else {
                list($controller, $action) = explode('@', $handler);

                // Charger le contrôleur
                $controllerFile = __DIR__ . '/../Controllers/' . $controller . '.php';
                if (file_exists($controllerFile)) {
                    require_once $controllerFile;

                    if (class_exists($controller)) {
                        $instance = new $controller();
                        if (method_exists($instance, $action)) {
                            $instance->$action();
                        } else {
                            Response::error("Method $action not found in $controller", 500);
                        }
                    } else {
                        Response::error("Controller class $controller not found", 500);
                    }
                } else {
                    Response::error("Controller file $controller.php not found", 500);
                }
            }
            return;
        }

        // Route non trouvée
        Response::error('Route not found', 404);
    }
}
?>