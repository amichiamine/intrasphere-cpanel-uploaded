<?php
/**
 * Modèle Permission pour IntraSphere
 */

require_once __DIR__ . '/BaseModel.php';

class Permission extends BaseModel {
    protected $table = 'permissions';

    public function getUserPermissions($userId) {
        return $this->findWhere('user_id = ?', [$userId]);
    }

    public function has($userId, $perm) {
        $r = $this->db->selectOne(
            "SELECT COUNT(*) as c FROM {$this->table} WHERE user_id=? AND permission=?",
            [$userId, $perm]
        );
        return $r['c'] > 0;
    }
}