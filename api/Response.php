<?php

class Response {
    
    public static function success($data = null, $message = 'Success', $status = 200) {
        self::output([
            'success' => true,
            'status' => $status,
            'message' => $message,
            'data' => $data
        ], $status);
    }
    
    public static function error($message = 'Error', $status = 500, $data = null) {
        self::output([
            'success' => false,
            'status' => $status,
            'message' => $message,
            'data' => $data
        ], $status);
    }
    
    // AJOUTER CETTE MÉTHODE
    public static function notFound($message = 'Not Found') {
        self::output([
            'success' => false,
            'status' => 404,
            'message' => $message,
            'data' => null
        ], 404);
    }
    
    private static function output($data, $statusCode) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
