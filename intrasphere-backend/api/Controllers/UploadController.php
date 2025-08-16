<?php
require_once __DIR__ . '/../Services/FileService.php';

class UploadController {
    private $service;

    public function __construct() {
        $this->service = new FileService();
    }

    // POST /api/upload
    public function upload($params,$input) {
        AuthMiddleware::handle();
        $res = $this->service->uploadFile($_FILES['file'] ?? []);
        if (!$res['success']) Response::error($res['message'],400);
        Response::success($res,'Uploaded',201);
    }

    // GET /api/files/{filename}
    public function getFile($params,$input) {
        $path = $this->service->getUploadPath() . '/' . $params['filename'];
        $this->service->downloadFile($path);
    }

    // DELETE /api/files/{filename}
    public function delete($params,$input) {
        AuthMiddleware::requireRole('admin');
        $path = $this->service->getUploadPath() . '/' . $params['filename'];
        if (!$this->service->deleteFile($path)) {
            Response::error('Deletion failed',500);
        }
        Response::success(null,'Deleted');
    }
}