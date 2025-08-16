<?php
/**
 * Contrôleur Categories pour IntraSphere
 */

require_once __DIR__ . '/../Models/Category.php';

class CategoryController {
    private $model;

    public function __construct() {
        $this->model = new Category();
    }

    // GET /api/categories
    public function index($params, $input) {
        AuthMiddleware::handle();
        $cats = $this->model->findAll(null,0,'sort_order ASC');
        Response::success($cats);
    }

    // GET /api/categories/{id}
    public function show($params, $input) {
        AuthMiddleware::handle();
        $cat = $this->model->findById($params['id']);
        if (!$cat) Response::notFound('Category not found');
        Response::success($cat);
    }

    // POST /api/categories
    public function store($params, $input) {
        AuthMiddleware::requireRole('moderator');
        $id = $this->model->create($input);
        $cat = $this->model->findById($id);
        Response::success($cat,'Created',201);
    }

    // PATCH /api/categories/{id}
    public function update($params, $input) {
        AuthMiddleware::requireRole('moderator');
        $this->model->update($params['id'],$input);
        $cat = $this->model->findById($params['id']);
        Response::success($cat,'Updated');
    }

    // DELETE /api/categories/{id}
    public function delete($params, $input) {
        AuthMiddleware::requireRole('admin');
        $this->model->delete($params['id']);
        Response::success(null,'Deleted');
    }
}