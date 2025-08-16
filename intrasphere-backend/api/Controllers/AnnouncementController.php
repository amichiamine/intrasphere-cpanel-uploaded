<?php
/**
 * Contrôleur des annonces
 */

class AnnouncementController {
    private $model;

    public function __construct() {
        $this->model = new Announcement();
    }

    // GET /api/announcements
    public function index($params, $input) {
        AuthMiddleware::handle();
        $announcements = $this->model->getPublished();
        Response::success($announcements);
    }

    // GET /api/announcements/{id}
    public function show($params, $input) {
        AuthMiddleware::handle();
        $ann = $this->model->findById($params['id']);
        if (!$ann) Response::notFound('Not found');
        Response::success($ann);
    }

    // POST /api/announcements
    public function store($params, $input) {
        AuthMiddleware::requireRole('moderator');
        $id = $this->model->create($input);
        $ann = $this->model->findById($id);
        Response::success($ann, 'Created', 201);
    }

    // PUT /api/announcements/{id}
    public function update($params, $input) {
        AuthMiddleware::requireRole('moderator');
        $this->model->update($params['id'], $input);
        $ann = $this->model->findById($params['id']);
        Response::success($ann, 'Updated');
    }

    // DELETE /api/announcements/{id}
    public function delete($params, $input) {
        AuthMiddleware::requireRole('moderator');
        $this->model->delete($params['id']);
        Response::success(null, 'Deleted');
    }
}