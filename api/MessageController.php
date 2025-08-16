<?php
require_once __DIR__ . '/../Models/Message.php';

class MessageController {
    private $model;

    public function __construct() {
        $this->model = new Message();
    }

    public function sent($p,$i) {
        AuthMiddleware::handle();
        $msgs = $this->model->getSent($p['user_id'] ?? $_SESSION['user_id']);
        Response::success($msgs);
    }
}