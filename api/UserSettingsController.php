<?php
/**
 * Contrôleur UserSettings pour IntraSphere
 */

class UserSettingsController {
    private $model;

    public function __construct() {
        $this->model = new UserSettings();
    }

    public function getSettings($p,$i) {
        AuthMiddleware::handle();
        $user = AuthMiddleware::getCurrentUser();
        $sets = $this->model->getUserSettings($user['id']);
        Response::success($sets);
    }

    public function saveSettings($p,$i) {
        AuthMiddleware::handle();
        $user = AuthMiddleware::getCurrentUser();
        foreach($i as $k=>$v) {
            $this->model->updateSetting($user['id'],$k,$v);
        }
        Response::success(null,'Settings saved');
    }
}