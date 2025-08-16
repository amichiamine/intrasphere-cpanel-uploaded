<?php
require_once __DIR__ . '/../Models/Event.php';

class EventController {
    private $model;

    public function __construct() {
        $this->model = new Event();
    }

    public function index($p,$i) {
        AuthMiddleware::handle();
        $events = $this->model->findAll();
        Response::success($events);
    }

    public function register($p,$i) {
        AuthMiddleware::handle();
        $this->model->registerParticipant($p['id'], $_SESSION['user_id']);
        Response::success(null,'Registered');
    }
}