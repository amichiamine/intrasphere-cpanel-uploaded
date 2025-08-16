<?php
/**
 * Contrôleur des documents
 */

class DocumentController {
    private $model;

    public function __construct() {
        $this->model = new Document();
    }

    // GET /api/documents
    public function index($params, $input) {
        AuthMiddleware::handle();
        $data = $this->model->findAll();
        Response::success($data);
    }

    // GET /api/documents/{id}
    public function show($params, $input) {
        AuthMiddleware::handle();
        $doc = $this->model->findById($params['id']);
        if (!$doc) Response::notFound('Document not found');
        $this->model->incrementViews($params['id']);
        Response::success($doc);
    }

    // POST /api/documents
    public function store($params, $input) {
        AuthMiddleware::requireRole('moderator');
        // Validation omitted for brevity
        $id = $this->model->create($input);
        $doc = $this->model->findById($id);
        Response::success($doc, 'Created', 201);
    }

    // PATCH /api/documents/{id}
    public function update($params, $input) {
        AuthMiddleware::requireRole('moderator');
        $this->model->update($params['id'], $input);
        $doc = $this->model->findById($params['id']);
        Response::success($doc, 'Updated');
    }

    // DELETE /api/documents/{id}
    public function delete($params, $input) {
        AuthMiddleware::requireRole('moderator');
        // Optionnel : suppression du fichier sur disque
        $this->model->delete($params['id']);
        Response::success(null, 'Deleted');
    }
}