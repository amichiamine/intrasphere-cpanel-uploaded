<?php
/**
 * FileService pour IntraSphere
 * Upload, téléchargement et gestion des fichiers
 */

class FileService {
    private $uploadPath;

    public function __construct() {
        $this->uploadPath = __DIR__ . '/../../public/uploads';
    }

    public function uploadFile($file, $subdir = '') {
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $allowed = explode(',', $_ENV['ALLOWED_EXTENSIONS'] ?? '');
        if (!in_array(strtolower($ext), $allowed)) {
            return ['success'=>false,'message'=>'Invalid file type'];
        }
        $maxSize = intval($_ENV['MAX_FILE_SIZE'] ?? 10485760);
        if ($file['size'] > $maxSize) {
            return ['success'=>false,'message'=>'File too large'];
        }
        $dir = $this->uploadPath . ($subdir ? "/$subdir" : '');
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $filename = uniqid() . '-' . basename($file['name']);
        $path = "$dir/$filename";
        if (!move_uploaded_file($file['tmp_name'], $path)) {
            return ['success'=>false,'message'=>'Upload failed'];
        }
        $url = $_ENV['APP_URL'] . "/public/uploads" . ($subdir ? "/$subdir" : '') . "/$filename";
        return ['success'=>true,'filename'=>$filename,'url'=>$url,'size'=>$file['size']];
    }

    public function downloadFile($filePath, $downloadName = null) {
        if (!file_exists($filePath)) {
            Response::notFound('File not found');
        }
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . ($downloadName ?: basename($filePath)) . '"');
        header('Content-Length: ' . filesize($filePath));
        readfile($filePath);
        exit();
    }

    public function deleteFile($filePath) {
        return file_exists($filePath) ? unlink($filePath) : false;
    }

    public function getUploadPath() {
        return $this->uploadPath;
    }
}