<?php
/**
 * Contrôleur ViewsConfig pour IntraSphere
 */

class ViewsConfigController {
    private $model;

    public function __construct() {
        $this->model = new ViewsConfig();
    }

    public function index($p,$i) {
        AuthMiddleware::requireRole('admin');
        $conf = $this->model->getViewsConfig();
        Response::success($conf);
    }

    public function store($p,$i) {
        AuthMiddleware::requireRole('admin');
        $this->model->saveViewsConfig($i['views'] ?? []);
        Response::success(null,'Saved');
    }

    public function update($p,$i) {
        AuthMiddleware::requireRole('admin');
        $this->model->updateViewConfig($p['viewId'],$i);
        Response::success(null,'Updated');
    }
}