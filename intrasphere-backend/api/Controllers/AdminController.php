<?php
/**
 * Contrôleur Administration pour IntraSphere
 */

require_once __DIR__ . '/../Models/Permission.php';

class AdminController {
    private $permissionModel;

    public function __construct() {
        $this->permissionModel = new Permission();
    }

    // GET /api/permissions
    public function permissions($params, $input) {
        AuthMiddleware::requireRole('moderator');
        $perms = $this->permissionModel->findAll();
        Response::success($perms);
    }

    // GET /api/permissions/{userId}
    public function userPermissions($params, $input) {
        AuthMiddleware::requireRole('moderator');
        $perms = $this->permissionModel->getUserPermissions($params['userId']);
        Response::success($perms);
    }

    // POST /api/permissions
    public function createPermission($params, $input) {
        AuthMiddleware::requireRole('admin');
        $current = AuthMiddleware::getCurrentUser();
        $id = $this->permissionModel->create([
            'user_id'    => $input['user_id'],
            'permission' => $input['permission'],
            'granted_by' => $current['id']
        ]);
        Response::success(['id'=>$id], 'Permission granted', 201);
    }

    // DELETE /api/permissions/{id}
    public function revokePermission($params, $input) {
        AuthMiddleware::requireRole('admin');
        $this->permissionModel->delete($params['id']);
        Response::success(null, 'Permission revoked');
    }

    // GET /api/search/users
    public function searchUsers($params, $input) {
        AuthMiddleware::handle();
        $q = $input['q'] ?? '';
        if (strlen($q)<3) Response::error('Query too short',400);
        $res = $this->permissionModel->db->select(
            "SELECT id,username,name,email FROM users WHERE username LIKE ? OR name LIKE ? LIMIT 20",
            ["%$q%","%$q%"]
        );
        Response::success($res);
    }

    // GET /api/search/content
    public function searchContent($params, $input) {
        AuthMiddleware::handle();
        $q = $input['q'] ?? '';
        if (strlen($q)<3) Response::error('Query too short',400);
        $ann = $this->permissionModel->db->select("SELECT * FROM announcements WHERE title LIKE ? LIMIT 10",["%$q%"]);
        $doc = $this->permissionModel->db->select("SELECT * FROM documents WHERE title LIKE ? LIMIT 10",["%$q%"]);
        Response::success(['announcements'=>$ann,'documents'=>$doc]);
    }
}