<?php
require_once __DIR__ . '/../Models/Complaint.php';

class ComplaintController {
    private $model;

    public function __construct() {
        $this->model = new Complaint();
    }

    public function assign($p,$i) {
        AuthMiddleware::requireRole('moderator');
        $this->model->assignTo($p['id'], $i['assigned_to_id']);
        Response::success(null,'Assigned');
    }

    public function updateStatus($p,$i) {
        AuthMiddleware::requireRole('moderator');
        $this->model->changeStatus($p['id'], $i['status']);
        Response::success(null,'Status updated');
    }
}