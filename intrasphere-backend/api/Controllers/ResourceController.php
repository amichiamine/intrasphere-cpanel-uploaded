<?php
/**
 * Contrôleur Resource pour IntraSphere E-Learning
 */

require_once __DIR__ . '/../Models/Resource.php';

class ResourceController {
    private $model;

    public function __construct() {
        $this->model = new Resource();
    }

    // GET /api/resources
    public function index($params, $input) {
        AuthMiddleware::handle();
        $data = $this->model->paginate(
            (int)($input['page'] ?? 1),
            (int)($input['limit'] ?? 20),
            '1=1', [], 'created_at DESC'
        );
        Response::success($data);
    }

    // GET /api/resources/{id}
    public function show($params, $input) {
        AuthMiddleware::handle();
        $res = $this->model->findById($params['id']);
        if (!$res) Response::notFound('Resource not found');
        Response::success($res);
    }

    // POST /api/resources
    public function store($params, $input) {
        AuthMiddleware::requireRole('moderator');
        $id = $this->model->create($input);
        $res = $this->model->findById($id);
        Response::success($res, 'Created', 201);
    }

    // DELETE /api/resources/{id}
    public function delete($params, $input) {
        AuthMiddleware::requireRole('moderator');
        $this->model->delete($params['id']);
        Response::success(null, 'Deleted');
    }
}