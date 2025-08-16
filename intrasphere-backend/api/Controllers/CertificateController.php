<?php
/**
 * Contrôleur Certificate pour IntraSphere
 */

class CertificateController {
    private $model;

    public function __construct() {
        $this->model = new Certificate();
    }

    public function myCertificates($p,$i) {
        AuthMiddleware::handle();
        $user = AuthMiddleware::getCurrentUser();
        $certs = $this->model->getUserCertificates($user['id']);
        Response::success($certs);
    }

    public function generate($p,$i) {
        AuthMiddleware::requireRole('moderator');
        $id = $this->model->generate($i['user_id'],$i['course_id'],$i['course_name']);
        Response::success(['id'=>$id],'Generated',201);
    }
}