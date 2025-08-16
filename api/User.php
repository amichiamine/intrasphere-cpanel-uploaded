<?php
/**
 * Modèle User pour IntraSphere
 */

require_once __DIR__ . '/BaseModel.php';

class User extends BaseModel {
    protected $table = 'users';

    public function findByUsername($username) {
        return $this->db->selectOne(
            "SELECT * FROM {$this->table} WHERE username = ?",
            [$username]
        );
    }

    public function findByEmail($email) {
        return $this->db->selectOne(
            "SELECT * FROM {$this->table} WHERE email = ?",
            [$email]
        );
    }
}