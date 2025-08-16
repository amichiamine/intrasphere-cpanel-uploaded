<?php
/**
 * Contrôleur SystemSettings pour IntraSphere
 */

class SystemSettingsController {
    private $model;

    public function __construct() {
        $this->model = new SystemSettings();
    }

    public function getSettings($p,$i) {
        AuthMiddleware::requireRole('admin');
        $conf = $this->model->getAll();
        Response::success($conf);
    }

    public function updateSettings($p,$i) {
        AuthMiddleware::requireRole('admin');
        foreach($i as $k=>$v) {
            $this->model->updateSetting($k,$v);
        }
        Response::success(null,'Updated');
    }
}