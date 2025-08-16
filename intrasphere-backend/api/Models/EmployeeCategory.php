<?php
/**
 * Modèle EmployeeCategory pour IntraSphere
 */

require_once __DIR__ . '/BaseModel.php';

class EmployeeCategory extends BaseModel {
    protected $table = 'employee_categories';

    public function getActive() {
        return $this->findWhere('is_active = 1', [], null, 0, 'level ASC,name ASC');
    }

    public function getEmployeeCount($categoryId) {
        $res = $this->db->selectOne(
            "SELECT COUNT(*) as count FROM users WHERE employee_category_id = ?",
            [$categoryId]
        );
        return $res['count'];
    }
}