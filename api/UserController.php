<?php
/**
 * Contrôleur des utilisateurs
 */

class UserController {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    // GET /api/users
    public function index($params, $input) {
        AuthMiddleware::requireRole('moderator');
        $page = (int)($input['page'] ?? 1);
        $limit = (int)($input['limit'] ?? 20);
        $data = $this->userModel->paginate($page, $limit);
        Response::success($data);
    }

    // GET /api/users/{id}
    public function show($params, $input) {
        AuthMiddleware::requireRole('moderator');
        $user = $this->userModel->findById($params['id']);
        if (!$user) {
            Response::notFound('User not found');
        }
        unset($user['password']);
        Response::success($user);
    }

    // POST /api/users
    public function store($params, $input) {
        AuthMiddleware::requireRole('admin');
        $input['password'] = password_hash($input['password'], PASSWORD_BCRYPT);
        $id = $this->userModel->create($input);
        $user = $this->userModel->findById($id);
        unset($user['password']);
        Response::success($user, 'User created', 201);
    }

    // PATCH /api/users/{id}
    public function update($params, $input) {
        AuthMiddleware::requireRole('admin');
        $data = [];
        foreach (['name','email','role','department','position'] as $f) {
            if (isset($input[$f])) $data[$f] = $input[$f];
        }
        $this->userModel->update($params['id'], $data);
        $user = $this->userModel->findById($params['id']);
        unset($user['password']);
        Response::success($user, 'User updated');
    }

    // DELETE /api/users/{id}
    public function delete($params, $input) {
        AuthMiddleware::requireRole('admin');
        $this->userModel->delete($params['id']);
        Response::success(null, 'User deleted');
    }

    // PUT /api/users/{id}/status
    public function updateStatus($params, $input) {
        AuthMiddleware::requireRole('admin');
        $this->userModel->update($params['id'], ['is_active'=> (bool)$input['is_active']]);
        Response::success(null, 'Status updated');
    }

    // PUT /api/users/{id}/password
    public function changePassword($params, $input) {
        AuthMiddleware::requireRole('moderator');
        $hashed = password_hash($input['password'], PASSWORD_BCRYPT);
        $this->userModel->update($params['id'], ['password'=>$hashed]);
        Response::success(null, 'Password changed');
    }
}