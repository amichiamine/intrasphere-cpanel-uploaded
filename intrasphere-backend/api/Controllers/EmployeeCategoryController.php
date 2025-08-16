<?php
/**
 * Contrôleur EmployeeCategory pour IntraSphere
 */

class EmployeeCategoryController {
    private $model;

    public function __construct() {
        $this->model = new EmployeeCategory();
    }

    public function index($p,$i) {
        AuthMiddleware::requireRole('moderator');
        $cats = $this->model->getActive();
        Response::success($cats);
    }

    public function show($p,$i) {
        AuthMiddleware::requireRole('moderator');
        $cat = $this->model->findById($p['id']);
        if(!$cat) Response::notFound('Not found');
        $cat['count'] = $this->model->getEmployeeCount($p['id']);
        Response::success($cat);
    }
}