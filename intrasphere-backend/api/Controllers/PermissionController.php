<?php
/**
 * Contrôleur Permission pour IntraSphere
 */

class PermissionController {
    private $model;

    public function __construct() {
        $this->model = new Permission();
    }

    public function index($p,$i) {
        AuthMiddleware::requireRole('moderator');
        $all = $this->model->findAll();
        Response::success($all);
    }

    public function userPermissions($p,$i) {
        AuthMiddleware::requireRole('moderator');
        $perms = $this->model->getUserPermissions($p['userId']);
        Response::success($perms);
    }
}