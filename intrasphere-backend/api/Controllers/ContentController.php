<?php
/**
 * Contrôleur Contents pour IntraSphere (CMS/Page Builder)
 */

require_once __DIR__ . '/../Models/Content.php';

class ContentController {
    private $model;

    public function __construct() {
        $this->model = new Content();
    }

    // GET /api/contents
    public function index($params, $input) {
        AuthMiddleware::handle();
        $data = $this->model->paginate(
            (int)($input['page']??1),
            (int)($input['limit']??20),
            '1=1',[], 'updated_at DESC'
        );
        Response::success($data);
    }

    // GET /api/contents/{id}
    public function show($params,$input) {
        AuthMiddleware::handle();
        $c = $this->model->findById($params['id']);
        if (!$c) Response::notFound('Content not found');
        $this->model->incrementViews($params['id']);
        Response::success($c);
    }

    // POST /api/contents
    public function store($params,$input) {
        AuthMiddleware::requireRole('moderator');
        $input['slug'] = strtolower(trim($input['title']));
        $id = $this->model->create($input);
        $c = $this->model->findById($id);
        Response::success($c,'Created',201);
    }

    // PATCH /api/contents/{id}
    public function update($params,$input) {
        AuthMiddleware::requireRole('moderator');
        $this->model->update($params['id'],$input);
        $c = $this->model->findById($params['id']);
        Response::success($c,'Updated');
    }

    // DELETE /api/contents/{id}
    public function delete($params,$input) {
        AuthMiddleware::requireRole('moderator');
        $this->model->delete($params['id']);
        Response::success(null,'Deleted');
    }
}